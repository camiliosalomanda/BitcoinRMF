import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-helpers';
import { SEED_THREATS, SEED_BIPS, SEED_FUD } from '@/lib/seed-data';
import type { DashboardStats } from '@/types';
import { RiskRating } from '@/types';

export async function GET() {
  const supabase = await getSupabaseAdmin();

  if (!supabase) {
    // Compute from seed data
    const threats = SEED_THREATS;
    const bips = SEED_BIPS;
    const fudAnalyses = SEED_FUD;

    const criticalHighCount = threats.filter(
      (t) => t.riskRating === RiskRating.CRITICAL || t.riskRating === RiskRating.HIGH
    ).length;
    const totalSeverity = threats.reduce((sum, t) => sum + t.severityScore, 0);
    const activeRemediations = threats.reduce(
      (sum, t) =>
        sum +
        t.remediationStrategies.filter(
          (r) => r.status === 'IN_PROGRESS' || r.status === 'PLANNED'
        ).length,
      0
    );

    const stats: DashboardStats = {
      totalThreats: threats.length,
      criticalHighCount,
      averageSeverity: threats.length > 0 ? Math.round((totalSeverity / threats.length) * 10) / 10 : 0,
      activeRemediations,
      bipsPending: bips.filter((b) => b.status === 'PROPOSED' || b.status === 'DRAFT').length,
      activeFUD: fudAnalyses.filter((f) => f.status === 'ACTIVE').length,
      mitigatedThreats: threats.filter((t) => t.status === 'MITIGATED').length,
      monitoringThreats: threats.filter((t) => t.status === 'MONITORING').length,
    };

    return NextResponse.json(stats);
  }

  // Fetch from Supabase
  const [threatsRes, bipsRes, fudRes] = await Promise.all([
    supabase.from('threats').select('*').eq('status', 'published'),
    supabase.from('bip_evaluations').select('*').eq('status', 'published'),
    supabase.from('fud_analyses').select('*').eq('status', 'published'),
  ]);

  const threats = threatsRes.data || [];
  const bips = bipsRes.data || [];
  const fud = fudRes.data || [];

  const criticalHighCount = threats.filter(
    (t) => t.risk_rating === 'CRITICAL' || t.risk_rating === 'HIGH'
  ).length;
  const totalSeverity = threats.reduce((sum, t) => sum + (t.severity_score || 0), 0);
  const activeRemediations = threats.reduce((sum, t) => {
    const strats = (t.remediation_strategies as Array<{ status: string }>) || [];
    return sum + strats.filter((r) => r.status === 'IN_PROGRESS' || r.status === 'PLANNED').length;
  }, 0);

  const stats: DashboardStats = {
    totalThreats: threats.length,
    criticalHighCount,
    averageSeverity: threats.length > 0 ? Math.round((totalSeverity / threats.length) * 10) / 10 : 0,
    activeRemediations,
    bipsPending: bips.filter((b) => b.bip_status === 'PROPOSED' || b.bip_status === 'DRAFT').length,
    activeFUD: fud.filter((f) => f.fud_status === 'ACTIVE').length,
    mitigatedThreats: threats.filter((t) => t.rmf_status === 'MITIGATED').length,
    monitoringThreats: threats.filter((t) => t.rmf_status === 'MONITORING').length,
  };

  return NextResponse.json(stats);
}
