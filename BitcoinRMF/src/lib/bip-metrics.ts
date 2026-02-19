// ===========================================
// BIP Metrics — Real data fetchers for grounding BIP evaluation scores
// ===========================================

// --- Types ---

export interface MetricSource {
  name: string;
  url?: string;
  detail: string;
}

export interface AdoptionMetrics {
  score: number;
  txPercentage: number | null;
  nodePercentage: number | null;
  sources: MetricSource[];
}

export interface ConsensusMetrics {
  score: number;
  bipStatus: string;
  prStatus: string;
  prUrl: string | null;
  ackCount: number;
  implementations: number;
  sources: MetricSource[];
}

export interface ReadinessMetrics {
  score: number;
  hasImplementation: boolean;
  mergedInCore: boolean;
  activationMechanism: string | null;
  activatedOnMainnet: boolean;
  activationHeight: number | null;
  sources: MetricSource[];
}

export interface MitigationContext {
  relatedThreats: number;
  avgThreatScore: number;
  relatedVulnerabilities: number;
  avgVulnScore: number;
  note: string;
}

export interface BIPMetricsData {
  bipNumber: string;
  adoption: AdoptionMetrics;
  consensus: ConsensusMetrics;
  readiness: ReadinessMetrics;
  mitigation: MitigationContext;
  lastUpdated: string;
}

// --- Static Data Maps (verifiable Bitcoin history) ---

/** BIP -> on-chain feature type for transaction counting */
export type FeatureType = 'witness_tx' | 'taproot_spend' | 'bech32_output' | 'rbf_signal' | 'none';

export const BIP_FEATURE_MAP: Record<string, { type: FeatureType; label: string }> = {
  'BIP-141': { type: 'witness_tx', label: 'SegWit transactions' },
  'BIP-143': { type: 'witness_tx', label: 'SegWit transactions' },
  'BIP-340': { type: 'taproot_spend', label: 'Taproot spends' },
  'BIP-341': { type: 'taproot_spend', label: 'Taproot spends' },
  'BIP-342': { type: 'taproot_spend', label: 'Taproot spends' },
  'BIP-173': { type: 'bech32_output', label: 'Bech32 outputs' },
  'BIP-125': { type: 'rbf_signal', label: 'RBF-signaling transactions' },
  'BIP-174': { type: 'none', label: 'PSBT (not directly measurable on-chain)' },
  'BIP-324': { type: 'none', label: 'v2 transport (not measurable on-chain)' },
  'BIP-78':  { type: 'none', label: 'PayJoin (not directly measurable)' },
};

/** BIP -> minimum Bitcoin Core version that supports it */
export const BIP_CORE_VERSION_MAP: Record<string, string | null> = {
  'BIP-141': '0.13.1',
  'BIP-143': '0.13.1',
  'BIP-173': '0.16.0',
  'BIP-340': '0.21.1',
  'BIP-341': '0.21.1',
  'BIP-342': '0.21.1',
  'BIP-324': '26.0',
  'BIP-174': '0.17.0',
  'BIP-125': '0.12.0',
  'BIP-78':  null,
};

/** BIP -> mainnet activation block height */
export const BIP_ACTIVATION_MAP: Record<string, { height: number | null; mechanism: string | null; date: string | null }> = {
  'BIP-141': { height: 481824, mechanism: 'BIP-9 (versionbits)', date: 'Aug 2017' },
  'BIP-143': { height: 481824, mechanism: 'BIP-9 (versionbits)', date: 'Aug 2017' },
  'BIP-173': { height: null, mechanism: null, date: null },
  'BIP-340': { height: 709632, mechanism: 'Speedy Trial (BIP-341)', date: 'Nov 2021' },
  'BIP-341': { height: 709632, mechanism: 'Speedy Trial', date: 'Nov 2021' },
  'BIP-342': { height: 709632, mechanism: 'Speedy Trial (BIP-341)', date: 'Nov 2021' },
  'BIP-324': { height: null, mechanism: 'P2P protocol (no consensus activation)', date: null },
  'BIP-174': { height: null, mechanism: 'Wallet protocol (no activation)', date: null },
  'BIP-125': { height: null, mechanism: 'Node policy (no consensus activation)', date: null },
  'BIP-78':  { height: null, mechanism: 'Wallet protocol (no activation)', date: null },
};

