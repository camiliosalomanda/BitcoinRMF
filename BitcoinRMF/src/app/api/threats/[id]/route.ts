import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin, writeAuditLog } from '@/lib/supabase-helpers';
import { getSessionUser, isAdmin } from '@/lib/admin';
import { threatInputSchema } from '@/lib/validators';
import { threatFromRow, threatToRow } from '@/lib/transform';
import { SEED_THREATS } from '@/lib/seed-data';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await getSupabaseAdmin();

  if (!supabase) {
    const threat = SEED_THREATS.find((t) => t.id === id);
    if (!threat) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(threat);
  }

  const { data, error } = await supabase.from('threats').select('*').eq('id', id).single();
  if (error || !data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return NextResponse.json(threatFromRow(data as any));
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
  const parsed = threatInputSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = await getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const user = await getSessionUser();
  const updateData: Record<string, unknown> = {};

  // Map camelCase fields to snake_case
  if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
  if (parsed.data.description !== undefined) updateData.description = parsed.data.description;
  if (parsed.data.strideCategory !== undefined) updateData.stride_category = parsed.data.strideCategory;
  if (parsed.data.strideRationale !== undefined) updateData.stride_rationale = parsed.data.strideRationale;
  if (parsed.data.threatSource !== undefined) updateData.threat_source = parsed.data.threatSource;
  if (parsed.data.affectedComponents !== undefined) updateData.affected_components = parsed.data.affectedComponents;
  if (parsed.data.vulnerability !== undefined) updateData.vulnerability = parsed.data.vulnerability;
  if (parsed.data.exploitScenario !== undefined) updateData.exploit_scenario = parsed.data.exploitScenario;
  if (parsed.data.likelihood !== undefined) updateData.likelihood = parsed.data.likelihood;
  if (parsed.data.likelihoodJustification !== undefined) updateData.likelihood_justification = parsed.data.likelihoodJustification;
  if (parsed.data.impact !== undefined) updateData.impact = parsed.data.impact;
  if (parsed.data.impactJustification !== undefined) updateData.impact_justification = parsed.data.impactJustification;
  if (parsed.data.nistStage !== undefined) updateData.nist_stage = parsed.data.nistStage;
  if (parsed.data.status !== undefined) updateData.rmf_status = parsed.data.status;
  if (parsed.data.remediationStrategies !== undefined) updateData.remediation_strategies = parsed.data.remediationStrategies;
  if (parsed.data.relatedBIPs !== undefined) updateData.related_bips = parsed.data.relatedBIPs;
  if (parsed.data.evidenceSources !== undefined) updateData.evidence_sources = parsed.data.evidenceSources;
  if (parsed.data.fairEstimates) {
    const fe = parsed.data.fairEstimates;
    updateData.fair_tef = fe.threatEventFrequency;
    updateData.fair_vulnerability = fe.vulnerability;
    updateData.fair_lef = fe.lossEventFrequency;
    updateData.fair_primary_loss_usd = fe.primaryLossUSD;
    updateData.fair_secondary_loss_usd = fe.secondaryLossUSD;
    updateData.fair_ale = fe.annualizedLossExpectancy;
  }

  const { data, error } = await (supabase.from('threats') as any).update(updateData).eq('id', id).select().single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await writeAuditLog(supabase, {
    entityType: 'threat',
    entityId: id,
    action: 'update',
    userId: user!.xId,
    userName: user!.xName,
    diff: updateData as Record<string, unknown>,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return NextResponse.json(threatFromRow(data as any));
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
  const { error } = await (supabase.from('threats') as any).delete().eq('id', id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await writeAuditLog(supabase, {
    entityType: 'threat',
    entityId: id,
    action: 'delete',
    userId: user!.xId,
    userName: user!.xName,
  });

  return NextResponse.json({ success: true });
}
