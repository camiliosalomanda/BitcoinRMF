import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-helpers';
import { getSessionUser } from '@/lib/admin';

const VOTE_THRESHOLD = 3;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ targetType: string; targetId: string }> }
) {
  const { targetType, targetId } = await params;

  if (targetType !== 'threat' && targetType !== 'fud') {
    return NextResponse.json({ error: 'Invalid target type' }, { status: 400 });
  }

  const supabase = await getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ approvals: 0, rejections: 0, netScore: 0, userVote: null, threshold: VOTE_THRESHOLD });
  }

  const { data: votes } = await supabase
    .from('votes')
    .select('vote_value, x_id')
    .eq('target_type', targetType)
    .eq('target_id', targetId);

  const approvals = (votes || []).filter((v) => v.vote_value === 1).length;
  const rejections = (votes || []).filter((v) => v.vote_value === -1).length;

  // Check if current user has voted
  const user = await getSessionUser();
  let userVote: number | null = null;
  if (user) {
    const existing = (votes || []).find((v) => v.x_id === user.xId);
    if (existing) userVote = existing.vote_value;
  }

  return NextResponse.json({
    approvals,
    rejections,
    netScore: approvals - rejections,
    userVote,
    threshold: VOTE_THRESHOLD,
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ targetType: string; targetId: string }> }
) {
  const { targetType, targetId } = await params;
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  if (targetType !== 'threat' && targetType !== 'fud') {
    return NextResponse.json({ error: 'Invalid target type' }, { status: 400 });
  }

  const supabase = await getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const { error } = await supabase
    .from('votes')
    .delete()
    .eq('target_type', targetType)
    .eq('target_id', targetId)
    .eq('x_id', user.xId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ deleted: true });
}
