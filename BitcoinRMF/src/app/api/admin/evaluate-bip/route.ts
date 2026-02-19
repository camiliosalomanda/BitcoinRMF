import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { isAdmin } from '@/lib/admin';
import { getSupabaseAdmin } from '@/lib/supabase-helpers';
import {
  checkRateLimit,
  getClientId,
  rateLimitResponse,
  addSecurityHeaders,
} from '@/lib/security';
import { fetchBIPContent, BIP_EVALUATE_SYSTEM_PROMPT } from '@/lib/github-bips';
import { threatFromRow, vulnerabilityFromRow } from '@/lib/transform';
import { SEED_THREATS, SEED_VULNERABILITIES } from '@/lib/seed-data';
import { fetchAllBIPMetrics, formatMetricsForPrompt } from '@/lib/bip-metrics';
import type { Threat, Vulnerability } from '@/types';

export async function POST(request: NextRequest) {
  const admin = await isAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const clientId = getClientId(request);
  const { allowed, remaining, resetIn } = checkRateLimit(`analysis:${clientId}`, 'analysis');
  if (!allowed) {
    return addSecurityHeaders(rateLimitResponse(resetIn));
  }

  const supabase = await getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return addSecurityHeaders(
      NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 })
    );
  }

  try {
    const body = await request.json();
    const { bipId } = body as { bipId: string };

    if (!bipId || typeof bipId !== 'string') {
      return addSecurityHeaders(
        NextResponse.json({ error: 'bipId is required' }, { status: 400 })
      );
    }

    // Look up the BIP row
    const { data: bipRow, error: fetchError } = await supabase
      .from('bip_evaluations')
      .select('*')
      .eq('id', bipId)
      .single();

    if (fetchError || !bipRow) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'BIP not found' }, { status: 404 })
      );
    }

    // Derive filename from bip_number: "BIP-0141" → "bip-0141.mediawiki"
    const num = parseInt(bipRow.bip_number.replace(/\D/g, ''), 10);
    const filename = `bip-${String(num).padStart(4, '0')}.mediawiki`;

    // Fetch full BIP content from GitHub
    let content: string;
    try {
      content = await fetchBIPContent(filename);
    } catch {
      // Try .md extension as fallback
      try {
        content = await fetchBIPContent(filename.replace('.mediawiki', '.md'));
      } catch {
        return addSecurityHeaders(
          NextResponse.json(
            { error: `Could not fetch BIP content from GitHub (tried ${filename})` },
            { status: 502 }
          )
        );
      }
    }

    // Fetch threats and vulnerabilities that reference this BIP
    const bipNumber = bipRow.bip_number; // e.g. "BIP-0340"
    const shortBipNumber = `BIP-${parseInt(bipNumber.replace(/\D/g, ''), 10)}`; // e.g. "BIP-340"
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

    // Build system risk context for the AI prompt
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

      // Derived risk scores (threat × vulnerability pairings)
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

    // Fetch verified external metrics for this BIP
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
      // Non-fatal: AI can still evaluate without external metrics
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

    const text = response.content[0].type === 'text' ? response.content[0].text : '';

    let evaluation: Record<string, unknown>;
    try {
      evaluation = JSON.parse(text);
    } catch {
      return addSecurityHeaders(
        NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 })
      );
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
      })
      .eq('id', bipId);

    if (updateError) {
      return addSecurityHeaders(
        NextResponse.json({ error: `DB update failed: ${updateError.message}` }, { status: 500 })
      );
    }

    const jsonResponse = NextResponse.json({ evaluation, bipId });
    jsonResponse.headers.set('X-RateLimit-Remaining', String(remaining));
    return addSecurityHeaders(jsonResponse);
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'AI service temporarily unavailable' }, { status: error.status || 500 })
      );
    }
    const message = error instanceof Error ? error.message : 'Unknown error';
    return addSecurityHeaders(
      NextResponse.json({ error: `Evaluation failed: ${message}` }, { status: 500 })
    );
  }
}
