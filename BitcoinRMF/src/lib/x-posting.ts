import { TwitterApi } from 'twitter-api-v2';
import { createAdminClient } from '@/lib/supabase';
import { writeAuditLog } from '@/lib/supabase-helpers';
import type { DashboardStats } from '@/types';

// --- Config ---

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://bitcoinrmf.io';
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

const RATING_EMOJI: Record<string, string> = {
  CRITICAL: '\ud83d\udea8',  // siren
  HIGH: '\u26a0\ufe0f',       // warning
  MEDIUM: '\ud83d\udfe1',     // yellow circle
  LOW: '\ud83d\udfe2',        // green circle
};

const REC_EMOJI: Record<string, string> = {
  ESSENTIAL: '\u2705',        // check
  RECOMMENDED: '\ud83d\udc4d', // thumbs up
  OPTIONAL: '\ud83e\udd14',   // thinking
  UNNECESSARY: '\u274c',      // x
  HARMFUL: '\ud83d\uded1',    // stop sign
};

export function formatThreatPost(threat: {
  name: string;
  risk_rating?: string;
  severity_score?: number;
}): string {
  const rating = threat.risk_rating || 'NEW';
  const emoji = RATING_EMOJI[rating] || '\ud83d\udd34';
  const score = threat.severity_score ?? 0;
  const name = truncate(threat.name, 100);
  return `${emoji} NEW THREAT DETECTED\n\n${name}\n\nRisk: ${rating} | Severity: ${score}/25\n\nFull analysis \u2193\n${SITE_URL}/threats\n\n#Bitcoin #Security #InfoSec`;
}

export function formatFUDPost(fud: {
  narrative: string;
  validity_score?: number;
}): string {
  const score = fud.validity_score ?? 0;
  const emoji = score > 50 ? '\ud83e\uddd0' : '\ud83d\udca9';
  const narrative = truncate(fud.narrative, 100);
  return `${emoji} FUD CHECK\n\n"${narrative}"\n\nValidity: ${score}% \u2014 ${score > 50 ? 'Has some merit' : 'Mostly nonsense'}\n\nEvidence-based breakdown \u2193\n${SITE_URL}/fud\n\n#Bitcoin #FUD`;
}

export function formatBIPChangePost(bip: {
  bip_number: string;
  oldStatus: string;
  newStatus: string;
}): string {
  return `\ud83d\udcdc BIP-${bip.bip_number} STATUS UPDATE\n\n${bip.oldStatus} \u2192 ${bip.newStatus}\n\nTrack all BIP changes \u2193\n${SITE_URL}/bips\n\n#Bitcoin #BIP`;
}

export function formatBIPEvaluatedPost(bip: {
  bip_number: string;
  recommendation?: string;
  necessity_score?: number;
}): string {
  const rec = bip.recommendation || 'EVALUATED';
  const emoji = REC_EMOJI[rec] || '\ud83d\udcca';
  const score = bip.necessity_score ?? 0;
  return `${emoji} BIP-${bip.bip_number} AI EVALUATION\n\nVerdict: ${rec}\nNecessity Score: ${score}/100\n\nFull risk analysis \u2193\n${SITE_URL}/bips\n\n#Bitcoin #BIP`;
}

export function formatVulnerabilityPost(vuln: {
  name: string;
  vulnerability_rating?: string;
}): string {
  const rating = vuln.vulnerability_rating || 'NEW';
  const emoji = RATING_EMOJI[rating] || '\ud83d\udd34';
  const name = truncate(vuln.name, 100);
  return `${emoji} VULNERABILITY ALERT\n\n${name}\n\nSeverity: ${rating}\n\nView details & remediation \u2193\n${SITE_URL}/vulnerabilities\n\n#Bitcoin #CVE #Security`;
}

export function formatWeeklySummaryPost(
  stats: DashboardStats,
  prevStats?: DashboardStats
): string {
  let text = `\ud83d\udee1\ufe0f BITCOIN RISK REPORT\n\n`;
  text += `\ud83d\udd34 ${stats.criticalHighRiskCount} critical/high risks\n`;
  text += `\ud83d\udcca ${stats.totalRisks} total risks tracked\n`;
  text += `\u26a0\ufe0f ${stats.totalThreats} threats | ${stats.totalVulnerabilities} vulnerabilities\n`;
  text += `\ud83d\udee0\ufe0f ${stats.activeRemediations} active remediations\n`;

  if (prevStats) {
    const delta = stats.totalRisks - prevStats.totalRisks;
    if (delta > 0) text += `\ud83d\udcc8 +${delta} new risks this week\n`;
    else if (delta < 0) text += `\ud83d\udcc9 ${Math.abs(delta)} risks resolved\n`;
  }

  text += `\nExplore the full dashboard \u2193\n${SITE_URL}\n\n#Bitcoin #RiskManagement #InfoSec`;
  return truncate(text, 280);
}

// --- Retry failed posts ---

const MAX_RETRIES = 3;

export async function retryFailedPosts(
  supabase: ReturnType<typeof createAdminClient>
): Promise<{ retried: number; succeeded: number; abandoned: number }> {
  if (!isXPostingEnabled()) {
    return { retried: 0, succeeded: 0, abandoned: 0 };
  }

  // Fetch failed posts from the last 48 hours, oldest first
  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
  const { data: failedPosts } = await supabase
    .from('x_posts')
    .select('*')
    .eq('status', 'failed')
    .gte('created_at', cutoff)
    .order('created_at', { ascending: true })
    .limit(5); // Process up to 5 retries per cycle

  if (!failedPosts || failedPosts.length === 0) {
    return { retried: 0, succeeded: 0, abandoned: 0 };
  }

  let succeeded = 0;
  let abandoned = 0;

  for (const post of failedPosts) {
    const attempts = (post.retry_count || 0) + 1;

    if (attempts > MAX_RETRIES) {
      // Mark as permanently failed
      await supabase
        .from('x_posts')
        .update({ status: 'abandoned' })
        .eq('id', post.id);
      abandoned++;
      continue;
    }

    try {
      const postId = await postToX(post.content);

      await supabase
        .from('x_posts')
        .update({
          post_id: postId,
          status: 'posted',
          posted_at: new Date().toISOString(),
          retry_count: attempts,
          error_message: null,
        })
        .eq('id', post.id);

      await writeAuditLog(supabase, {
        entityType: 'x_post',
        entityId: post.id,
        action: 'retry_succeeded',
        userId: 'system:x-bot',
        userName: '@BitcoinRMF',
        diff: { attempt: attempts, postId },
      });

      succeeded++;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      await supabase
        .from('x_posts')
        .update({
          status: 'failed',
          retry_count: attempts,
          error_message: `Retry #${attempts}: ${message}`,
        })
        .eq('id', post.id);
    }
  }

  return { retried: failedPosts.length, succeeded, abandoned };
}

// --- Helpers ---

function truncate(str: string, max: number): string {
  if (str.length <= max) return str;
  return str.slice(0, max - 1) + '\u2026';
}
