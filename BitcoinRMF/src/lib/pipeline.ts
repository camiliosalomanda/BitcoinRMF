// ===========================================
// Pipeline Orchestrator — Re-evaluation queue processing, shared cron utilities
// ===========================================

import Anthropic from '@anthropic-ai/sdk';
import { fetchBIPContent, BIP_EVALUATE_SYSTEM_PROMPT } from '@/lib/github-bips';
import { threatFromRow, vulnerabilityFromRow } from '@/lib/transform';
import { SEED_THREATS, SEED_VULNERABILITIES } from '@/lib/seed-data';
import { fetchAllBIPMetrics, formatMetricsForPrompt } from '@/lib/bip-metrics';
import { extractJSON } from '@/lib/security';
import { writeAuditLog } from '@/lib/supabase-helpers';
import type { Threat, Vulnerability } from '@/types';

// Type for Supabase client (avoid importing full module)
type SupabaseClient = {
  from: (table: string) => ReturnType<import('@supabase/supabase-js').SupabaseClient['from']>;
};

// --- Types ---

export interface ReEvalTrigger {
  bipId: string;
  bipNumber: string;
  reason: 'status_change' | 'new_threat' | 'new_vulnerability' | 'scheduled' | 'webhook' | 'manual';
  details?: string;
  priority?: number;
}

export interface ReEvalResult {
  bipId: string;
  bipNumber: string;
  success: boolean;
  error?: string;
  trigger?: string;
}

export interface QueueProcessResult {
  processed: number;
  succeeded: number;
  failed: number;
  skipped: number;
  results: ReEvalResult[];
}

export interface MonitoringRunResult {
  id?: string;
  pipeline: string;
  status: 'started' | 'completed' | 'failed';
  result?: Record<string, unknown>;
  error?: string;
}

// --- Cron Auth ---

export function verifyCronAuth(authHeader: string | null): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return true; // No secret configured = allow (dev mode)
  return authHeader === `Bearer ${cronSecret}`;
}

// --- Monitoring Run Logging ---

export async function logMonitoringRun(
  supabase: SupabaseClient,
  pipeline: string,
  status: 'started' | 'completed' | 'failed',
  result?: Record<string, unknown>,
  errorMessage?: string,
  runId?: string,
): Promise<string> {
  if (runId && status !== 'started') {
    // Update existing run
    await supabase
      .from('monitoring_runs')
      .update({
        status,
        completed_at: new Date().toISOString(),
        result: result || null,
        error_message: errorMessage || null,
      })
      .eq('id', runId);
    return runId;
  }

  // Create new run
  const { data } = await supabase
    .from('monitoring_runs')
    .insert({
      pipeline,
      status,
      started_at: new Date().toISOString(),
      result: result || null,
      error_message: errorMessage || null,
    })
    .select('id')
    .single();

  return data?.id || '';
}

// --- Daily Budget Check ---

async function checkDailyBudget(supabase: SupabaseClient): Promise<number> {
  const maxDaily = parseInt(process.env.REEVAL_MAX_DAILY || '50', 10);
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);

  const { count } = await supabase
    .from('reeval_queue')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'completed')
    .gte('completed_at', todayStart.toISOString());

  const usedToday = count || 0;
  return Math.max(0, maxDaily - usedToday);
}

// --- Core BIP Evaluation ---

