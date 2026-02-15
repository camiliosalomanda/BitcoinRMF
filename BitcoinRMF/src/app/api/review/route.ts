import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/admin';
import { getSupabaseAdmin } from '@/lib/supabase-helpers';

interface ReviewItem {
  id: string;
  type: 'threat' | 'fud';
  name: string;
  status: string;
  submitted_by: string | null;
  submitted_by_name: string | null;
  created_at: string;
  approvals: number;
  rejections: number;
  netScore: number;
  userVote: 1 | -1 | null;
}

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const supabase = await getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json([]);
  }

  // Fetch pending threats and FUD (no BIPs)
  const [threatsRes, fudRes] = await Promise.all([
    supabase
      .from('threats')
      .select('id, name, status, submitted_by, submitted_by_name, created_at')
      .in('status', ['draft', 'under_review'])
      .order('created_at', { ascending: false }),
    supabase
      .from('fud_analyses')
      .select('id, narrative, status, submitted_by, submitted_by_name, created_at')
      .in('status', ['draft', 'under_review'])
      .order('created_at', { ascending: false }),
  ]);

  const items: ReviewItem[] = [
    ...(threatsRes.data || []).map((r) => ({
      id: r.id,
      type: 'threat' as const,
      name: r.name,
      status: r.status,
      submitted_by: r.submitted_by,
      submitted_by_name: r.submitted_by_name,
      created_at: r.created_at,
      approvals: 0,
      rejections: 0,
      netScore: 0,
      userVote: null as 1 | -1 | null,
    })),
    ...(fudRes.data || []).map((r) => ({
      id: r.id,
      type: 'fud' as const,
      name: r.narrative,
      status: r.status,
      submitted_by: r.submitted_by,
      submitted_by_name: r.submitted_by_name,
      created_at: r.created_at,
      approvals: 0,
      rejections: 0,
      netScore: 0,
      userVote: null as 1 | -1 | null,
    })),
  ];

  if (items.length === 0) {
    return NextResponse.json([]);
  }

  // Batch-fetch all votes for pending items
  const targetIds = items.map((i) => i.id);
  const { data: allVotes } = await supabase
    .from('votes')
    .select('target_type, target_id, vote_value, x_id')
    .in('target_id', targetIds);

  // Build vote tallies
  const votesMap = new Map<string, typeof allVotes>();
  for (const vote of allVotes || []) {
    const key = `${vote.target_type}-${vote.target_id}`;
    const existing = votesMap.get(key) || [];
    existing.push(vote);
    votesMap.set(key, existing);
  }

  for (const item of items) {
    const key = `${item.type}-${item.id}`;
    const votes = votesMap.get(key) || [];
    item.approvals = votes.filter((v) => v.vote_value === 1).length;
    item.rejections = votes.filter((v) => v.vote_value === -1).length;
    item.netScore = item.approvals - item.rejections;
    const userVoteEntry = votes.find((v) => v.x_id === user.xId);
    item.userVote = userVoteEntry ? (userVoteEntry.vote_value as 1 | -1) : null;
  }

  // Sort by most recent first
  items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return NextResponse.json(items);
}
