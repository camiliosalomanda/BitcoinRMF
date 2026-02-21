import { NextRequest, NextResponse } from 'next/server';
import { TwitterApi } from 'twitter-api-v2';
import { getSupabaseAdmin } from '@/lib/supabase-helpers';
import { verifyCronAuth } from '@/lib/pipeline';
import { isXPostingEnabled, publishToX, formatWeeklySummaryPost } from '@/lib/x-posting';
import type { DashboardStats } from '@/types';

/**
 * POST /api/admin/x-setup
 * One-time setup: updates @BitcoinRMF profile and optionally posts a risk summary.
 * Auth: CRON_SECRET bearer token (same as cron routes).
 *
 * Query params:
 *   ?profile=true  — update X profile (name, bio, url, location)
 *   ?post=true     — post a risk summary to X
 *   (both default to true if no params specified)
 */
export async function POST(request: NextRequest) {
  if (!verifyCronAuth(request.headers.get('authorization'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isXPostingEnabled()) {
    return NextResponse.json({ error: 'X posting is not enabled' }, { status: 400 });
  }

  // ?delete=id1,id2,... — delete tweets by ID
  const deleteIds = request.nextUrl.searchParams.get('delete');
  if (deleteIds) {
    const client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY!,
      appSecret: process.env.TWITTER_API_SECRET!,
      accessToken: process.env.TWITTER_ACCESS_TOKEN!,
      accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET!,
    });
    const ids = deleteIds.split(',').map((s) => s.trim());
    const results: Record<string, string> = {};
    for (const id of ids) {
      try {
        await client.v2.deleteTweet(id);
        results[id] = 'deleted';
      } catch (err) {
        results[id] = err instanceof Error ? err.message : 'failed';
      }
    }
    return NextResponse.json({ deleted: results });
  }

  const doProfile = request.nextUrl.searchParams.get('profile') !== 'false';
  const doPost = request.nextUrl.searchParams.get('post') !== 'false';

  const results: Record<string, unknown> = {};

  // --- Update X profile ---
  if (doProfile) {
    try {
      const client = new TwitterApi({
        appKey: process.env.TWITTER_API_KEY!,
        appSecret: process.env.TWITTER_API_SECRET!,
        accessToken: process.env.TWITTER_ACCESS_TOKEN!,
        accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET!,
      });

      await client.v1.updateAccountProfile({
        name: 'Bitcoin Risk Framework',
        description:
          'Institutional-grade Bitcoin risk intelligence. ' +
          'NIST RMF + STRIDE + FAIR threat analysis. ' +
          'CVE tracking, BIP evaluations, FUD debunking. ' +
          'Automated alerts.',
        url: 'https://bitcoinrmf.com',
        location: 'The Blockchain',
      });

      results.profile = { updated: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      results.profile = { updated: false, error: message };
    }
  }

  // --- Post risk summary ---
  if (doPost) {
    const supabase = await getSupabaseAdmin();
    if (!supabase) {
      results.post = { posted: false, error: 'Database not configured' };
      return NextResponse.json(results);
    }

    try {
      // Compute current stats (same as snapshot-daily)
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

      // Build junction map for risk counting
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

      // Get previous week's snapshot for delta
      const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const { data: prevSnapshot } = await supabase
        .from('risk_snapshots')
        .select('stats')
        .eq('snapshot_date', lastWeek)
        .single();

      const prevStats = prevSnapshot?.stats as DashboardStats | undefined;
      const content = formatWeeklySummaryPost(stats, prevStats);

      const postResult = await publishToX(supabase, {
        content,
        triggerType: 'admin_summary',
        entityType: 'admin',
        entityId: `manual-${Date.now()}`,
      });

      results.post = { ...postResult, content };
      results.stats = stats;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      results.post = { posted: false, error: message };
    }
  }

  return NextResponse.json(results);
}