export async function evaluateSingleBIP(
  supabase: SupabaseClient,
  bipId: string,
  trigger?: string,
): Promise<{ success: boolean; evaluation?: Record<string, unknown>; error?: string }> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return { success: false, error: 'ANTHROPIC_API_KEY not configured' };
  }

  // Look up the BIP row
  const { data: bipRow, error: fetchError } = await supabase
    .from('bip_evaluations')
    .select('*')
    .eq('id', bipId)
    .single();

  if (fetchError || !bipRow) {
    return { success: false, error: `BIP not found: ${bipId}` };
  }

  // Derive filename from bip_number: "BIP-0141" → "bip-0141.mediawiki"
  const num = parseInt(bipRow.bip_number.replace(/\D/g, ''), 10);
  const filename = `bip-${String(num).padStart(4, '0')}.mediawiki`;

  // Fetch full BIP content from GitHub
  let content: string;
  try {
    content = await fetchBIPContent(filename);
  } catch {
    try {
      content = await fetchBIPContent(filename.replace('.mediawiki', '.md'));
    } catch {
      return { success: false, error: `Could not fetch BIP content from GitHub (tried ${filename})` };
    }
  }

  // Fetch threats and vulnerabilities that reference this BIP
  const bipNumber = bipRow.bip_number;
  const shortBipNumber = `BIP-${parseInt(bipNumber.replace(/\D/g, ''), 10)}`;
  const bipVariants = [bipNumber, shortBipNumber];

  let relatedThreats: Threat[] = [];
  let relatedVulns: Vulnerability[] = [];

  const { data: threatRows } = await supabase
    .from('threats')
    .select('*')
    .in('status', ['published', 'under_review']);

  const { data: vulnRows } = await supabase
    .from('vulnerabilities')
    .select('*')
    .in('status', ['published', 'under_review']);

  if (threatRows && threatRows.length > 0) {
    const allThreats = threatRows.map(threatFromRow);
    relatedThreats = allThreats.filter((t) =>
      t.relatedBIPs.some((b) => bipVariants.includes(b))
    );
  } else {
    relatedThreats = SEED_THREATS.filter((t) =>
      t.relatedBIPs.some((b) => bipVariants.includes(b))
    );
  }

  if (vulnRows && vulnRows.length > 0) {
    const allVulns = vulnRows.map(vulnerabilityFromRow);
    relatedVulns = allVulns.filter((v) =>
      v.relatedBIPs.some((b) => bipVariants.includes(b))
    );
  } else {
    relatedVulns = SEED_VULNERABILITIES.filter((v) =>
      v.relatedBIPs.some((b) => bipVariants.includes(b))
    );
  }

  // Build system risk context
  let riskContext = '';
  if (relatedThreats.length > 0 || relatedVulns.length > 0) {
    riskContext = '\n\n--- System Risk Context ---\n';
    riskContext += `This BIP (${shortBipNumber}) is referenced by ${relatedThreats.length} threat(s) and ${relatedVulns.length} vulnerability(ies) in the system.\n\n`;

    if (relatedThreats.length > 0) {
      riskContext += 'Related Threats:\n';
      for (const t of relatedThreats) {
        riskContext += `- ID: "${t.id}" | Name: "${t.name}" | Rating: ${t.riskRating} | Score: ${t.severityScore}/25 | STRIDE: ${t.strideCategory} | Likelihood: ${t.likelihood}/5\n`;
      }
      riskContext += '\n';
    }

    if (relatedVulns.length > 0) {
      riskContext += 'Related Vulnerabilities:\n';
      for (const v of relatedVulns) {
        riskContext += `- ID: "${v.id}" | Name: "${v.name}" | Rating: ${v.vulnerabilityRating} | Score: ${v.vulnerabilityScore}/25 | Severity: ${v.severity}/5\n`;
      }
      riskContext += '\n';
    }

    const riskPairings: string[] = [];
    for (const t of relatedThreats) {
      for (const v of relatedVulns) {
        const score = t.likelihood * v.severity;
        riskPairings.push(`- "${t.name}" × "${v.name}": risk score ${score}/25`);
      }
    }
    if (riskPairings.length > 0) {
      riskContext += 'Derived Risk Pairings:\n' + riskPairings.join('\n') + '\n';
    }

    riskContext += '\nUse the threat IDs above in your threatsAddressed array.\n';
  }

  // Fetch verified external metrics
  let metricsContext = '';
  try {
    const metrics = await fetchAllBIPMetrics(
      bipRow.bip_number,
      bipRow.bip_status || 'PROPOSED',
      relatedThreats.map((t) => ({ name: t.name, severityScore: t.severityScore })),
      relatedVulns.map((v) => ({ name: v.name, vulnerabilityScore: v.vulnerabilityScore })),
    );
    metricsContext = '\n\n' + formatMetricsForPrompt(metrics);
  } catch {
    metricsContext = '\n\n--- Verified External Metrics ---\nExternal metric APIs unavailable. Use your best judgment based on the BIP content and risk data.';
  }

  // Send to Claude for evaluation
  const client = new Anthropic();
  const prompt = `Evaluate ${bipRow.bip_number} ("${bipRow.title}"):${riskContext}${metricsContext}\n\n${content}`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: BIP_EVALUATE_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  });

  const rawText = response.content[0].type === 'text' ? response.content[0].text : '';

  let evaluation: Record<string, unknown>;
  try {
    evaluation = JSON.parse(extractJSON(rawText));
  } catch {
    return { success: false, error: 'Failed to parse AI response' };
  }

  // Update the DB row with AI evaluation results
  const { error: updateError } = await supabase
    .from('bip_evaluations')
    .update({
      summary: (evaluation.summary as string) || null,
      recommendation: (evaluation.recommendation as string) || null,
      necessity_score: typeof evaluation.necessityScore === 'number' ? evaluation.necessityScore : null,
      threats_addressed: Array.isArray(evaluation.threatsAddressed) ? evaluation.threatsAddressed : [],
      mitigation_effectiveness: typeof evaluation.mitigationEffectiveness === 'number' ? evaluation.mitigationEffectiveness : null,
      community_consensus: typeof evaluation.communityConsensus === 'number' ? evaluation.communityConsensus : null,
      implementation_readiness: typeof evaluation.implementationReadiness === 'number' ? evaluation.implementationReadiness : null,
      economic_impact: (evaluation.economicImpact as string) || null,
      adoption_percentage: typeof evaluation.adoptionPercentage === 'number' ? evaluation.adoptionPercentage : null,
      last_evaluated_at: new Date().toISOString(),
      evaluation_trigger: trigger || 'manual',
    })
    .eq('id', bipId);

  if (updateError) {
    return { success: false, error: `DB update failed: ${updateError.message}` };
  }

  return { success: true, evaluation };
}

