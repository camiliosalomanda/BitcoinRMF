import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-helpers';
import { SEED_THREATS, SEED_VULNERABILITIES } from '@/lib/seed-data';
import { threatFromRow, vulnerabilityFromRow, type ThreatRow, type VulnerabilityRow } from '@/lib/transform';
import { deriveRisks } from '@/lib/scoring';
import type { Threat } from '@/types';

export async function GET() {
  const supabase = await getSupabaseAdmin();

  if (!supabase) {
    const risks = deriveRisks(SEED_THREATS, SEED_VULNERABILITIES);
    return NextResponse.json(risks);
  }

  const [threatsRes, vulnsRes, junctionRes] = await Promise.all([
    supabase.from('threats').select('*').in('status', ['published', 'under_review']),
    supabase.from('vulnerabilities').select('*').in('status', ['published', 'under_review']),
    supabase.from('threat_vulnerabilities').select('threat_id, vulnerability_id'),
  ]);

  const threats = (threatsRes.data || []).map((row) => threatFromRow(row as ThreatRow));
  const vulns = (vulnsRes.data || []).map((row) => vulnerabilityFromRow(row as VulnerabilityRow));

  // Hydrate vulnerabilityIds from junction table when denormalized array is empty
  const junctionRows = junctionRes.data || [];
  if (junctionRows.length > 0) {
    const junctionMap = new Map<string, string[]>();
    for (const row of junctionRows) {
      const existing = junctionMap.get(row.threat_id) || [];
      existing.push(row.vulnerability_id);
      junctionMap.set(row.threat_id, existing);
    }

    for (const threat of threats) {
      const junctionIds = junctionMap.get(threat.id) || [];
      if (threat.vulnerabilityIds.length === 0 && junctionIds.length > 0) {
        (threat as Threat).vulnerabilityIds = junctionIds;
      } else if (junctionIds.length > 0) {
        // Merge: union of denormalized + junction table
        const merged = new Set([...threat.vulnerabilityIds, ...junctionIds]);
        (threat as Threat).vulnerabilityIds = [...merged];
      }
    }
  }

  const risks = deriveRisks(threats, vulns);
  return NextResponse.json(risks);
}
