import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin, writeAuditLog } from '@/lib/supabase-helpers';
import { getSessionUser } from '@/lib/admin';
import { bipInputSchema } from '@/lib/validators';
import { bipFromRow, type BIPRow } from '@/lib/transform';
import { SEED_BIPS } from '@/lib/seed-data';
import type { Database } from '@/types/database';
import { v4 as uuidv4 } from 'uuid';

type Tables = Database['public']['Tables'];

export async function GET() {
  const supabase = await getSupabaseAdmin();

  if (!supabase) {
    return NextResponse.json(SEED_BIPS);
  }

  const { data, error } = await supabase
    .from('bip_evaluations')
    .select('*')
    .eq('status', 'published')
    .order('necessity_score', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const bips = (data || []).map((row) => bipFromRow(row as BIPRow));
  return NextResponse.json(bips);
}

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = bipInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = await getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const id = `bip-${uuidv4().slice(0, 8)}`;
  const rowData = {
    id,
    bip_number: parsed.data.bipNumber,
    title: parsed.data.title,
    summary: parsed.data.summary || null,
    recommendation: parsed.data.recommendation,
    necessity_score: parsed.data.necessityScore,
    threats_addressed: parsed.data.threatsAddressed || [],
    mitigation_effectiveness: parsed.data.mitigationEffectiveness ?? null,
    community_consensus: parsed.data.communityConsensus ?? null,
    implementation_readiness: parsed.data.implementationReadiness ?? null,
    economic_impact: parsed.data.economicImpact || null,
    adoption_percentage: parsed.data.adoptionPercentage ?? null,
    bip_status: parsed.data.status || 'PROPOSED',
    status: user.isAdmin ? 'published' : 'draft',
    submitted_by: user.xId,
    submitted_by_name: user.xName,
  };

  const { data, error } = await supabase.from('bip_evaluations').insert(rowData as Tables['bip_evaluations']['Insert']).select().single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await writeAuditLog(supabase, {
    entityType: 'bip',
    entityId: id,
    action: 'create',
    userId: user.xId,
    userName: user.xName,
  });

  return NextResponse.json(bipFromRow(data as BIPRow), { status: 201 });
}
