import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin';
import { getSupabaseAdmin } from '@/lib/supabase-helpers';
import { threatFromRow, bipFromRow, fudFromRow, type ThreatRow, type BIPRow, type FUDRow } from '@/lib/transform';

export async function GET() {
  const admin = await isAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const supabase = await getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const [threatsRes, bipsRes, fudRes] = await Promise.all([
    supabase.from('threats').select('*').in('status', ['draft', 'under_review']).order('created_at', { ascending: false }),
    supabase.from('bip_evaluations').select('*').in('status', ['draft', 'under_review']).order('created_at', { ascending: false }),
    supabase.from('fud_analyses').select('*').in('status', ['draft', 'under_review']).order('created_at', { ascending: false }),
  ]);

  if (threatsRes.error || bipsRes.error || fudRes.error) {
    console.error('[admin/pending] DB error:', threatsRes.error?.message, bipsRes.error?.message, fudRes.error?.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }

  return NextResponse.json({
    threats: (threatsRes.data || []).map((r) => threatFromRow(r as ThreatRow)),
    bips: (bipsRes.data || []).map((r) => bipFromRow(r as BIPRow)),
    fud: (fudRes.data || []).map((r) => fudFromRow(r as FUDRow)),
    total: (threatsRes.data?.length || 0) + (bipsRes.data?.length || 0) + (fudRes.data?.length || 0),
  });
}
