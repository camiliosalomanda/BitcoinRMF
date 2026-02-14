import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin';
import { getSupabaseAdmin } from '@/lib/supabase-helpers';
import { threatFromRow, bipFromRow, fudFromRow } from '@/lib/transform';

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

  return NextResponse.json({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    threats: (threatsRes.data || []).map((r: any) => threatFromRow(r)),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    bips: (bipsRes.data || []).map((r: any) => bipFromRow(r)),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fud: (fudRes.data || []).map((r: any) => fudFromRow(r)),
    total: (threatsRes.data?.length || 0) + (bipsRes.data?.length || 0) + (fudRes.data?.length || 0),
  });
}
