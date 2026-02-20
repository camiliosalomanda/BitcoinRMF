import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-helpers';

/**
 * GET /api/dashboard/x-posts?limit=20&status=posted
 * Returns recent X posts for the dashboard posting history widget.
 */
export async function GET(request: NextRequest) {
  const supabase = await getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json([]);
  }

  const { searchParams } = request.nextUrl;
  const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '20', 10) || 20, 1), 50);
  const status = searchParams.get('status') || '';

  let query = supabase
    .from('x_posts')
    .select('id, post_id, content, trigger_type, entity_type, entity_id, status, error_message, retry_count, posted_at, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[x-posts] Query failed:', error.message);
    return NextResponse.json([]);
  }

  return NextResponse.json(data || []);
}
