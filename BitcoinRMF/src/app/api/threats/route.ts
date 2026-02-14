import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-helpers';
import { getSessionUser } from '@/lib/admin';
import { threatInputSchema } from '@/lib/validators';
import { threatFromRow, threatToRow } from '@/lib/transform';
import { writeAuditLog } from '@/lib/supabase-helpers';
import { SEED_THREATS } from '@/lib/seed-data';
import type { Threat } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const stride = searchParams.get('stride') || '';
  const source = searchParams.get('source') || '';
  const rating = searchParams.get('rating') || '';
  const status = searchParams.get('status') || '';

  const supabase = await getSupabaseAdmin();

  if (!supabase) {
    // Fallback to seed data
    let threats = [...SEED_THREATS];
    if (stride) threats = threats.filter((t) => t.strideCategory === stride);
    if (source) threats = threats.filter((t) => t.threatSource === source);
    if (rating) threats = threats.filter((t) => t.riskRating === rating);
    if (status) threats = threats.filter((t) => t.status === status);
    return NextResponse.json(threats);
  }

  let query = supabase.from('threats').select('*').eq('status', 'published');
  if (stride) query = query.eq('stride_category', stride);
  if (source) query = query.eq('threat_source', source);
  if (rating) query = query.eq('risk_rating', rating);
  if (status) query = query.eq('rmf_status', status);

  const { data, error } = await query.order('severity_score', { ascending: false });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const threats = (data || []).map((row: any) => threatFromRow(row));
  return NextResponse.json(threats);
}

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = threatInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = await getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const id = `threat-${uuidv4().slice(0, 8)}`;

  // Build a full Threat object for transformation
  const rowData = threatToRow({
    id,
    name: parsed.data.name,
    description: parsed.data.description,
    strideCategory: parsed.data.strideCategory,
    strideRationale: parsed.data.strideRationale || '',
    threatSource: parsed.data.threatSource,
    affectedComponents: parsed.data.affectedComponents,
    vulnerability: parsed.data.vulnerability || '',
    exploitScenario: parsed.data.exploitScenario || '',
    likelihood: parsed.data.likelihood,
    likelihoodJustification: parsed.data.likelihoodJustification || '',
    impact: parsed.data.impact,
    impactJustification: parsed.data.impactJustification || '',
    severityScore: parsed.data.likelihood * parsed.data.impact,
    riskRating: 'MEDIUM',
    fairEstimates: parsed.data.fairEstimates || {
      threatEventFrequency: 0,
      vulnerability: 0,
      lossEventFrequency: 0,
      primaryLossUSD: 0,
      secondaryLossUSD: 0,
      annualizedLossExpectancy: 0,
    },
    nistStage: parsed.data.nistStage || 'PREPARE',
    status: 'IDENTIFIED',
    remediationStrategies: parsed.data.remediationStrategies || [],
    relatedBIPs: parsed.data.relatedBIPs || [],
    evidenceSources: parsed.data.evidenceSources || [],
    dateIdentified: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
  } as Threat) as Record<string, unknown>;

  // Set workflow status to draft for community submissions
  rowData.status = user.isAdmin ? 'published' : 'draft';
  rowData.rmf_status = parsed.data.status || 'IDENTIFIED';
  rowData.submitted_by = user.xId;
  rowData.submitted_by_name = user.xName;

  // Remove computed columns
  delete rowData.severity_score;
  delete rowData.risk_rating;

  const { data, error } = await (supabase.from('threats') as any).insert(rowData).select().single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await writeAuditLog(supabase, {
    entityType: 'threat',
    entityId: id,
    action: 'create',
    userId: user.xId,
    userName: user.xName,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return NextResponse.json(threatFromRow(data as any), { status: 201 });
}
