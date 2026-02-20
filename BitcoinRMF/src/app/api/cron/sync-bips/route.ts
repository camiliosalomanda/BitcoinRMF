import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin, writeAuditLog } from '@/lib/supabase-helpers';
import { syncBIPsFromGitHub } from '@/lib/github-bips';
import { verifyCronAuth, queueReEvaluations, logMonitoringRun } from '@/lib/pipeline';
import type { ReEvalTrigger } from '@/lib/pipeline';
import { publishToX, formatBIPChangePost } from '@/lib/x-posting';

/**
 * GET /api/cron/sync-bips
 * Called by Vercel Cron (daily). Protected by CRON_SECRET.
 * Also triggers automatically when BIP data is stale (see /api/bips GET).
 * Now detects status changes and queues re-evaluations.
 */
export async function GET(request: NextRequest) {
  if (!verifyCronAuth(request.headers.get('authorization'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const runId = await logMonitoringRun(supabase, 'bip_sync', 'started');

  try {
    const results = await syncBIPsFromGitHub(supabase);

    // Queue re-evaluations for BIPs whose status changed
    let queued = 0;
    if (results.statusChanges.length > 0) {
      const triggers: ReEvalTrigger[] = results.statusChanges.map((sc) => ({
        bipId: sc.bipId,
        bipNumber: sc.bipNumber,
        reason: 'status_change' as const,
        details: `Status changed: ${sc.oldStatus} → ${sc.newStatus}`,
        priority: 1,
      }));

      queued = await queueReEvaluations(supabase, triggers);

      // Write audit log and post to X for each status change
      for (const sc of results.statusChanges) {
        await writeAuditLog(supabase, {
          entityType: 'bip',
          entityId: sc.bipId,
          action: 'status_change',
          userId: 'system:cron',
          userName: 'BIP Sync Cron',
          diff: { oldStatus: sc.oldStatus, newStatus: sc.newStatus },
        });

        const content = formatBIPChangePost({
          bip_number: sc.bipNumber,
          oldStatus: sc.oldStatus,
          newStatus: sc.newStatus,
        });
        await publishToX(supabase, {
          content,
          triggerType: 'bip_status_change',
          entityType: 'bip',
          entityId: sc.bipId,
        });
      }
    }

    await logMonitoringRun(supabase, 'bip_sync', 'completed', {
      total: results.total,
      inserted: results.inserted,
      updated: results.updated,
      errors: results.errors.length,
      statusChanges: results.statusChanges.length,
      queued,
    }, undefined, runId);

    console.log(
      `[cron/sync-bips] ${results.inserted} inserted, ${results.updated} updated, ` +
      `${results.statusChanges.length} status changes, ${queued} queued for re-eval, ` +
      `${results.errors.length} errors`
    );

    return NextResponse.json({ ...results, queued });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    await logMonitoringRun(supabase, 'bip_sync', 'failed', undefined, message, runId);
    console.error('[cron/sync-bips] Failed:', message);
    return NextResponse.json({ error: `Sync failed: ${message}` }, { status: 500 });
  }
}
