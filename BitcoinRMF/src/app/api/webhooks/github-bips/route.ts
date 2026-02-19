import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-helpers';
import { queueReEvaluations, logMonitoringRun, findAffectedBIPs } from '@/lib/pipeline';
import type { ReEvalTrigger } from '@/lib/pipeline';
import { addSecurityHeaders } from '@/lib/security';

/**
 * POST /api/webhooks/github-bips
 * GitHub push webhook handler for the bitcoin/bips repo.
 * Validates HMAC-SHA256 signature, parses changed BIP files,
 * and queues affected BIPs for re-evaluation.
 *
 * Setup: Requires a GitHub App or webhook proxy pointing to this URL,
 * since we can't add webhooks directly to the public bitcoin/bips repo.
 * The daily sync-bips cron is the fallback/safety net.
 */
export async function POST(request: NextRequest) {
  const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return addSecurityHeaders(
      NextResponse.json({ error: 'Webhook not configured' }, { status: 503 })
    );
  }

  // Validate GitHub signature
  const signature = request.headers.get('x-hub-signature-256');
  if (!signature) {
    return addSecurityHeaders(
      NextResponse.json({ error: 'Missing signature' }, { status: 401 })
    );
  }

  const body = await request.text();

  const isValid = await verifyGitHubSignature(body, signature, webhookSecret);
  if (!isValid) {
    return addSecurityHeaders(
      NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    );
  }

  // Parse the event
  const event = request.headers.get('x-github-event');
  if (event !== 'push') {
    // Only handle push events; acknowledge others
    return addSecurityHeaders(
      NextResponse.json({ message: `Ignored event: ${event}` })
    );
  }

  let payload: GitHubPushEvent;
  try {
    payload = JSON.parse(body);
  } catch {
    return addSecurityHeaders(
      NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    );
  }

  // Extract changed BIP files from commits
  const changedBIPs = extractChangedBIPs(payload);
  if (changedBIPs.length === 0) {
    return addSecurityHeaders(
      NextResponse.json({ message: 'No BIP files changed', queued: 0 })
    );
  }

  const supabase = await getSupabaseAdmin();
  if (!supabase) {
    return addSecurityHeaders(
      NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    );
  }

  const runId = await logMonitoringRun(supabase, 'bip_sync', 'started');

  try {
    // Look up affected BIP rows
    const bipNumbers = changedBIPs.map((f) => {
      const num = parseInt(f.replace(/\D/g, ''), 10);
      return `BIP-${String(num).padStart(4, '0')}`;
    });

    const affectedBIPs = await findAffectedBIPs(supabase, bipNumbers);

    if (affectedBIPs.length === 0) {
      await logMonitoringRun(supabase, 'bip_sync', 'completed', {
        source: 'webhook',
        changedFiles: changedBIPs.length,
        matched: 0,
      }, undefined, runId);
      return addSecurityHeaders(
        NextResponse.json({ message: 'Changed BIPs not found in DB', changedBIPs, queued: 0 })
      );
    }

    // Queue re-evaluations
    const triggers: ReEvalTrigger[] = affectedBIPs.map((bip) => ({
      bipId: bip.id,
      bipNumber: bip.bipNumber,
      reason: 'webhook' as const,
      details: `GitHub push: ${changedBIPs.join(', ')}`,
      priority: 2,
    }));

    const queued = await queueReEvaluations(supabase, triggers);

    await logMonitoringRun(supabase, 'bip_sync', 'completed', {
      source: 'webhook',
      changedFiles: changedBIPs.length,
      matched: affectedBIPs.length,
      queued,
    }, undefined, runId);

    console.log(
      `[webhook/github-bips] ${changedBIPs.length} BIP files changed, ${queued} queued for re-eval`
    );

    return addSecurityHeaders(
      NextResponse.json({ changedBIPs, matched: affectedBIPs.length, queued })
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    await logMonitoringRun(supabase, 'bip_sync', 'failed', undefined, message, runId);
    console.error('[webhook/github-bips] Failed:', message);
    return addSecurityHeaders(
      NextResponse.json({ error: message }, { status: 500 })
    );
  }
}

// --- GitHub HMAC-SHA256 Signature Verification ---

async function verifyGitHubSignature(
  body: string,
  signature: string,
  secret: string,
): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    );
    const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
    const computed = `sha256=${Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, '0')).join('')}`;

    // Constant-time comparison
    if (computed.length !== signature.length) return false;
    let mismatch = 0;
    for (let i = 0; i < computed.length; i++) {
      mismatch |= computed.charCodeAt(i) ^ signature.charCodeAt(i);
    }
    return mismatch === 0;
  } catch {
    return false;
  }
}

// --- Parse changed BIP files from push event ---

interface GitHubPushEvent {
  ref: string;
  commits: Array<{
    id: string;
    added: string[];
    modified: string[];
    removed: string[];
  }>;
}

function extractChangedBIPs(payload: GitHubPushEvent): string[] {
  const bipFiles = new Set<string>();

  for (const commit of payload.commits || []) {
    const allFiles = [
      ...(commit.added || []),
      ...(commit.modified || []),
    ];

    for (const file of allFiles) {
      // Match bip-XXXX.mediawiki or bip-XXXX.md
      const match = file.match(/^(bip-\d{4})\.(mediawiki|md)$/);
      if (match) {
        bipFiles.add(match[1]);
      }
    }
  }

  return [...bipFiles];
}