/** Known independent implementations count for well-known BIPs */
const BIP_IMPLEMENTATIONS: Record<string, number> = {
  'BIP-141': 5,  // Core, btcd, libbitcoin, bcoin, rust-bitcoin
  'BIP-143': 5,
  'BIP-173': 6,  // Core, btcd, libbitcoin, bcoin, rust-bitcoin, many wallets
  'BIP-340': 4,  // Core, btcd, libsecp256k1, rust-bitcoin
  'BIP-341': 4,
  'BIP-342': 4,
  'BIP-324': 2,  // Core, rust implementation
  'BIP-174': 5,  // Core, btcd, many wallets
  'BIP-125': 3,  // Core, btcd, bcoin
  'BIP-78':  2,  // BTCPayServer, JoinMarket
};

// --- Server-side cache ---

interface CacheEntry<T> {
  data: T;
  expiry: number;
}

const metricsCache = new Map<string, CacheEntry<unknown>>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

function getCached<T>(key: string): T | null {
  const entry = metricsCache.get(key);
  if (!entry || Date.now() > entry.expiry) {
    metricsCache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache<T>(key: string, data: T): void {
  metricsCache.set(key, { data, expiry: Date.now() + CACHE_TTL_MS });
}

// --- Helpers ---

async function fetchJSON<T>(url: string, timeoutMs = 10000): Promise<T | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'BitcoinRMF/1.0',
        ...(process.env.GITHUB_TOKEN ? { 'Authorization': `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
      },
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    return await res.json() as T;
  } catch {
    return null;
  }
}

/** Normalize "BIP-0141" or "BIP-141" to "BIP-141" (short form for lookups) */
export function normalizeBIPNumber(bipNumber: string): string {
  const num = parseInt(bipNumber.replace(/\D/g, ''), 10);
  return isNaN(num) ? bipNumber : `BIP-${num}`;
}

/** Compare semver strings: returns true if version >= minVersion */
function versionGte(version: string, minVersion: string): boolean {
  const parse = (v: string) => v.split('.').map(Number);
  const a = parse(version);
  const b = parse(minVersion);
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const av = a[i] ?? 0;
    const bv = b[i] ?? 0;
    if (av > bv) return true;
    if (av < bv) return false;
  }
  return true; // equal
}

// --- Adoption Metrics ---

interface MempoolBlock {
  id: string;
  height: number;
  tx_count: number;
  extras?: {
    segwitTotalTxs?: number;
    segwitTotalSize?: number;
  };
}

interface BitnodesSnapshot {
  total_nodes: number;
  latest_height: number;
  nodes: Record<string, [number, string, ...unknown[]]>; // key => [protocol_version, user_agent, ...]
}

export async function fetchAdoptionMetrics(bipNumber: string): Promise<AdoptionMetrics> {
  const shortBip = normalizeBIPNumber(bipNumber);
  const cacheKey = `adoption:${shortBip}`;
  const cached = getCached<AdoptionMetrics>(cacheKey);
  if (cached) return cached;

  const feature = BIP_FEATURE_MAP[shortBip];
  const minVersion = BIP_CORE_VERSION_MAP[shortBip];
  const sources: MetricSource[] = [];
  let txPercentage: number | null = null;
  let nodePercentage: number | null = null;

  // 1. Transaction adoption from mempool.space
  if (feature && feature.type !== 'none') {
    try {
      const blocks = await fetchJSON<MempoolBlock[]>('https://mempool.space/api/v1/blocks');
      if (blocks && blocks.length > 0) {
        if (feature.type === 'witness_tx') {
          // SegWit: use extras.segwitTotalTxs from block data
          let totalTxs = 0;
          let segwitTxs = 0;
          for (const block of blocks.slice(0, 10)) {
            totalTxs += block.tx_count;
            segwitTxs += block.extras?.segwitTotalTxs ?? 0;
          }
          if (totalTxs > 0 && segwitTxs > 0) {
            txPercentage = Math.round((segwitTxs / totalTxs) * 1000) / 10;
          }
          sources.push({
            name: 'mempool.space',
            url: 'https://mempool.space',
            detail: txPercentage !== null
              ? `${txPercentage}% of recent transactions use SegWit`
              : 'SegWit transaction data unavailable',
          });
        } else if (feature.type === 'taproot_spend') {
          // Taproot: use mempool.space's dedicated stats endpoint
          const taproot = await fetchJSON<{ txCount?: number; totalTxCount?: number }>(
            'https://mempool.space/api/v1/mining/blocks/audit/scores'
          );
          // Fallback: fetch from blocks list (we can estimate from segwit/total ratio shift)
          // Since mempool.space doesn't expose per-block taproot counts in the blocks list,
          // use the known network-wide Taproot adoption stats
          if (taproot && taproot.txCount && taproot.totalTxCount) {
            txPercentage = Math.round((taproot.txCount / taproot.totalTxCount) * 1000) / 10;
          }
          sources.push({
            name: 'mempool.space',
            url: 'https://mempool.space',
            detail: txPercentage !== null
              ? `${txPercentage}% of recent transactions use Taproot`
              : 'Taproot transaction percentage not available from API (use manual estimate)',
          });
        } else if (feature.type === 'rbf_signal') {
          sources.push({
            name: 'mempool.space',
            url: 'https://mempool.space',
            detail: 'RBF signaling percentage requires per-tx analysis (node-version only)',
          });
        } else if (feature.type === 'bech32_output') {
          sources.push({
            name: 'mempool.space',
            url: 'https://mempool.space',
            detail: 'Bech32 output percentage requires per-tx analysis (node-version only)',
          });
        }
      }
    } catch {
      sources.push({
        name: 'mempool.space',
        url: 'https://mempool.space',
        detail: 'Transaction data temporarily unavailable',
      });
    }
  }

  // 2. Node adoption from bitnodes.io
  if (minVersion) {
    try {
      const snapshot = await fetchJSON<BitnodesSnapshot>(
        'https://bitnodes.io/api/v1/snapshots/latest/'
      );
      if (snapshot && snapshot.nodes) {
        const nodes = Object.values(snapshot.nodes);
        let supportingNodes = 0;
        let totalParseable = 0;

        for (const node of nodes) {
          const userAgent = node[1];
          if (typeof userAgent !== 'string') continue;

          // Parse version from user agent like "/Satoshi:26.0.0/"
          const match = userAgent.match(/\/Satoshi:(\d+\.\d+(?:\.\d+)?)\//);
          if (match) {
            totalParseable++;
            if (versionGte(match[1], minVersion)) {
              supportingNodes++;
            }
          }
        }

        if (totalParseable > 0) {
          nodePercentage = Math.round((supportingNodes / totalParseable) * 1000) / 10;
        }

        sources.push({
          name: 'bitnodes.io',
          url: 'https://bitnodes.io',
          detail: nodePercentage !== null
            ? `${nodePercentage}% of reachable nodes support ${shortBip} (v${minVersion}+)`
            : 'Node version data unavailable',
        });
      }
    } catch {
      sources.push({
        name: 'bitnodes.io',
        url: 'https://bitnodes.io',
        detail: 'Node data temporarily unavailable',
      });
    }
  }

  if (sources.length === 0) {
    sources.push({
      name: 'Note',
      detail: `${shortBip} has no directly measurable on-chain adoption metric`,
    });
  }

  // Compute score: weighted average of available metrics
  let score = 0;
  if (txPercentage !== null && nodePercentage !== null) {
    score = Math.round(txPercentage * 0.6 + nodePercentage * 0.4);
  } else if (txPercentage !== null) {
    score = Math.round(txPercentage);
  } else if (nodePercentage !== null) {
    score = Math.round(nodePercentage);
  }
  score = Math.min(100, Math.max(0, score));

  const result: AdoptionMetrics = { score, txPercentage, nodePercentage, sources };
  setCache(cacheKey, result);
  return result;
}

// --- Consensus Metrics ---

interface GitHubSearchResult {
  total_count: number;
  items: Array<{
    number: number;
    title: string;
    html_url: string;
    state: string;
    pull_request?: { merged_at: string | null };
    labels: Array<{ name: string }>;
  }>;
}

export async function fetchConsensusMetrics(bipNumber: string, bipStatus: string): Promise<ConsensusMetrics> {
  const shortBip = normalizeBIPNumber(bipNumber);
  const cacheKey = `consensus:${shortBip}`;
  const cached = getCached<ConsensusMetrics>(cacheKey);
  if (cached) return cached;

  const sources: MetricSource[] = [];
  const num = parseInt(shortBip.replace(/\D/g, ''), 10);

  // 1. BIP status weight
  const statusWeights: Record<string, number> = {
    FINAL: 40, ACTIVE: 35, PROPOSED: 15, DRAFT: 5,
    WITHDRAWN: 0, REPLACED: 0,
  };
  const statusWeight = statusWeights[bipStatus.toUpperCase()] ?? 10;
  sources.push({
    name: 'BIP Status',
    url: `https://github.com/bitcoin/bips/blob/master/bip-${String(num).padStart(4, '0')}.mediawiki`,
    detail: `Status: ${bipStatus}`,
  });

  // 2. Bitcoin Core PR status from GitHub
  let prStatus = 'unknown';
  let prUrl: string | null = null;
  let ackCount = 0;
  let prWeight = 0;

  const searchUrl = `https://api.github.com/search/issues?q=repo:bitcoin/bitcoin+BIP-${num}+type:pr&per_page=5&sort=updated`;
  const prData = await fetchJSON<GitHubSearchResult>(searchUrl);

  if (prData && prData.items && prData.items.length > 0) {
    // Find the most relevant PR (prefer merged, then open)
    const merged = prData.items.find((pr) => pr.pull_request?.merged_at);
    const open = prData.items.find((pr) => pr.state === 'open');
    const bestPR = merged || open || prData.items[0];

    prUrl = bestPR.html_url;

    if (merged) {
      prStatus = 'merged';
      prWeight = 30;
      // Estimate ACKs: we can't get review comments count from search,
      // but merged PRs to Bitcoin Core typically have multiple ACKs
      ackCount = 3; // conservative estimate for merged PRs
      sources.push({
        name: 'GitHub',
        url: prUrl,
        detail: `Core PR merged (${bestPR.title})`,
      });
    } else if (open) {
      prStatus = 'open';
      prWeight = 15;
      sources.push({
        name: 'GitHub',
        url: prUrl,
        detail: `Core PR open (${bestPR.title})`,
      });
    } else {
      prStatus = 'closed';
      prWeight = 5;
      sources.push({
        name: 'GitHub',
        url: prUrl,
        detail: `Core PR closed without merge`,
      });
    }
  } else {
    prStatus = 'none';
    prWeight = 0;
    sources.push({
      name: 'GitHub',
      url: `https://github.com/bitcoin/bitcoin/pulls?q=BIP-${num}`,
      detail: 'No related PRs found in Bitcoin Core',
    });
  }

  // 3. Independent implementations
  const implementations = BIP_IMPLEMENTATIONS[shortBip] ?? 0;
  let implWeight = 0;
  if (implementations >= 3) implWeight = 30;
  else if (implementations === 2) implWeight = 20;
  else if (implementations === 1) implWeight = 10;

  if (implementations > 0) {
    sources.push({
      name: 'Implementations',
      detail: `${implementations} independent implementation(s)`,
    });
  }

  const score = Math.min(100, statusWeight + prWeight + implWeight);

  const result: ConsensusMetrics = {
    score, bipStatus, prStatus, prUrl, ackCount, implementations, sources,
  };
  setCache(cacheKey, result);
  return result;
}

// --- Readiness Metrics ---

export async function fetchReadinessMetrics(bipNumber: string, bipStatus: string): Promise<ReadinessMetrics> {
  const shortBip = normalizeBIPNumber(bipNumber);
  const cacheKey = `readiness:${shortBip}`;
  const cached = getCached<ReadinessMetrics>(cacheKey);
  if (cached) return cached;

  const sources: MetricSource[] = [];
  const num = parseInt(shortBip.replace(/\D/g, ''), 10);
  let score = 0;

  // 1. Reference implementation exists? (check for merged PRs)
  let hasImplementation = false;
  let mergedInCore = false;

  const searchUrl = `https://api.github.com/search/issues?q=repo:bitcoin/bitcoin+BIP-${num}+type:pr+is:merged&per_page=3`;
  const prData = await fetchJSON<GitHubSearchResult>(searchUrl);

  if (prData && prData.total_count > 0) {
    hasImplementation = true;
    mergedInCore = true;
    score += 50; // +25 for implementation + 25 for merged
    const coreVersion = BIP_CORE_VERSION_MAP[shortBip];
    sources.push({
      name: 'Bitcoin Core',
      url: prData.items[0]?.html_url ?? undefined,
      detail: coreVersion
        ? `Merged in Bitcoin Core v${coreVersion}`
        : `Merged in Bitcoin Core`,
    });
  } else {
    // Check if there's any implementation (non-Core PRs or known implementations)
    const coreVersion = BIP_CORE_VERSION_MAP[shortBip];
    if (coreVersion) {
      hasImplementation = true;
      mergedInCore = true;
      score += 50;
      sources.push({
        name: 'Bitcoin Core',
        detail: `Supported since Bitcoin Core v${coreVersion}`,
      });
    } else {
      sources.push({
        name: 'Bitcoin Core',
        detail: 'No merged implementation found in Bitcoin Core',
      });
    }
  }

  // 2. Activation mechanism + mainnet activation
  const activation = BIP_ACTIVATION_MAP[shortBip];
  let activationMechanism: string | null = null;
  let activatedOnMainnet = false;
  let activationHeight: number | null = null;

  if (activation) {
    activationMechanism = activation.mechanism;
    if (activation.mechanism) {
      score += 25; // activation mechanism defined
      sources.push({
        name: 'Activation',
        detail: activation.mechanism,
      });
    }

    if (activation.height) {
      activatedOnMainnet = true;
      activationHeight = activation.height;
      score += 25; // activated on mainnet
      sources.push({
        name: 'Mainnet',
        detail: `Activated at block ${activation.height.toLocaleString()} (${activation.date})`,
      });
    }
  } else {
    // For BIPs where activation data isn't in our map, infer from status
    if (bipStatus === 'FINAL' || bipStatus === 'ACTIVE') {
      // FINAL/ACTIVE BIPs are effectively deployed
      score += 25;
      sources.push({
        name: 'Status',
        detail: `BIP status is ${bipStatus} — considered deployed`,
      });
    }
  }

  score = Math.min(100, Math.max(0, score));

  const result: ReadinessMetrics = {
    score, hasImplementation, mergedInCore,
    activationMechanism, activatedOnMainnet, activationHeight, sources,
  };
  setCache(cacheKey, result);
  return result;
}

// --- Mitigation Context (from system data, not external APIs) ---

export function buildMitigationContext(
  relatedThreats: Array<{ name: string; severityScore: number }>,
  relatedVulns: Array<{ name: string; vulnerabilityScore: number }>,
): MitigationContext {
  const avgThreatScore = relatedThreats.length > 0
    ? Math.round((relatedThreats.reduce((s, t) => s + t.severityScore, 0) / relatedThreats.length) * 10) / 10
    : 0;

  const avgVulnScore = relatedVulns.length > 0
    ? Math.round((relatedVulns.reduce((s, v) => s + v.vulnerabilityScore, 0) / relatedVulns.length) * 10) / 10
    : 0;

  return {
    relatedThreats: relatedThreats.length,
    avgThreatScore,
    relatedVulnerabilities: relatedVulns.length,
    avgVulnScore,
    note: relatedThreats.length > 0 || relatedVulns.length > 0
      ? 'AI-assessed based on system risk data'
      : 'No related threats or vulnerabilities in the system',
  };
}

// --- Composite: fetch all metrics for a BIP ---

export async function fetchAllBIPMetrics(
  bipNumber: string,
  bipStatus: string,
  relatedThreats: Array<{ name: string; severityScore: number }> = [],
  relatedVulns: Array<{ name: string; vulnerabilityScore: number }> = [],
): Promise<BIPMetricsData> {
  const [adoption, consensus, readiness] = await Promise.all([
    fetchAdoptionMetrics(bipNumber),
    fetchConsensusMetrics(bipNumber, bipStatus),
    fetchReadinessMetrics(bipNumber, bipStatus),
  ]);

  const mitigation = buildMitigationContext(relatedThreats, relatedVulns);

  return {
    bipNumber: normalizeBIPNumber(bipNumber),
    adoption,
    consensus,
    readiness,
    mitigation,
    lastUpdated: new Date().toISOString(),
  };
}

// --- Format metrics as text for AI prompt injection ---

export function formatMetricsForPrompt(metrics: BIPMetricsData): string {
  const lines: string[] = ['--- Verified External Metrics ---'];

  // Adoption
  lines.push('');
  lines.push('ADOPTION:');
  for (const src of metrics.adoption.sources) {
    lines.push(`  ${src.detail}${src.name ? ` (source: ${src.name})` : ''}`);
  }
  if (metrics.adoption.txPercentage !== null) {
    lines.push(`  Measured on-chain adoption: ${metrics.adoption.txPercentage}%`);
  }
  if (metrics.adoption.nodePercentage !== null) {
    lines.push(`  Node support: ${metrics.adoption.nodePercentage}%`);
  }
  lines.push(`  Computed adoption score: ${metrics.adoption.score}/100`);

  // Consensus
  lines.push('');
  lines.push('CONSENSUS:');
  lines.push(`  BIP status: ${metrics.consensus.bipStatus}`);
  lines.push(`  Bitcoin Core PR: ${metrics.consensus.prStatus}${metrics.consensus.prUrl ? ` (${metrics.consensus.prUrl})` : ''}`);
  lines.push(`  Independent implementations: ${metrics.consensus.implementations}`);
  lines.push(`  Computed consensus score: ${metrics.consensus.score}/100`);

  // Readiness
  lines.push('');
  lines.push('READINESS:');
  lines.push(`  Reference implementation: ${metrics.readiness.hasImplementation ? 'yes' : 'no'}`);
  lines.push(`  Merged in Bitcoin Core: ${metrics.readiness.mergedInCore ? 'yes' : 'no'}`);
  if (metrics.readiness.activationMechanism) {
    lines.push(`  Activation mechanism: ${metrics.readiness.activationMechanism}`);
  }
  if (metrics.readiness.activatedOnMainnet && metrics.readiness.activationHeight) {
    lines.push(`  Activated on mainnet: block ${metrics.readiness.activationHeight.toLocaleString()}`);
  }
  lines.push(`  Computed readiness score: ${metrics.readiness.score}/100`);

  // Mitigation context
  if (metrics.mitigation.relatedThreats > 0 || metrics.mitigation.relatedVulnerabilities > 0) {
    lines.push('');
    lines.push('MITIGATION CONTEXT:');
    lines.push(`  Related threats: ${metrics.mitigation.relatedThreats} (avg score: ${metrics.mitigation.avgThreatScore}/25)`);
    lines.push(`  Related vulnerabilities: ${metrics.mitigation.relatedVulnerabilities} (avg score: ${metrics.mitigation.avgVulnScore}/25)`);
  }

  lines.push('');
  lines.push('Use these verified metrics to inform your scores. Your adoption_percentage should closely reflect');
  lines.push('the measured on-chain/node adoption. Do not invent metrics — use the data provided.');
  lines.push('For community_consensus and implementation_readiness, use the provided GitHub/activation data.');
  lines.push('For mitigation_effectiveness, assess how well this BIP covers the identified threats.');

  return lines.join('\n');
}
