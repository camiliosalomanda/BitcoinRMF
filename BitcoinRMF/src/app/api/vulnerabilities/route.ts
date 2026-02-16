import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-helpers';
import { getSessionUser } from '@/lib/admin';
import { vulnerabilityInputSchema } from '@/lib/validators';
import { vulnerabilityFromRow, vulnerabilityToRow, type VulnerabilityRow } from '@/lib/transform';
import { writeAuditLog } from '@/lib/supabase-helpers';
import { SEED_VULNERABILITIES } from '@/lib/seed-data';
import { getSeverityRating } from '@/lib/scoring';
import type { Vulnerability } from '@/types';
import type { Database } from '@/types/database';
import { v4 as uuidv4 } from 'uuid';

type Tables = Database['public']['Tables'];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const severity = searchParams.get('severity') || '';
  const status = searchParams.get('status') || '';
  const component = searchParams.get('component') || '';

  const supabase = await getSupabaseAdmin();

  if (!supabase) {
    let vulns = [...SEED_VULNERABILITIES];
    if (severity) vulns = vulns.filter((v) => v.vulnerabilityRating === severity);
    if (status) vulns = vulns.filter((v) => v.status === status);
    if (component) vulns = vulns.filter((v) => v.affectedComponents.includes(component as Vulnerability['affectedComponents'][number]));
    return NextResponse.json(vulns);
  }

  let query = supabase.from('vulnerabilities').select('*').in('status', ['published', 'under_review']);
  if (severity) query = query.eq('vulnerability_rating', severity);
  if (status) query = query.eq('vuln_status', status);
  if (component) query = query.contains('affected_components', [component]);

  const { data, error } = await query.order('vulnerability_score', { ascending: false });
  if (error) {
    console.error('[vulnerabilities] DB error:', error.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }

  const vulns = (data || []).map((row) => vulnerabilityFromRow(row as VulnerabilityRow));
  return NextResponse.json(vulns);
}

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = vulnerabilityInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = await getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const id = `vuln-${uuidv4().slice(0, 8)}`;
  const severity = parsed.data.severity as Vulnerability['severity'];
  const exploitability = parsed.data.exploitability as Vulnerability['exploitability'];

  const rowData = vulnerabilityToRow({
    id,
    name: parsed.data.name,
    description: parsed.data.description,
    affectedComponents: parsed.data.affectedComponents,
    severity,
    exploitability,
    vulnerabilityScore: severity * exploitability,
    vulnerabilityRating: getSeverityRating(severity * exploitability),
    status: parsed.data.status || 'DISCOVERED',
    remediationStrategies: parsed.data.remediationStrategies || [],
    relatedBIPs: parsed.data.relatedBIPs || [],
    evidenceSources: parsed.data.evidenceSources || [],
    dateIdentified: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
  } as Vulnerability) as Record<string, unknown>;

  rowData.status = 'under_review';
  rowData.submitted_by = user.xId;
  rowData.submitted_by_name = user.xName;

  // Remove computed columns
  delete rowData.vulnerability_score;
  delete rowData.vulnerability_rating;

  const { data, error } = await supabase.from('vulnerabilities').insert(rowData as Tables['vulnerabilities']['Insert']).select().single();
  if (error) {
    console.error(`[vulnerabilities/${id}] DB error:`, error.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }

  await writeAuditLog(supabase, {
    entityType: 'vulnerability',
    entityId: id,
    action: 'create',
    userId: user.xId,
    userName: user.xName,
  });

  return NextResponse.json(vulnerabilityFromRow(data as VulnerabilityRow), { status: 201 });
}
