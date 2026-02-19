import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-helpers';
import { threatFromRow, vulnerabilityFromRow } from '@/lib/transform';
import { SEED_BIPS, SEED_THREATS, SEED_VULNERABILITIES } from '@/lib/seed-data';
import { fetchAllBIPMetrics, normalizeBIPNumber } from '@/lib/bip-metrics';
import { addSecurityHeaders } from '@/lib/security';
import type { Threat, Vulnerability } from '@/types';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await getSupabaseAdmin();

  // Look up BIP
  let bipNumber: string;
  let bipStatus: string;

  if (supabase) {
    const { data: bipRow, error } = await supabase
      .from('bip_evaluations')
      .select('bip_number, bip_status')
      .eq('id', id)
      .single();

    if (error || !bipRow) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'BIP not found' }, { status: 404 })
      );
    }
    bipNumber = bipRow.bip_number;
    bipStatus = bipRow.bip_status || 'PROPOSED';
  } else {
    const seedBip = SEED_BIPS.find((b) => b.id === id);
    if (!seedBip) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'BIP not found' }, { status: 404 })
      );
    }
    bipNumber = seedBip.bipNumber;
    bipStatus = seedBip.status;
  }

  // Gather related threats/vulnerabilities for mitigation context
  const shortBip = normalizeBIPNumber(bipNumber);
  const bipVariants = [bipNumber, shortBip];

  let relatedThreats: Threat[] = [];
  let relatedVulns: Vulnerability[] = [];

  if (supabase) {
    const { data: threatRows } = await supabase
      .from('threats')
      .select('*')
      .in('status', ['published', 'under_review']);

    const { data: vulnRows } = await supabase
      .from('vulnerabilities')
      .select('*')
      .in('status', ['published', 'under_review']);

    if (threatRows && threatRows.length > 0) {
      relatedThreats = threatRows.map(threatFromRow).filter((t) =>
        t.relatedBIPs.some((b) => bipVariants.includes(b))
      );
    } else {
      relatedThreats = SEED_THREATS.filter((t) =>
        t.relatedBIPs.some((b) => bipVariants.includes(b))
      );
    }

    if (vulnRows && vulnRows.length > 0) {
      relatedVulns = vulnRows.map(vulnerabilityFromRow).filter((v) =>
        v.relatedBIPs.some((b) => bipVariants.includes(b))
      );
    } else {
      relatedVulns = SEED_VULNERABILITIES.filter((v) =>
        v.relatedBIPs.some((b) => bipVariants.includes(b))
      );
    }
  } else {
    relatedThreats = SEED_THREATS.filter((t) =>
      t.relatedBIPs.some((b) => bipVariants.includes(b))
    );
    relatedVulns = SEED_VULNERABILITIES.filter((v) =>
      v.relatedBIPs.some((b) => bipVariants.includes(b))
    );
  }

  try {
    const metrics = await fetchAllBIPMetrics(
      bipNumber,
      bipStatus,
      relatedThreats.map((t) => ({ name: t.name, severityScore: t.severityScore })),
      relatedVulns.map((v) => ({ name: v.name, vulnerabilityScore: v.vulnerabilityScore })),
    );

    return addSecurityHeaders(
      NextResponse.json(metrics, {
        headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=300' },
      })
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return addSecurityHeaders(
      NextResponse.json({ error: `Failed to fetch BIP metrics: ${message}` }, { status: 502 })
    );
  }
}
