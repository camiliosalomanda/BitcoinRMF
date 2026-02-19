import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-helpers';
import { verifyCronAuth, processReEvalQueue, logMonitoringRun } from '@/lib/pipeline';

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

    await logMonitoringRun(supabase, 'reeval', 'completed', {
      processed: result.processed,
      succeeded: result.succeeded,
      failed: result.failed,
      skipped: result.skipped,
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
