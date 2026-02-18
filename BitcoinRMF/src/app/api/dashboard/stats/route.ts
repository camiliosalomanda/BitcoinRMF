import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-helpers';
import { SEED_THREATS, SEED_BIPS, SEED_FUD, SEED_VULNERABILITIES } from '@/lib/seed-data';
import { deriveRisks } from '@/lib/scoring';
import type { DashboardStats } from '@/types';
import { RiskRating, VulnerabilityStatus } from '@/types';

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
    const vulnerabilities = SEED_VULNERABILITIES;

    const activeRemediations =
      threats.reduce(
        (sum, t) =>
          sum +
          t.remediationStrategies.filter(
            (r) => r.status === 'IN_PROGRESS' || r.status === 'PLANNED'
          ).length,
        0
      ) +
      vulnerabilities.reduce(
        (sum, v) =>
          sum +
          v.remediationStrategies.filter(
            (r) => r.status === 'IN_PROGRESS' || r.status === 'PLANNED'
          ).length,
        0
      );
    const risks = deriveRisks(threats, vulnerabilities);
    const criticalHighRiskCount = risks.filter(
      (r) => r.riskRating === RiskRating.CRITICAL || r.riskRating === RiskRating.HIGH
    ).length;

    const stats: DashboardStats = {
      totalThreats: threats.length,
      criticalHighCount,
      averageSeverity: threats.length > 0 ? Math.round((totalSeverity / threats.length) * 10) / 10 : 0,
      activeRemediations,
      bipsPending: bips.filter((b) => b.status === 'PROPOSED' || b.status === 'DRAFT').length,
      activeFUD: fudAnalyses.filter((f) => f.status === 'ACTIVE').length,
      mitigatedThreats: threats.filter((t) => t.status === 'MITIGATED').length,
      monitoringThreats: threats.filter((t) => t.status === 'MONITORING').length,
      totalVulnerabilities: vulnerabilities.length,
      totalRisks: risks.length,
      criticalHighRiskCount,
      patchedVulnerabilities: vulnerabilities.filter((v) => v.status === VulnerabilityStatus.PATCHED).length,
    };

    return NextResponse.json(stats);
  }

  // Fetch from Supabase
  const [threatsRes, bipsRes, fudRes, vulnsRes] = await Promise.all([
    supabase.from('threats').select('*').eq('status', 'published'),
    supabase.from('bip_evaluations').select('*').eq('status', 'published'),
    supabase.from('fud_analyses').select('*').eq('status', 'published'),
    supabase.from('vulnerabilities').select('*').eq('status', 'published'),
  ]);

  const threats = threatsRes.data || [];
  const bips = bipsRes.data || [];
  const fud = fudRes.data || [];
  const vulns = vulnsRes.data || [];

  const criticalHighCount = threats.filter(
    (t) => t.risk_rating === 'CRITICAL' || t.risk_rating === 'HIGH'
  ).length;
  const totalSeverity = threats.reduce((sum, t) => sum + (t.severity_score || 0), 0);
  const activeRemediations =
    threats.reduce((sum, t) => {
      const strats = (t.remediation_strategies as Array<{ status: string }>) || [];
      return sum + strats.filter((r) => r.status === 'IN_PROGRESS' || r.status === 'PLANNED').length;
    }, 0) +
    vulns.reduce((sum, v) => {
      const strats = ((v as { remediation_strategies?: Array<{ status: string }> }).remediation_strategies) || [];
      return sum + strats.filter((r) => r.status === 'IN_PROGRESS' || r.status === 'PLANNED').length;
    }, 0);

  // Compute risk counts from threat-vulnerability pairings
  let totalRisks = 0;
  let criticalHighRiskCount = 0;
  for (const t of threats) {
    const vulnIds = (t.vulnerability_ids as string[]) || [];
    for (const vid of vulnIds) {
      const v = vulns.find((vv: { id: string }) => vv.id === vid);
      if (!v) continue;
      totalRisks++;
      const score = (t.likelihood as number) * ((v as { severity: number }).severity);
      if (score >= 12) criticalHighRiskCount++;
    }
  }

  const stats: DashboardStats = {
    totalThreats: threats.length,
    criticalHighCount,
    averageSeverity: threats.length > 0 ? Math.round((totalSeverity / threats.length) * 10) / 10 : 0,
    activeRemediations,
    bipsPending: bips.filter((b) => b.bip_status === 'PROPOSED' || b.bip_status === 'DRAFT').length,
    activeFUD: fud.filter((f) => f.fud_status === 'ACTIVE').length,
    mitigatedThreats: threats.filter((t) => t.rmf_status === 'MITIGATED').length,
    monitoringThreats: threats.filter((t) => t.rmf_status === 'MONITORING').length,
    totalVulnerabilities: vulns.length,
    totalRisks,
    criticalHighRiskCount,
    patchedVulnerabilities: vulns.filter((v: { vuln_status: string }) => v.vuln_status === 'PATCHED').length,
  };

  return NextResponse.json(stats);
}
