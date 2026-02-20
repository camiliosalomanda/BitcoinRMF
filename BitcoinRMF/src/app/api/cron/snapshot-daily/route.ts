import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-helpers';
import { verifyCronAuth, logMonitoringRun } from '@/lib/pipeline';
import { publishToX, formatWeeklySummaryPost } from '@/lib/x-posting';
import type { DashboardStats } from '@/types';

/**
 * GET /api/cron/snapshot-daily
 * Runs daily at midnight UTC. Snapshots current dashboard stats into risk_snapshots.
 * On Mondays, posts a weekly summary to X.
 */
export async function GET(request: NextRequest) {
  if (!verifyCronAuth(request.headers.get('authorization'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const runId = await logMonitoringRun(supabase, 'daily_snapshot', 'started');

  try {
    // Compute stats (same logic as /api/dashboard/stats)
    const [threatsRes, bipsRes, fudRes, vulnsRes, junctionRes] = await Promise.all([
      supabase.from('threats').select('*').eq('status', 'published'),
      supabase.from('bip_evaluations').select('*').eq('status', 'published'),
      supabase.from('fud_analyses').select('*').eq('status', 'published'),
      supabase.from('vulnerabilities').select('*').eq('status', 'published'),
      supabase.from('threat_vulnerabilities').select('threat_id, vulnerability_id'),
    ]);

    const threats = threatsRes.data || [];
    const bips = bipsRes.data || [];
    const fud = fudRes.data || [];
    const vulns = vulnsRes.data || [];
    const junctionRows = junctionRes.data || [];

    const criticalHighCount = threats.filter(
      (t) => t.risk_rating === 'CRITICAL' || t.risk_rating === 'HIGH'
    ).length;
    const totalSeverity = threats.reduce((sum, t) => sum + (t.severity_score || 0), 0);

    const activeRemediations = vulns.reduce((sum, v) => {
      const strats = ((v as { remediation_strategies?: Array<{ status: string }> }).remediation_strategies) || [];
      return sum + strats.length;
    }, 0);

    // Build junction map
    const junctionMap = new Map<string, string[]>();
    for (const row of junctionRows) {
      const existing = junctionMap.get(row.threat_id) || [];
      existing.push(row.vulnerability_id);
      junctionMap.set(row.threat_id, existing);
    }

    let totalRisks = 0;
    let criticalHighRiskCount = 0;
    for (const t of threats) {
      const denormalizedIds = (t.vulnerability_ids as string[]) || [];
      const junctionIds = junctionMap.get(t.id as string) || [];
      const allVulnIds = [...new Set([...denormalizedIds, ...junctionIds])];

      for (const vid of allVulnIds) {
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

    // Insert snapshot (upsert for idempotency)
    const today = new Date().toISOString().split('T')[0];
    const { error: snapshotError } = await supabase
      .from('risk_snapshots')
      .upsert(
        { snapshot_date: today, stats },
        { onConflict: 'snapshot_date' }
      );

    if (snapshotError) {
      throw new Error(`Snapshot insert failed: ${snapshotError.message}`);
    }

    // On Mondays (UTC day === 1), post weekly summary to X
    let weeklyPosted = false;
    const dayOfWeek = new Date().getUTCDay();
    if (dayOfWeek === 1) {
      // Get last week's snapshot for comparison
      const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const { data: prevSnapshot } = await supabase
        .from('risk_snapshots')
        .select('stats')
        .eq('snapshot_date', lastWeek)
        .single();

      const prevStats = prevSnapshot?.stats as DashboardStats | undefined;
      const content = formatWeeklySummaryPost(stats, prevStats);

      const result = await publishToX(supabase, {
        content,
        triggerType: 'weekly_summary',
        entityType: 'snapshot',
        entityId: today,
      });

      weeklyPosted = result.posted;
    }

    await logMonitoringRun(supabase, 'daily_snapshot', 'completed', {
      date: today,
      stats,
      weeklyPosted,
    }, undefined, runId);

    console.log(`[cron/snapshot-daily] Snapshot saved for ${today}${weeklyPosted ? ', weekly summary posted to X' : ''}`);

    return NextResponse.json({
      date: today,
      stats,
      weeklyPosted,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    await logMonitoringRun(supabase, 'daily_snapshot', 'failed', undefined, message, runId);
    console.error('[cron/snapshot-daily] Failed:', message);
    return NextResponse.json({ error: `Snapshot failed: ${message}` }, { status: 500 });
  }
}
