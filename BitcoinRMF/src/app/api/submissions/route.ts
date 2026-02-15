import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/admin';
import { getSupabaseAdmin } from '@/lib/supabase-helpers';

interface SubmissionItem {
  id: string;
  type: 'threat' | 'bip' | 'fud';
  name: string;
  status: string;
  created_at: string;
  rejection_reason?: string;
  approvals?: number;
  rejections?: number;
  netScore?: number;
}

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const supabase = await getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const [threatsRes, bipsRes, fudRes] = await Promise.all([
    supabase
      .from('threats')
      .select('id, name, status, created_at')
      .eq('submitted_by', user.xId)
      .order('created_at', { ascending: false }),
    supabase
      .from('bip_evaluations')
      .select('id, title, status, created_at')
      .eq('submitted_by', user.xId)
      .order('created_at', { ascending: false }),
    supabase
      .from('fud_analyses')
      .select('id, narrative, status, created_at')
      .eq('submitted_by', user.xId)
      .order('created_at', { ascending: false }),
  ]);

  const items: SubmissionItem[] = [
    ...(threatsRes.data || []).map((r) => ({
      id: r.id,
      type: 'threat' as const,
      name: r.name,
      status: r.status,
      created_at: r.created_at,
    })),
    ...(bipsRes.data || []).map((r) => ({
      id: r.id,
      type: 'bip' as const,
      name: r.title,
      status: r.status,
      created_at: r.created_at,
    })),
    ...(fudRes.data || []).map((r) => ({
      id: r.id,
      type: 'fud' as const,
      name: r.narrative,
      status: r.status,
      created_at: r.created_at,
    })),
  ];

  items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Fetch vote tallies for pending items
  const pendingIds = items
    .filter((i) => i.status === 'draft' || i.status === 'under_review')
    .map((i) => i.id);

  if (pendingIds.length > 0) {
    const { data: votes } = await supabase
      .from('votes')
      .select('target_id, vote_value')
      .in('target_id', pendingIds);

    const voteMap = new Map<string, { approvals: number; rejections: number }>();
    for (const vote of votes || []) {
      const existing = voteMap.get(vote.target_id) || { approvals: 0, rejections: 0 };
      if (vote.vote_value === 1) existing.approvals++;
      else existing.rejections++;
      voteMap.set(vote.target_id, existing);
    }

    for (const item of items) {
      const tally = voteMap.get(item.id);
      if (tally) {
        item.approvals = tally.approvals;
        item.rejections = tally.rejections;
        item.netScore = tally.approvals - tally.rejections;
      }
    }
  }

  // Look up rejection reasons from audit_log for archived items
  const archivedIds = items.filter((i) => i.status === 'archived').map((i) => i.id);

  if (archivedIds.length > 0) {
    const { data: auditRows } = await supabase
      .from('audit_log')
      .select('entity_id, diff')
      .in('entity_id', archivedIds)
      .eq('action', 'archive')
      .order('created_at', { ascending: false });

    const reasonMap = new Map<string, string>();
    for (const row of auditRows || []) {
      if (!reasonMap.has(row.entity_id)) {
        const diff = row.diff as Record<string, unknown> | null;
        const reason = diff?.reason;
        if (typeof reason === 'string' && reason) {
          reasonMap.set(row.entity_id, reason);
        }
      }
    }

    for (const item of items) {
      const reason = reasonMap.get(item.id);
      if (reason) item.rejection_reason = reason;
    }
  }

  return NextResponse.json(items);
}
