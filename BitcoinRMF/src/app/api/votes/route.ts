import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin, writeAuditLog } from '@/lib/supabase-helpers';
import { getSessionUser } from '@/lib/admin';
import { voteInputSchema } from '@/lib/validators';

const VOTE_THRESHOLD = 3;

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = voteInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
  }

  const { targetType, targetId, voteValue } = parsed.data;

  const supabase = await getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  // Verify target exists and is in a voteable status
  const table = targetType === 'threat' ? 'threats' : 'fud_analyses';
  const { data: target, error: targetError } = await supabase
    .from(table)
    .select('id, status, submitted_by')
    .eq('id', targetId)
    .single();

  if (targetError || !target) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 });
  }

  if (target.status !== 'draft' && target.status !== 'under_review') {
    return NextResponse.json({ error: 'Voting is only allowed on items under review' }, { status: 400 });
  }

  // Block self-voting
  if (target.submitted_by === user.xId) {
    return NextResponse.json({ error: 'You cannot vote on your own submission' }, { status: 403 });
  }

  // Upsert vote (unique constraint handles idempotency)
  const { error: voteError } = await supabase
    .from('votes')
    .upsert(
      {
        target_type: targetType,
        target_id: targetId,
        x_id: user.xId,
        x_username: user.xUsername,
        x_name: user.xName,
        vote_value: voteValue,
      },
      { onConflict: 'target_type,target_id,x_id' }
    );

  if (voteError) {
    return NextResponse.json({ error: voteError.message }, { status: 500 });
  }

  // Count votes and check threshold
  const { data: votes } = await supabase
    .from('votes')
    .select('vote_value')
    .eq('target_type', targetType)
    .eq('target_id', targetId);

  const approvals = (votes || []).filter((v) => v.vote_value === 1).length;
  const rejections = (votes || []).filter((v) => v.vote_value === -1).length;
  const netScore = approvals - rejections;

  let newStatus: string | null = null;

  if (netScore >= VOTE_THRESHOLD) {
    // Auto-publish
    await supabase.from(table).update({ status: 'published' }).eq('id', targetId);
    newStatus = 'published';

    await writeAuditLog(supabase, {
      entityType: targetType,
      entityId: targetId,
      action: 'vote_publish',
      userId: 'community',
      userName: 'Community Vote',
      diff: { approvals, rejections, netScore, threshold: VOTE_THRESHOLD },
    });
  } else if (netScore <= -VOTE_THRESHOLD) {
    // Auto-archive
    await supabase.from(table).update({ status: 'archived' }).eq('id', targetId);
    newStatus = 'archived';

    await writeAuditLog(supabase, {
      entityType: targetType,
      entityId: targetId,
      action: 'vote_archive',
      userId: 'community',
      userName: 'Community Vote',
      diff: { approvals, rejections, netScore, threshold: VOTE_THRESHOLD },
    });
  }

  return NextResponse.json({
    voteRecorded: true,
    netScore,
    newStatus,
  });
}
