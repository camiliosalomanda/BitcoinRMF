import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin, writeAuditLog } from '@/lib/supabase-helpers';
import { getSessionUser } from '@/lib/admin';
import { fudInputSchema } from '@/lib/validators';
import { fudFromRow } from '@/lib/transform';
import { SEED_FUD } from '@/lib/seed-data';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  const supabase = await getSupabaseAdmin();

  if (!supabase) {
    return NextResponse.json(SEED_FUD);
  }

  const { data, error } = await supabase
    .from('fud_analyses')
    .select('*')
    .eq('status', 'published')
    .order('validity_score', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const fud = (data || []).map((row: any) => fudFromRow(row));
  return NextResponse.json(fud);
}

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = fudInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = await getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const id = `fud-${uuidv4().slice(0, 8)}`;
  const rowData = {
    id,
    narrative: parsed.data.narrative,
    category: parsed.data.category,
    validity_score: parsed.data.validityScore ?? null,
    fud_status: parsed.data.status || 'ACTIVE',
    evidence_for: parsed.data.evidenceFor || [],
    evidence_against: parsed.data.evidenceAgainst || [],
    debunk_summary: parsed.data.debunkSummary || null,
    related_threats: parsed.data.relatedThreats || [],
    price_impact_estimate: parsed.data.priceImpactEstimate || null,
    status: user.isAdmin ? 'published' : 'draft',
    submitted_by: user.xId,
    submitted_by_name: user.xName,
  };

  const { data, error } = await (supabase.from('fud_analyses') as any).insert(rowData).select().single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await writeAuditLog(supabase, {
    entityType: 'fud',
    entityId: id,
    action: 'create',
    userId: user.xId,
    userName: user.xName,
  });

  return NextResponse.json(fudFromRow(data as any), { status: 201 });
}
