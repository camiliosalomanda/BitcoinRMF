import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-helpers';
import { verifyCronAuth, logMonitoringRun } from '@/lib/pipeline';
import { fetchAllFUDSignals } from '@/lib/fud-sources';
import type { FUDSignal } from '@/lib/fud-sources';

/**
 * GET /api/cron/scan-fud
 * Runs every 2 hours. Fetches FUD signals from Reddit (and Twitter when configured).
 * New high-engagement FUD signals are stored in external_signals.
 * Matching existing FUD narratives get their last_seen updated.
 */
export async function GET(request: NextRequest) {
  if (!verifyCronAuth(request.headers.get('authorization'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const runId = await logMonitoringRun(supabase, 'fud_scan', 'started');

  try {
    // Determine "since" from last successful run
    const { data: lastRun } = await supabase
      .from('monitoring_runs')
      .select('completed_at')
      .eq('pipeline', 'fud_scan')
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(1)
      .single();

    const since = lastRun?.completed_at ? new Date(lastRun.completed_at) : undefined;

    // Fetch FUD signals from all available sources
    const signals = await fetchAllFUDSignals(since);

    let inserted = 0;
    let duplicates = 0;
    let existingUpdated = 0;

    // Fetch existing FUD narratives for keyword matching
    const { data: existingFUD } = await supabase
      .from('fud_analyses')
      .select('id, narrative, category')
      .in('fud_status', ['ACTIVE', 'PARTIALLY_VALID']);

    const existingNarratives = existingFUD || [];

    for (const signal of signals) {
      // Store in external_signals for dedup
      const { error } = await supabase
        .from('external_signals')
        .insert({
          source: signal.source,
          external_id: signal.externalId,
          source_url: signal.url,
          title: signal.text.slice(0, 500),
          description: signal.text,
          severity: categorizeEngagement(signal),
          published_date: signal.publishedAt,
          related_bips: [],
        });

      if (error) {
        if (error.code === '23505') {
          duplicates++;
        }
        continue;
      }

      inserted++;

      // Check if this matches an existing FUD narrative
      const matchedNarrative = findMatchingNarrative(signal, existingNarratives);
      if (matchedNarrative) {
        // Update last_seen on existing narrative
        await supabase
          .from('fud_analyses')
          .update({ last_seen: new Date().toISOString() })
          .eq('id', matchedNarrative.id);
        existingUpdated++;
      }
    }

    await logMonitoringRun(supabase, 'fud_scan', 'completed', {
      totalSignals: signals.length,
      inserted,
      duplicates,
      existingUpdated,
      sources: {
        reddit: signals.filter((s) => s.source === 'reddit').length,
        twitter: signals.filter((s) => s.source === 'twitter').length,
      },
    }, undefined, runId);

    console.log(
      `[cron/scan-fud] ${signals.length} signals fetched, ${inserted} new, ` +
      `${duplicates} duplicates, ${existingUpdated} existing narratives updated`
    );

    return NextResponse.json({
      totalSignals: signals.length,
      inserted,
      duplicates,
      existingUpdated,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    await logMonitoringRun(supabase, 'fud_scan', 'failed', undefined, message, runId);
    console.error('[cron/scan-fud] Failed:', message);
    return NextResponse.json({ error: `FUD scan failed: ${message}` }, { status: 500 });
  }
}

// --- Helpers ---

function categorizeEngagement(signal: FUDSignal): string {
  const total = signal.engagement.likes + signal.engagement.retweets + signal.engagement.replies;
  if (total >= 10000) return 'critical';
  if (total >= 5000) return 'high';
  if (total >= 1000) return 'medium';
  return 'low';
}

function findMatchingNarrative(
  signal: FUDSignal,
  narratives: Array<{ id: string; narrative: string; category: string }>,
): { id: string } | null {
  // Simple keyword overlap: if signal keywords overlap with narrative text
  const signalLower = signal.text.toLowerCase();

  for (const narrative of narratives) {
    const narrativeLower = narrative.narrative.toLowerCase();
    const narrativeWords = narrativeLower.split(/\s+/).filter((w) => w.length > 4);

    // Count overlapping significant words
    let overlap = 0;
    for (const word of narrativeWords) {
      if (signalLower.includes(word)) overlap++;
    }

    // If >30% of narrative words appear in signal, consider it a match
    if (narrativeWords.length > 0 && overlap / narrativeWords.length > 0.3) {
      return { id: narrative.id };
    }
  }

  return null;
}
