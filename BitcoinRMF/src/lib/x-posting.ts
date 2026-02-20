import { TwitterApi } from 'twitter-api-v2';
import { createAdminClient } from '@/lib/supabase';
import { writeAuditLog } from '@/lib/supabase-helpers';
import type { DashboardStats } from '@/types';

// --- Config ---

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bitcoinrmf.com';
const MAX_POSTS_PER_HOUR = 15;

// --- Kill switch & auth ---

export function isXPostingEnabled(): boolean {
  if (process.env.X_POST_ENABLED !== 'true') return false;
  return !!(
    process.env.TWITTER_API_KEY &&
    process.env.TWITTER_API_SECRET &&
    process.env.TWITTER_ACCESS_TOKEN &&
    process.env.TWITTER_ACCESS_TOKEN_SECRET
  );
}

function getTwitterClient(): TwitterApi {
  return new TwitterApi({
    appKey: process.env.TWITTER_API_KEY!,
    appSecret: process.env.TWITTER_API_SECRET!,
    accessToken: process.env.TWITTER_ACCESS_TOKEN!,
    accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET!,
  });
}

// --- Core posting ---

async function postToX(content: string): Promise<string | null> {
  const client = getTwitterClient();
  const rwClient = client.readWrite;
  const result = await rwClient.v2.tweet(content);
  return result.data.id;
}

export async function publishToX(
  supabase: ReturnType<typeof createAdminClient>,
  opts: {
    content: string;
    triggerType: string;
    entityType?: string;
    entityId?: string;
  }
): Promise<{ posted: boolean; postId?: string; reason?: string }> {
  const { content, triggerType, entityType, entityId } = opts;

  // Kill switch
  if (!isXPostingEnabled()) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[x-posting] Skipped (disabled): ${content.slice(0, 80)}...`);
    }
    return { posted: false, reason: 'disabled' };
  }

  // Dedup: skip if same entity posted in last 24h
  if (entityType && entityId) {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: existing } = await supabase
      .from('x_posts')
      .select('id')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .eq('status', 'posted')
      .gte('posted_at', twentyFourHoursAgo)
      .limit(1);

    if (existing && existing.length > 0) {
      return { posted: false, reason: 'dedup' };
    }
  }

  // Rate limit: max posts per hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from('x_posts')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'posted')
    .gte('posted_at', oneHourAgo);

  if ((count || 0) >= MAX_POSTS_PER_HOUR) {
    return { posted: false, reason: 'rate_limited' };
  }

  // Insert pending record
  const { data: record, error: insertError } = await supabase
    .from('x_posts')
    .insert({
      content,
      trigger_type: triggerType,
      entity_type: entityType || null,
      entity_id: entityId || null,
      status: 'pending',
    })
    .select('id')
    .single();

  if (insertError || !record) {
    console.error('[x-posting] Failed to insert record:', insertError?.message);
    return { posted: false, reason: 'db_error' };
  }

  // Post to X
  try {
    const postId = await postToX(content);

    await supabase
      .from('x_posts')
      .update({
        post_id: postId,
        status: 'posted',
        posted_at: new Date().toISOString(),
      })
      .eq('id', record.id);

    await writeAuditLog(supabase, {
      entityType: 'x_post',
      entityId: record.id,
      action: 'posted',
      userId: 'system:x-bot',
      userName: '@BitcoinRMF',
      diff: { triggerType, entityType, entityId, postId },
    });

    return { posted: true, postId: postId || undefined };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    await supabase
      .from('x_posts')
      .update({
        status: 'failed',
        error_message: message,
      })
      .eq('id', record.id);

    console.error('[x-posting] Post failed:', message);
    return { posted: false, reason: message };
  }
}

// --- Format helpers (each ≤280 chars) ---

export function formatThreatPost(threat: {
  name: string;
  risk_rating?: string;
  severity_score?: number;
}): string {
  const rating = threat.risk_rating || 'NEW';
  const score = threat.severity_score ?? 0;
  const name = truncate(threat.name, 140);
  return `${rating} threat detected: ${name} (Score: ${score}/25)\n\n${SITE_URL}/threats\n\n#Bitcoin #Security #RiskManagement`;
}

export function formatFUDPost(fud: {
  narrative: string;
  validity_score?: number;
}): string {
  const score = fud.validity_score ?? 0;
  const narrative = truncate(fud.narrative, 150);
  return `FUD alert: ${narrative} | Validity: ${score}%\n\n${SITE_URL}/fud\n\n#Bitcoin #FUD`;
}

export function formatBIPChangePost(bip: {
  bip_number: string;
  oldStatus: string;
  newStatus: string;
}): string {
  return `BIP-${bip.bip_number} status: ${bip.oldStatus} \u2192 ${bip.newStatus}\n\n${SITE_URL}/bips\n\n#Bitcoin #BIP`;
}

export function formatBIPEvaluatedPost(bip: {
  bip_number: string;
  recommendation?: string;
  necessity_score?: number;
}): string {
  const rec = bip.recommendation || 'EVALUATED';
  const score = bip.necessity_score ?? 0;
  return `BIP-${bip.bip_number} evaluated: ${rec} (Necessity: ${score}/100)\n\n${SITE_URL}/bips\n\n#Bitcoin #BIP`;
}

export function formatVulnerabilityPost(vuln: {
  name: string;
  vulnerability_rating?: string;
}): string {
  const rating = vuln.vulnerability_rating || 'NEW';
  const name = truncate(vuln.name, 150);
  return `${rating} vulnerability: ${name}\n\n${SITE_URL}/vulnerabilities\n\n#Bitcoin #Security`;
}

export function formatWeeklySummaryPost(
  stats: DashboardStats,
  prevStats?: DashboardStats
): string {
  let text = `Weekly Bitcoin Risk Summary:\n`;
  text += `\u2022 ${stats.totalRisks} risks (${stats.criticalHighRiskCount} critical/high)\n`;
  text += `\u2022 ${stats.totalThreats} threats, ${stats.totalVulnerabilities} vulns\n`;
  text += `\u2022 ${stats.activeRemediations} remediations active\n`;

  if (prevStats) {
    const delta = stats.totalRisks - prevStats.totalRisks;
    if (delta > 0) text += `\u2022 +${delta} new risks this week\n`;
    else if (delta < 0) text += `\u2022 ${delta} risks resolved this week\n`;
  }

  text += `\n${SITE_URL}\n\n#Bitcoin #RiskManagement`;
  return truncate(text, 280);
}

// --- Helpers ---

function truncate(str: string, max: number): string {
  if (str.length <= max) return str;
  return str.slice(0, max - 1) + '\u2026';
}