// --- Queue Operations ---

export async function queueReEvaluations(
  supabase: SupabaseClient,
  triggers: ReEvalTrigger[],
): Promise<number> {
  let queued = 0;

  for (const t of triggers) {
    const { error } = await supabase
      .from('reeval_queue')
      .insert({
        bip_id: t.bipId,
        bip_number: t.bipNumber,
        reason: t.reason,
        details: t.details || null,
        priority: t.priority || 0,
        status: 'pending',
      });

    // ON CONFLICT (unique partial index) will cause an error for duplicates — that's fine
    if (!error) queued++;
  }

  return queued;
}

export async function processReEvalQueue(
  supabase: SupabaseClient,
  maxItems?: number,
): Promise<QueueProcessResult> {
  const batchSize = maxItems || parseInt(process.env.REEVAL_BATCH_SIZE || '5', 10);
  const result: QueueProcessResult = {
    processed: 0, succeeded: 0, failed: 0, skipped: 0, results: [],
  };

  // Check daily budget
  const remaining = await checkDailyBudget(supabase);
  if (remaining <= 0) {
    console.log('[pipeline] Daily re-evaluation budget exhausted');
    return result;
  }

  const actualBatch = Math.min(batchSize, remaining);

  // Fetch pending items ordered by priority DESC, created_at ASC
  const { data: items } = await supabase
    .from('reeval_queue')
    .select('*')
    .eq('status', 'pending')
    .order('priority', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(actualBatch);

  if (!items || items.length === 0) return result;

  for (const item of items) {
    // Skip if max attempts reached
    if (item.attempts >= item.max_attempts) {
      await supabase
        .from('reeval_queue')
        .update({ status: 'failed', error_message: 'Max attempts reached' })
        .eq('id', item.id);
      result.skipped++;
      continue;
    }

    // Mark as processing
    await supabase
      .from('reeval_queue')
      .update({
        status: 'processing',
        started_at: new Date().toISOString(),
        attempts: item.attempts + 1,
      })
      .eq('id', item.id);

    result.processed++;

    try {
      const evalResult = await evaluateSingleBIP(supabase, item.bip_id, item.reason);

      if (evalResult.success) {
        await supabase
          .from('reeval_queue')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
          })
          .eq('id', item.id);

        // Write audit log
        await writeAuditLog(supabase as Parameters<typeof writeAuditLog>[0], {
          entityType: 'bip',
          entityId: item.bip_id,
          action: 'auto_reeval',
          userId: 'system:pipeline',
          userName: 'Monitoring Pipeline',
          diff: { reason: item.reason, details: item.details },
        });

        result.succeeded++;
        result.results.push({
          bipId: item.bip_id,
          bipNumber: item.bip_number,
          success: true,
          trigger: item.reason,
        });
      } else {
        await supabase
          .from('reeval_queue')
          .update({
            status: item.attempts + 1 >= item.max_attempts ? 'failed' : 'pending',
            error_message: evalResult.error,
          })
          .eq('id', item.id);

        result.failed++;
        result.results.push({
          bipId: item.bip_id,
          bipNumber: item.bip_number,
          success: false,
          error: evalResult.error,
          trigger: item.reason,
        });
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Unknown error';
      await supabase
        .from('reeval_queue')
        .update({
          status: item.attempts + 1 >= item.max_attempts ? 'failed' : 'pending',
          error_message: errMsg,
        })
        .eq('id', item.id);

      result.failed++;
      result.results.push({
        bipId: item.bip_id,
        bipNumber: item.bip_number,
        success: false,
        error: errMsg,
        trigger: item.reason,
      });
    }
  }

  return result;
}

// --- BIP Lookup ---

export async function findAffectedBIPs(
  supabase: SupabaseClient,
  bipReferences: string[],
): Promise<Array<{ id: string; bipNumber: string }>> {
  if (bipReferences.length === 0) return [];

  // Normalize references: "BIP-141" → ["BIP-141", "BIP-0141"]
  const variants: string[] = [];
  for (const ref of bipReferences) {
    variants.push(ref);
    const num = parseInt(ref.replace(/\D/g, ''), 10);
    if (!isNaN(num)) {
      variants.push(`BIP-${num}`);
      variants.push(`BIP-${String(num).padStart(4, '0')}`);
    }
  }

  const unique = [...new Set(variants)];

  const { data } = await supabase
    .from('bip_evaluations')
    .select('id, bip_number')
    .in('bip_number', unique);

  return (data || []).map((row: { id: string; bip_number: string }) => ({
    id: row.id,
    bipNumber: row.bip_number,
  }));
}
