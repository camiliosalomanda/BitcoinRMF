import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-helpers';
import {
  verifyCronAuth,
  logMonitoringRun,
  queueReEvaluations,
  findAffectedBIPs,
} from '@/lib/pipeline';
import type { ReEvalTrigger } from '@/lib/pipeline';
import { fetchAllThreatSignals } from '@/lib/threat-sources';
import type { ExternalThreatSignal } from '@/lib/threat-sources';

/**
 * GET /api/cron/scan-threats
 * Runs every 4 hours. Fetches signals from NVD, GitHub, and Optech.
 * New signals are stored in external_signals. Medium+ severity signals
 * queue affected BIPs for re-evaluation.
 */
export async function GET(request: NextRequest) {
  if (!verifyCronAuth(request.headers.get('authorization'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const runId = await logMonitoringRun(supabase, 'threat_scan', 'started');

  try {
    // Determine "since" from last successful run
    const { data: lastRun } = await supabase
      .from('monitoring_runs')
      .select('completed_at')
      .eq('pipeline', 'threat_scan')
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(1)
      .single();

    const since = lastRun?.completed_at ? new Date(lastRun.completed_at) : undefined;

    // Fetch signals from all sources
    const signals = await fetchAllThreatSignals(since);

    let inserted = 0;
    let duplicates = 0;
    let queued = 0;
    const highSeveritySignals: ExternalThreatSignal[] = [];

    // Store signals and deduplicate
    for (const signal of signals) {
      const { error } = await supabase
        .from('external_signals')
        .insert({
          source: signal.source,
          external_id: signal.externalId,
          source_url: signal.sourceUrl,
          title: signal.title,
          description: signal.description,
          severity: signal.severity,
          published_date: signal.publishedDate,
          related_bips: signal.relatedBIPs,
          cve_id: signal.cveId || null,
        });

      if (error) {
        // Unique constraint violation = duplicate
        if (error.code === '23505') {
          duplicates++;
        }
        continue;
      }

      inserted++;

      // Track medium+ severity for BIP re-evaluation
      const severityRank = { critical: 4, high: 3, medium: 2, low: 1, unknown: 0 };
      if (severityRank[signal.severity] >= 2) {
        highSeveritySignals.push(signal);
      }
    }

    // Queue re-evaluations for BIPs referenced by high-severity signals
    if (highSeveritySignals.length > 0) {
      const allBipRefs = [...new Set(highSeveritySignals.flatMap((s) => s.relatedBIPs))];
      if (allBipRefs.length > 0) {
        const affectedBIPs = await findAffectedBIPs(supabase, allBipRefs);
        if (affectedBIPs.length > 0) {
          const triggers: ReEvalTrigger[] = affectedBIPs.map((bip) => ({
            bipId: bip.id,
            bipNumber: bip.bipNumber,
            reason: 'new_threat' as const,
            details: `External threat signal(s) detected referencing this BIP`,
            priority: 1,
          }));
          queued = await queueReEvaluations(supabase, triggers);
        }
      }
    }

    await logMonitoringRun(supabase, 'threat_scan', 'completed', {
      totalSignals: signals.length,
      inserted,
      duplicates,
      highSeverity: highSeveritySignals.length,
      queued,
    }, undefined, runId);

    console.log(
      `[cron/scan-threats] ${signals.length} signals fetched, ${inserted} new, ` +
      `${duplicates} duplicates, ${highSeveritySignals.length} high-severity, ${queued} BIPs queued`
    );

    return NextResponse.json({
      totalSignals: signals.length,
      inserted,
      duplicates,
      highSeverity: highSeveritySignals.length,
      queued,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    await logMonitoringRun(supabase, 'threat_scan', 'failed', undefined, message, runId);
    console.error('[cron/scan-threats] Failed:', message);
    return NextResponse.json({ error: `Threat scan failed: ${message}` }, { status: 500 });
  }
}
