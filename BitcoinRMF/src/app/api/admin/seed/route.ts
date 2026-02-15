import { NextResponse } from 'next/server';
import { isAdmin, getSessionUser } from '@/lib/admin';
import { getSupabaseAdmin, writeAuditLog } from '@/lib/supabase-helpers';
import { threatToRow, bipToRow, fudToRow } from '@/lib/transform';
import { SEED_THREATS, SEED_BIPS, SEED_FUD } from '@/lib/seed-data';
import type { Database } from '@/types/database';

type Tables = Database['public']['Tables'];

export async function POST() {
  const admin = await isAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const supabase = await getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const user = await getSessionUser();
  const results = { threats: 0, bips: 0, fud: 0, errors: [] as string[] };

  // Seed threats
  for (const threat of SEED_THREATS) {
    const row = threatToRow(threat) as Record<string, unknown>;
    row.status = 'published';
    row.rmf_status = threat.status;
    // Remove computed columns
    delete row.severity_score;
    delete row.risk_rating;

    const { error } = await supabase.from('threats').upsert(row as Tables['threats']['Insert'], { onConflict: 'id' });
    if (error) {
      results.errors.push(`Threat ${threat.id}: ${error.message}`);
    } else {
      results.threats++;
    }
  }

  // Seed BIPs
  for (const bip of SEED_BIPS) {
    const row = bipToRow(bip) as Record<string, unknown>;
    // Map status field
    row.bip_status = bip.status;
    row.status = 'published';
    // Remove the 'status' that bipToRow puts (which is the BIP lifecycle status)
    // Actually bipToRow maps status correctly, but we need bip_status separately
    delete row.status;

    const insertRow = {
      id: bip.id,
      bip_number: bip.bipNumber,
      title: bip.title,
      summary: bip.summary,
      recommendation: bip.recommendation,
      necessity_score: bip.necessityScore,
      threats_addressed: bip.threatsAddressed,
      mitigation_effectiveness: bip.mitigationEffectiveness,
      community_consensus: bip.communityConsensus,
      implementation_readiness: bip.implementationReadiness,
      economic_impact: bip.economicImpact,
      adoption_percentage: bip.adoptionPercentage,
      bip_status: bip.status,
      status: 'published',
    };

    const { error } = await supabase.from('bip_evaluations').upsert(insertRow as Tables['bip_evaluations']['Insert'], { onConflict: 'id' });
    if (error) {
      results.errors.push(`BIP ${bip.id}: ${error.message}`);
    } else {
      results.bips++;
    }
  }

  // Seed FUD
  for (const fud of SEED_FUD) {
    const insertRow = {
      id: fud.id,
      narrative: fud.narrative,
      category: fud.category,
      validity_score: fud.validityScore,
      fud_status: fud.status,
      status: 'published',
      evidence_for: fud.evidenceFor,
      evidence_against: fud.evidenceAgainst,
      debunk_summary: fud.debunkSummary,
      related_threats: fud.relatedThreats,
      price_impact_estimate: fud.priceImpactEstimate,
      last_seen: fud.lastSeen,
    };

    const { error } = await supabase.from('fud_analyses').upsert(insertRow as Tables['fud_analyses']['Insert'], { onConflict: 'id' });
    if (error) {
      results.errors.push(`FUD ${fud.id}: ${error.message}`);
    } else {
      results.fud++;
    }
  }

  await writeAuditLog(supabase, {
    entityType: 'threat',
    entityId: 'seed',
    action: 'create',
    userId: user!.xId,
    userName: user!.xName,
    diff: { action: 'seed', ...results },
  });

  return NextResponse.json(results);
}
