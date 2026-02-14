import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin, writeAuditLog } from '@/lib/supabase-helpers';
import { getSessionUser, isAdmin } from '@/lib/admin';
import { bipInputSchema } from '@/lib/validators';
import { bipFromRow } from '@/lib/transform';
import { SEED_BIPS } from '@/lib/seed-data';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await getSupabaseAdmin();

  if (!supabase) {
    const bip = SEED_BIPS.find((b) => b.id === id);
    if (!bip) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(bip);
  }

  const { data, error } = await supabase.from('bip_evaluations').select('*').eq('id', id).single();
  if (error || !data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(bipFromRow(data as any));
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
  const parsed = bipInputSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = await getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const user = await getSessionUser();
  const updateData: Record<string, unknown> = {};
  if (parsed.data.bipNumber !== undefined) updateData.bip_number = parsed.data.bipNumber;
  if (parsed.data.title !== undefined) updateData.title = parsed.data.title;
  if (parsed.data.summary !== undefined) updateData.summary = parsed.data.summary;
  if (parsed.data.recommendation !== undefined) updateData.recommendation = parsed.data.recommendation;
  if (parsed.data.necessityScore !== undefined) updateData.necessity_score = parsed.data.necessityScore;
  if (parsed.data.threatsAddressed !== undefined) updateData.threats_addressed = parsed.data.threatsAddressed;
  if (parsed.data.mitigationEffectiveness !== undefined) updateData.mitigation_effectiveness = parsed.data.mitigationEffectiveness;
  if (parsed.data.communityConsensus !== undefined) updateData.community_consensus = parsed.data.communityConsensus;
  if (parsed.data.implementationReadiness !== undefined) updateData.implementation_readiness = parsed.data.implementationReadiness;
  if (parsed.data.economicImpact !== undefined) updateData.economic_impact = parsed.data.economicImpact;
  if (parsed.data.adoptionPercentage !== undefined) updateData.adoption_percentage = parsed.data.adoptionPercentage;
  if (parsed.data.status !== undefined) updateData.bip_status = parsed.data.status;

  const { data, error } = await (supabase.from('bip_evaluations') as any).update(updateData).eq('id', id).select().single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await writeAuditLog(supabase, {
    entityType: 'bip',
    entityId: id,
    action: 'update',
    userId: user!.xId,
    userName: user!.xName,
    diff: updateData as Record<string, unknown>,
  });

  return NextResponse.json(bipFromRow(data as any));
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
  const { error } = await (supabase.from('bip_evaluations') as any).delete().eq('id', id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await writeAuditLog(supabase, {
    entityType: 'bip',
    entityId: id,
    action: 'delete',
    userId: user!.xId,
    userName: user!.xName,
  });

  return NextResponse.json({ success: true });
}
