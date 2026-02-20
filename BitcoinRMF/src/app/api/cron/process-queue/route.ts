import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-helpers';
import { verifyCronAuth, processReEvalQueue, logMonitoringRun } from '@/lib/pipeline';
import { publishToX, formatBIPEvaluatedPost } from '@/lib/x-posting';

/**
 * GET /api/cron/process-queue
 * Hourly cron: processes up to REEVAL_BATCH_SIZE BIPs from the re-evaluation queue.
 * Respects REEVAL_MAX_DAILY budget cap.
 */
export async function GET(request: NextRequest) {
  if (!verifyCronAuth(request.headers.get('authorization'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const runId = await logMonitoringRun(supabase, 'reeval', 'started');

  try {
    const result = await processReEvalQueue(supabase);

    // Post successful BIP evaluations to X
    let xPosted = 0;
    for (const item of result.results) {
      if (item.success && item.bipNumber) {
        // Fetch the updated BIP to get recommendation and score
        const { data: bip } = await supabase
          .from('bip_evaluations')
          .select('bip_number, recommendation, necessity_score')
          .eq('bip_number', item.bipNumber)
          .single();

        if (bip) {
          const content = formatBIPEvaluatedPost({
            bip_number: bip.bip_number,
            recommendation: bip.recommendation ?? undefined,
            necessity_score: bip.necessity_score ?? undefined,
          });
          const postResult = await publishToX(supabase, {
            content,
            triggerType: 'bip_evaluation',
            entityType: 'bip',
            entityId: item.bipId,
          });
          if (postResult.posted) xPosted++;
        }
      }
    }

    await logMonitoringRun(supabase, 'reeval', 'completed', {
      processed: result.processed,
      succeeded: result.succeeded,
      failed: result.failed,
      skipped: result.skipped,
      xPosted,
    }, undefined, runId);

    console.log(
      `[cron/process-queue] ${result.succeeded} succeeded, ${result.failed} failed, ${result.skipped} skipped`
    );

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    await logMonitoringRun(supabase, 'reeval', 'failed', undefined, message, runId);
    console.error('[cron/process-queue] Failed:', message);
    return NextResponse.json({ error: `Queue processing failed: ${message}` }, { status: 500 });
  }
}
