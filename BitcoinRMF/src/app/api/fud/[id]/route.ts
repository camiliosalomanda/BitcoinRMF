import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin, writeAuditLog } from '@/lib/supabase-helpers';
import { getSessionUser, isAdmin } from '@/lib/admin';
import { fudInputSchema } from '@/lib/validators';
import { fudFromRow, type FUDRow } from '@/lib/transform';
import { SEED_FUD } from '@/lib/seed-data';
import type { Database } from '@/types/database';

type Tables = Database['public']['Tables'];

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await getSupabaseAdmin();

  if (!supabase) {
    const fud = SEED_FUD.find((f) => f.id === id);
    if (!fud) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(fud);
  }

  const { data, error } = await supabase.from('fud_analyses').select('*').eq('id', id).single();
  if (error || !data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(fudFromRow(data as FUDRow));
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = await isAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const body = await request.json();
  const parsed = fudInputSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = await getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const user = await getSessionUser();
  const updateData: Record<string, unknown> = {};
  if (parsed.data.narrative !== undefined) updateData.narrative = parsed.data.narrative;
  if (parsed.data.category !== undefined) updateData.category = parsed.data.category;
  if (parsed.data.validityScore !== undefined) updateData.validity_score = parsed.data.validityScore;
  if (parsed.data.status !== undefined) updateData.fud_status = parsed.data.status;
  if (parsed.data.evidenceFor !== undefined) updateData.evidence_for = parsed.data.evidenceFor;
  if (parsed.data.evidenceAgainst !== undefined) updateData.evidence_against = parsed.data.evidenceAgainst;
  if (parsed.data.debunkSummary !== undefined) updateData.debunk_summary = parsed.data.debunkSummary;
  if (parsed.data.relatedThreats !== undefined) updateData.related_threats = parsed.data.relatedThreats;
  if (parsed.data.priceImpactEstimate !== undefined) updateData.price_impact_estimate = parsed.data.priceImpactEstimate;

  const { data, error } = await supabase.from('fud_analyses').update(updateData as Tables['fud_analyses']['Update']).eq('id', id).select().single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await writeAuditLog(supabase, {
    entityType: 'fud',
    entityId: id,
    action: 'update',
    userId: user!.xId,
    userName: user!.xName,
    diff: updateData as Record<string, unknown>,
  });

  return NextResponse.json(fudFromRow(data as FUDRow));
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = await isAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const supabase = await getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const user = await getSessionUser();
  const { error } = await supabase.from('fud_analyses').delete().eq('id', id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await writeAuditLog(supabase, {
    entityType: 'fud',
    entityId: id,
    action: 'delete',
    userId: user!.xId,
    userName: user!.xName,
  });

  return NextResponse.json({ success: true });
}
