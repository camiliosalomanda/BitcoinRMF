/**
 * Seed the Supabase database with the existing seed data.
 * Run with: npx tsx scripts/seed-db.ts
 */
import { createClient } from '@supabase/supabase-js';
import { SEED_THREATS, SEED_BIPS, SEED_FUD } from '../src/lib/seed-data';
import { threatToRow, bipToRow, fudToRow } from '../src/lib/transform';
import type { Database } from '../src/types/database';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hzkavwoxruayydcxcoox.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_KEY) {
  console.error('SUPABASE_SERVICE_ROLE_KEY is required');
  process.exit(1);
}

const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_KEY);

async function seed() {
  console.log('Seeding threats...');
  let threatCount = 0;
  for (const threat of SEED_THREATS) {
    const row = threatToRow(threat) as Record<string, unknown>;
    row.status = 'published';
    row.rmf_status = threat.status;
    delete row.severity_score;
    delete row.risk_rating;

    const { error } = await supabase.from('threats').upsert(row as any, { onConflict: 'id' });
    if (error) {
      console.error(`  Threat ${threat.id}: ${error.message}`);
    } else {
      threatCount++;
    }
  }
  console.log(`  ${threatCount}/${SEED_THREATS.length} threats seeded`);

  console.log('Seeding BIPs...');
  let bipCount = 0;
  for (const bip of SEED_BIPS) {
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
      status: 'published' as const,
    };

    const { error } = await supabase.from('bip_evaluations').upsert(insertRow as any, { onConflict: 'id' });
    if (error) {
      console.error(`  BIP ${bip.id}: ${error.message}`);
    } else {
      bipCount++;
    }
  }
  console.log(`  ${bipCount}/${SEED_BIPS.length} BIPs seeded`);

  console.log('Seeding FUD...');
  let fudCount = 0;
  for (const fud of SEED_FUD) {
    const insertRow = {
      id: fud.id,
      narrative: fud.narrative,
      category: fud.category,
      validity_score: fud.validityScore,
      fud_status: fud.status,
      status: 'published' as const,
      evidence_for: fud.evidenceFor,
      evidence_against: fud.evidenceAgainst,
      debunk_summary: fud.debunkSummary,
      related_threats: fud.relatedThreats,
      price_impact_estimate: fud.priceImpactEstimate,
      last_seen: fud.lastSeen,
    };

    const { error } = await supabase.from('fud_analyses').upsert(insertRow as any, { onConflict: 'id' });
    if (error) {
      console.error(`  FUD ${fud.id}: ${error.message}`);
    } else {
      fudCount++;
    }
  }
  console.log(`  ${fudCount}/${SEED_FUD.length} FUD seeded`);

  console.log('\nDone!');
}

seed().catch(console.error);
