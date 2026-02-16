#!/usr/bin/env node
/**
 * Migration script: Split existing threat vulnerability data into Vulnerability records.
 *
 * This script reads threats from Supabase, creates vulnerability records from each
 * threat's vulnerability text and remediation strategies, then updates the threat
 * to link to the new vulnerability via vulnerability_ids.
 *
 * Usage: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/migrate-threat-vulns.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function getRating(score) {
  if (score >= 20) return 'CRITICAL';
  if (score >= 12) return 'HIGH';
  if (score >= 6) return 'MEDIUM';
  if (score >= 3) return 'LOW';
  return 'VERY_LOW';
}

async function migrate() {
  console.log('Fetching threats...');
  const { data: threats, error } = await supabase.from('threats').select('*');
  if (error) {
    console.error('Failed to fetch threats:', error.message);
    process.exit(1);
  }

  console.log(`Found ${threats.length} threats`);
  let created = 0;
  let linked = 0;

  for (const threat of threats) {
    // Skip threats that already have vulnerability_ids
    if (threat.vulnerability_ids && threat.vulnerability_ids.length > 0) {
      console.log(`  Skipping ${threat.id} — already has vulnerability_ids`);
      continue;
    }

    // Skip threats with no vulnerability text
    if (!threat.vulnerability) {
      console.log(`  Skipping ${threat.id} — no vulnerability text`);
      continue;
    }

    const vulnId = `vuln-${randomUUID().slice(0, 8)}`;

    // Move remediation strategies to vulnerability, rewriting parentId/parentType
    const remStrategies = (threat.remediation_strategies || []).map((r) => ({
      ...r,
      parentId: vulnId,
      parentType: 'vulnerability',
    }));

    // Estimate severity from threat impact, exploitability from likelihood (rough heuristic)
    const severity = threat.impact || 3;
    const exploitability = Math.max(1, Math.min(5, 6 - (threat.likelihood || 3)));

    const vulnRow = {
      id: vulnId,
      name: `${threat.name} — Vulnerability`,
      description: threat.vulnerability,
      affected_components: threat.affected_components || [],
      severity,
      exploitability,
      vuln_status: threat.rmf_status === 'MITIGATED' ? 'MITIGATED' : 'CONFIRMED',
      remediation_strategies: remStrategies,
      related_bips: threat.related_bips || [],
      evidence_sources: [],
      status: threat.status || 'published',
      date_identified: threat.date_identified,
    };

    const { error: insertError } = await supabase.from('vulnerabilities').insert(vulnRow);
    if (insertError) {
      console.error(`  Failed to create vulnerability for ${threat.id}:`, insertError.message);
      continue;
    }
    created++;

    // Update threat to link to vulnerability
    const { error: updateError } = await supabase
      .from('threats')
      .update({
        vulnerability_ids: [vulnId],
        remediation_strategies: [], // Clear from threat
      })
      .eq('id', threat.id);

    if (updateError) {
      console.error(`  Failed to update threat ${threat.id}:`, updateError.message);
      continue;
    }
    linked++;

    // Insert into junction table
    await supabase.from('threat_vulnerabilities').insert({
      threat_id: threat.id,
      vulnerability_id: vulnId,
    });

    console.log(`  ${threat.id} → ${vulnId}`);
  }

  console.log(`\nDone: ${created} vulnerabilities created, ${linked} threats linked`);
}

migrate().catch(console.error);
