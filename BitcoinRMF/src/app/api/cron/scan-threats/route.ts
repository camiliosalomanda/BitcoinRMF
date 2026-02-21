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
import { publishToX, formatThreatPost } from '@/lib/x-posting';
import { processCVECorrelations } from '@/lib/cve-correlation';

export const maxDuration = 300;

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

  // ?reprocess-only=true: just process remaining unprocessed CVE signals (no fetch, no delete)
  if (request.nextUrl.searchParams.get('reprocess-only') === 'true') {
    try {
      const batchSize = Math.min(parseInt(request.nextUrl.searchParams.get('batch') || '2', 10) || 2, 10);
      const { data: storedSignals } = await supabase
        .from('external_signals')
        .select('*')
        .eq('source', 'nvd')
        .not('cve_id', 'is', null)
        .is('vulnerability_id', null);

      let cveResult = { processed: 0, vulnerabilitiesCreated: 0, bipsQueued: 0, xPosted: 0, errors: [] as string[] };
      if (storedSignals && storedSignals.length > 0) {
        const batch = storedSignals.slice(0, batchSize);
        const correlationInput = batch.map((s: Record<string, unknown>) => ({
          source: s.source as 'nvd',
          externalId: s.external_id as string,
          sourceUrl: (s.source_url as string) || '',
          title: s.title as string,
          description: (s.description as string) || '',
          severity: (s.severity as ExternalThreatSignal['severity']) || 'unknown',
          publishedDate: (s.published_date as string) || '',
          relatedBIPs: (s.related_bips as string[]) || [],
          cveId: s.cve_id as string,
        }));
        cveResult = await processCVECorrelations(supabase, correlationInput);
      }

      const remaining = Math.max(0, (storedSignals?.length || 0) - batchSize);
      return NextResponse.json({
        cveCorrelation: {
          processed: cveResult.processed,
          vulnerabilitiesCreated: cveResult.vulnerabilitiesCreated,
          bipsQueued: cveResult.bipsQueued,
          errors: cveResult.errors.length,
          remaining,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return NextResponse.json({ error: `Reprocess failed: ${message}` }, { status: 500 });
    }
  }

  // ?reset-cve=true: standalone cleanup + re-correlation (skips signal fetch)
  if (request.nextUrl.searchParams.get('reset-cve') === 'true') {
    try {
      // Delete junction rows linking CVE vulns to threats
      const { data: cveVulns } = await supabase
        .from('vulnerabilities')
        .select('id')
        .eq('submitted_by', 'system:nvd-scanner');

      let deleted = 0;
      if (cveVulns && cveVulns.length > 0) {
        deleted = cveVulns.length;
        const vulnIds = cveVulns.map((v: { id: string }) => v.id);
        await supabase
          .from('threat_vulnerabilities')
          .delete()
          .in('vulnerability_id', vulnIds);

        // Remove from denormalized vulnerability_ids on threats
        const { data: linkedThreats } = await supabase
          .from('threats')
          .select('id, vulnerability_ids')
          .not('vulnerability_ids', 'is', null);

        if (linkedThreats) {
          for (const threat of linkedThreats) {
            const ids = (threat.vulnerability_ids as string[]) || [];
            const filtered = ids.filter((id: string) => !vulnIds.includes(id));
            if (filtered.length !== ids.length) {
              await supabase
                .from('threats')
                .update({ vulnerability_ids: filtered })
                .eq('id', threat.id);
            }
          }
        }

        // Delete the CVE vulnerabilities
        await supabase
          .from('vulnerabilities')
          .delete()
          .eq('submitted_by', 'system:nvd-scanner');
      }

      // Reset external_signals so they get reprocessed
      await supabase
        .from('external_signals')
        .update({ vulnerability_id: null, processed: false })
        .eq('source', 'nvd')
        .not('cve_id', 'is', null);

      // Reprocess first batch
      const { data: storedSignals } = await supabase
        .from('external_signals')
        .select('*')
        .eq('source', 'nvd')
        .not('cve_id', 'is', null)
        .is('vulnerability_id', null);

      let cveResult = { processed: 0, vulnerabilitiesCreated: 0, bipsQueued: 0, xPosted: 0, errors: [] as string[] };
      if (storedSignals && storedSignals.length > 0) {
        const batch = storedSignals.slice(0, 5);
        const correlationInput = batch.map((s: Record<string, unknown>) => ({
          source: s.source as 'nvd',
          externalId: s.external_id as string,
          sourceUrl: (s.source_url as string) || '',
          title: s.title as string,
          description: (s.description as string) || '',
          severity: (s.severity as ExternalThreatSignal['severity']) || 'unknown',
          publishedDate: (s.published_date as string) || '',
          relatedBIPs: (s.related_bips as string[]) || [],
          cveId: s.cve_id as string,
        }));
        cveResult = await processCVECorrelations(supabase, correlationInput);
      }

      const remaining = (storedSignals?.length || 0) - Math.min(storedSignals?.length || 0, 30);
      return NextResponse.json({
        resetCve: { deleted, signalsReset: storedSignals?.length || 0 },
        cveCorrelation: {
          processed: cveResult.processed,
          vulnerabilitiesCreated: cveResult.vulnerabilitiesCreated,
          bipsQueued: cveResult.bipsQueued,
          errors: cveResult.errors.length,
          remaining,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return NextResponse.json({ error: `CVE reset failed: ${message}` }, { status: 500 });
    }
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

    // Allow ?full=true to skip "since" filter and reprocess all signals
    const fullScan = request.nextUrl.searchParams.get('full') === 'true';
    const since = (!fullScan && lastRun?.completed_at) ? new Date(lastRun.completed_at) : undefined;

    // Fetch signals from all sources
    const signals = await fetchAllThreatSignals(since);

    let inserted = 0;
    let duplicates = 0;
    let queued = 0;
    const highSeveritySignals: ExternalThreatSignal[] = [];
    const newSignals: ExternalThreatSignal[] = [];

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
          // On full scan, update severity for existing signals (fixes unknown → actual)
          if (fullScan && signal.severity !== 'unknown') {
            await supabase
              .from('external_signals')
              .update({ severity: signal.severity })
              .eq('source', signal.source)
              .eq('external_id', signal.externalId);
          }
        }
        continue;
      }

      inserted++;
      newSignals.push(signal);

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

    // CVE-to-BIP correlation: auto-create vulnerabilities from CVE signals
    // ?reprocess=true: re-run correlation on existing DB signals (not just new ones)
    let correlationInput = newSignals;
    if (request.nextUrl.searchParams.get('reprocess') === 'true') {
      const { data: storedSignals } = await supabase
        .from('external_signals')
        .select('*')
        .eq('source', 'nvd')
        .not('cve_id', 'is', null)
        .is('vulnerability_id', null);

      if (storedSignals && storedSignals.length > 0) {
        // Limit batch to avoid function timeout
        const batch = storedSignals.slice(0, 30);
        correlationInput = batch.map((s: Record<string, unknown>) => ({
          source: s.source as 'nvd',
          externalId: s.external_id as string,
          sourceUrl: (s.source_url as string) || '',
          title: s.title as string,
          description: (s.description as string) || '',
          severity: (s.severity as ExternalThreatSignal['severity']) || 'unknown',
          publishedDate: (s.published_date as string) || '',
          relatedBIPs: (s.related_bips as string[]) || [],
          cveId: s.cve_id as string,
        }));
      }
    }
    const cveResult = await processCVECorrelations(supabase, correlationInput);

    // Post critical/high severity signals to X
    let xPosted = 0;
    for (const signal of highSeveritySignals) {
      if (signal.severity === 'critical' || signal.severity === 'high') {
        const content = formatThreatPost({
          name: signal.title,
          risk_rating: signal.severity.toUpperCase(),
          severity_score: signal.severity === 'critical' ? 25 : 16,
        });
        const result = await publishToX(supabase, {
          content,
          triggerType: 'threat_signal',
          entityType: 'external_signal',
          entityId: signal.externalId,
        });
        if (result.posted) xPosted++;
      }
    }

    await logMonitoringRun(supabase, 'threat_scan', 'completed', {
      totalSignals: signals.length,
      inserted,
      duplicates,
      highSeverity: highSeveritySignals.length,
      queued,
      xPosted,
      cveCorrelation: {
        processed: cveResult.processed,
        vulnerabilitiesCreated: cveResult.vulnerabilitiesCreated,
        bipsQueued: cveResult.bipsQueued,
        xPosted: cveResult.xPosted,
        errors: cveResult.errors.length,
      },
    }, undefined, runId);

    console.log(
      `[cron/scan-threats] ${signals.length} signals fetched, ${inserted} new, ` +
      `${duplicates} duplicates, ${highSeveritySignals.length} high-severity, ${queued} BIPs queued, ` +
      `${cveResult.vulnerabilitiesCreated} CVE vulns created`
    );

    return NextResponse.json({
      totalSignals: signals.length,
      inserted,
      duplicates,
      highSeverity: highSeveritySignals.length,
      queued,
      cveCorrelation: {
        processed: cveResult.processed,
        vulnerabilitiesCreated: cveResult.vulnerabilitiesCreated,
        bipsQueued: cveResult.bipsQueued,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    await logMonitoringRun(supabase, 'threat_scan', 'failed', undefined, message, runId);
    console.error('[cron/scan-threats] Failed:', message);
    return NextResponse.json({ error: `Threat scan failed: ${message}` }, { status: 500 });
  }
}
