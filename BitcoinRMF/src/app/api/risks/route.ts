import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-helpers';
import { SEED_THREATS, SEED_VULNERABILITIES } from '@/lib/seed-data';
import { threatFromRow, vulnerabilityFromRow, type ThreatRow, type VulnerabilityRow } from '@/lib/transform';
import { deriveRisks } from '@/lib/scoring';

export async function GET() {
  const supabase = await getSupabaseAdmin();

  if (!supabase) {
    const risks = deriveRisks(SEED_THREATS, SEED_VULNERABILITIES);
    return NextResponse.json(risks);
  }

  const [threatsRes, vulnsRes] = await Promise.all([
    supabase.from('threats').select('*').in('status', ['published', 'under_review']),
    supabase.from('vulnerabilities').select('*').in('status', ['published', 'under_review']),
  ]);

  const threats = (threatsRes.data || []).map((row) => threatFromRow(row as ThreatRow));
  const vulns = (vulnsRes.data || []).map((row) => vulnerabilityFromRow(row as VulnerabilityRow));

  const risks = deriveRisks(threats, vulns);
  return NextResponse.json(risks);
}
