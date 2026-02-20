import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-helpers';

/**
 * GET /api/dashboard/trends?days=30
 * Returns array of { date, stats } from risk_snapshots.
 * Default 30 days, max 90.
 */
export async function GET(request: NextRequest) {
  const supabase = await getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json([]);
  }

  const daysParam = request.nextUrl.searchParams.get('days');
  const days = Math.min(Math.max(parseInt(daysParam || '30', 10) || 30, 1), 90);

  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('risk_snapshots')
    .select('snapshot_date, stats')
    .gte('snapshot_date', since)
    .order('snapshot_date', { ascending: true });

  if (error) {
    console.error('[trends] Query failed:', error.message);
    return NextResponse.json([]);
  }

  const result = (data || []).map((row) => ({
    date: row.snapshot_date,
    stats: row.stats,
  }));

  return NextResponse.json(result);
}
