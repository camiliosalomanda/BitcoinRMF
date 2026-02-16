import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-helpers';
import { getSessionUser } from '@/lib/admin';
import { vulnerabilityInputSchema } from '@/lib/validators';
import { vulnerabilityFromRow, vulnerabilityToRow, type VulnerabilityRow } from '@/lib/transform';
import { writeAuditLog } from '@/lib/supabase-helpers';
import { SEED_VULNERABILITIES } from '@/lib/seed-data';
import { getSeverityRating } from '@/lib/scoring';
import type { Vulnerability } from '@/types';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await getSupabaseAdmin();

  if (!supabase) {
    const vuln = SEED_VULNERABILITIES.find((v) => v.id === id);
    if (!vuln) {
      return NextResponse.json({ error: 'Vulnerability not found' }, { status: 404 });
    }
    return NextResponse.json(vuln);
  }

  const { data, error } = await supabase.from('vulnerabilities').select('*').eq('id', id).single();
  if (error || !data) {
    return NextResponse.json({ error: 'Vulnerability not found' }, { status: 404 });
  }

  return NextResponse.json(vulnerabilityFromRow(data as VulnerabilityRow));
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = vulnerabilityInputSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = await getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
  if (parsed.data.description !== undefined) updateData.description = parsed.data.description;
  if (parsed.data.affectedComponents !== undefined) updateData.affected_components = parsed.data.affectedComponents;
  if (parsed.data.severity !== undefined) updateData.severity = parsed.data.severity;
  if (parsed.data.exploitability !== undefined) updateData.exploitability = parsed.data.exploitability;
  if (parsed.data.status !== undefined) updateData.vuln_status = parsed.data.status;
  if (parsed.data.remediationStrategies !== undefined) updateData.remediation_strategies = parsed.data.remediationStrategies;
  if (parsed.data.relatedBIPs !== undefined) updateData.related_bips = parsed.data.relatedBIPs;
  if (parsed.data.evidenceSources !== undefined) updateData.evidence_sources = parsed.data.evidenceSources;

  const { data, error } = await supabase.from('vulnerabilities').update(updateData).eq('id', id).select().single();
  if (error || !data) {
    console.error(`[vulnerabilities/${id}] update error:`, error?.message);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }

  await writeAuditLog(supabase, {
    entityType: 'vulnerability',
    entityId: id,
    action: 'update',
    userId: user.xId,
    userName: user.xName,
  });

  return NextResponse.json(vulnerabilityFromRow(data as VulnerabilityRow));
}
