// ===========================================
// GitHub BIP Sync — Fetch & Parse BIP Index
// ===========================================

export interface GitHubBIPMetadata {
  bipNumber: string;   // e.g. "BIP-0001"
  number: number;      // e.g. 1
  title: string;
  author: string;
  type: string;        // e.g. "Informational", "Standards Track"
  status: string;      // e.g. "Active", "Final", "Draft"
  layer: string;       // e.g. "Applications", "Consensus (soft fork)"
  filename: string;    // e.g. "bip-0001.mediawiki"
}

const BIP_README_URL =
  'https://raw.githubusercontent.com/bitcoin/bips/master/README.mediawiki';

const BIP_RAW_BASE =
  'https://raw.githubusercontent.com/bitcoin/bips/master/';

/**
 * Fetch the BIP index from the bitcoin/bips README.mediawiki and parse metadata.
 * Single HTTP request for all BIP metadata.
 */
export async function fetchBIPIndex(): Promise<GitHubBIPMetadata[]> {
  const res = await fetch(BIP_README_URL, { next: { revalidate: 0 } });
  if (!res.ok) {
    throw new Error(`Failed to fetch BIP index: ${res.status} ${res.statusText}`);
  }
  const text = await res.text();
  return parseBIPTable(text);
}

/**
 * Parse the MediaWiki table from README.mediawiki.
 * The table rows look like:
 * |- style="..."
 * | [[bip-0001.mediawiki|1]]
 * | ...
 */
function parseBIPTable(wikiText: string): GitHubBIPMetadata[] {
  const bips: GitHubBIPMetadata[] = [];
  const lines = wikiText.split('\n');

  let inTable = false;
  let currentRow: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // Detect table start
    if (trimmed === '{|' || trimmed.startsWith('{| class=')) {
      inTable = true;
      continue;
    }

    // Detect table end
    if (trimmed === '|}') {
      // Process any remaining row
      if (currentRow.length > 0) {
        const bip = parseTableRow(currentRow);
        if (bip) bips.push(bip);
      }
      inTable = false;
      currentRow = [];
      continue;
    }

    if (!inTable) continue;

    // New row separator
    if (trimmed === '|-' || trimmed.startsWith('|- ')) {
      if (currentRow.length > 0) {
        const bip = parseTableRow(currentRow);
        if (bip) bips.push(bip);
      }
      currentRow = [];
      continue;
    }

    // Header row — skip
    if (trimmed.startsWith('! ')) continue;

    // Data cell
    if (trimmed.startsWith('| ')) {
      currentRow.push(trimmed.slice(2).trim());
    }
  }

  return bips;
}

/**
 * Parse a single table row (array of cell values) into BIP metadata.
 * Expected columns: Number, Layer, Title, Owner, Type, Status
 */
function parseTableRow(cells: string[]): GitHubBIPMetadata | null {
  if (cells.length < 4) return null;

  // First cell: [[bip-0001.mediawiki|1]] or just a number
  const numberCell = cells[0];
  const linkMatch = numberCell.match(/\[\[([^\]|]+?)(?:\|(\d+))?\]\]/);
  let filename = '';
  let num = 0;

  if (linkMatch) {
    filename = linkMatch[1];
    num = parseInt(linkMatch[2] || filename.replace(/\D/g, ''), 10);
  } else {
    // Plain number
    const plainNum = parseInt(numberCell.replace(/\D/g, ''), 10);
    if (isNaN(plainNum)) return null;
    num = plainNum;
    filename = `bip-${String(num).padStart(4, '0')}.mediawiki`;
  }

  if (isNaN(num) || num <= 0) return null;

  // Column layout varies — some BIPs have a Layer column, some don't.
  // Typical: Number | Layer | Title | Owner | Type | Status
  // Or:      Number | Title | Owner | Type | Status (no layer for Informational/Process)
  let layer = '';
  let title = '';
  let author = '';
  let type = '';
  let status = '';

  if (cells.length >= 6) {
    layer = stripWikiMarkup(cells[1]);
    title = stripWikiMarkup(cells[2]);
    author = stripWikiMarkup(cells[3]);
    type = stripWikiMarkup(cells[4]);
    status = stripWikiMarkup(cells[5]);
  } else if (cells.length >= 5) {
    // Could be either layout — check if cells[1] looks like a layer
    const possibleLayer = stripWikiMarkup(cells[1]);
    if (isLayerValue(possibleLayer)) {
      layer = possibleLayer;
      title = stripWikiMarkup(cells[2]);
      author = stripWikiMarkup(cells[3]);
      type = stripWikiMarkup(cells[4]);
      status = cells[5] ? stripWikiMarkup(cells[5]) : '';
    } else {
      title = stripWikiMarkup(cells[1]);
      author = stripWikiMarkup(cells[2]);
      type = stripWikiMarkup(cells[3]);
      status = stripWikiMarkup(cells[4]);
    }
  } else {
    // Minimal — just number + title + others
    title = stripWikiMarkup(cells[1]);
    author = stripWikiMarkup(cells[2] || '');
    type = stripWikiMarkup(cells[3] || '');
  }

  if (!title) return null;

  return {
    bipNumber: `BIP-${String(num).padStart(4, '0')}`,
    number: num,
    title,
    author,
    type,
    status,
    layer,
    filename,
  };
}

function isLayerValue(val: string): boolean {
  const layerKeywords = ['consensus', 'peer', 'api', 'applications', 'process'];
  const lower = val.toLowerCase();
  return layerKeywords.some((k) => lower.includes(k));
}

/** Strip MediaWiki markup: [[links]], '''bold''', etc. */
function stripWikiMarkup(text: string): string {
  return text
    .replace(/\[\[(?:[^\]|]*\|)?([^\]]*)\]\]/g, '$1') // [[link|text]] → text
    .replace(/'''?/g, '')                                // bold/italic
    .replace(/<[^>]+>/g, '')                             // HTML tags
    .trim();
}

/**
 * Map GitHub BIP statuses to our schema enum.
 */
export function mapGitHubStatus(
  status: string
): 'DRAFT' | 'PROPOSED' | 'ACTIVE' | 'FINAL' | 'WITHDRAWN' | 'REPLACED' {
  const s = status.trim().toLowerCase();
  if (s === 'final') return 'FINAL';
  if (s === 'active') return 'ACTIVE';
  if (s === 'draft') return 'DRAFT';
  if (s === 'proposed') return 'PROPOSED';
  if (s === 'withdrawn' || s === 'rejected') return 'WITHDRAWN';
  if (s === 'replaced' || s === 'obsolete' || s === 'superseded') return 'REPLACED';
  if (s === 'deferred') return 'DRAFT';
  return 'PROPOSED';
}

/**
 * Fetch a single BIP's full content from GitHub for AI evaluation.
 * Truncates to maxChars to stay within token limits.
 */
export async function fetchBIPContent(
  filename: string,
  maxChars = 15000
): Promise<string> {
  const url = `${BIP_RAW_BASE}${filename}`;
  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) {
    throw new Error(`Failed to fetch BIP content: ${res.status} ${res.statusText}`);
  }
  const text = await res.text();
  return text.length > maxChars ? text.slice(0, maxChars) + '\n\n[...truncated]' : text;
}

/**
 * Generate a deterministic BIP ID for upsert: "bip-0001", "bip-0141", etc.
 */
export function bipId(num: number): string {
  return `bip-${String(num).padStart(4, '0')}`;
}

/**
 * Shared system prompt for BIP AI evaluation.
 * Used by both /api/bips/evaluate and /api/admin/evaluate-bip.
 */
export const BIP_EVALUATE_SYSTEM_PROMPT = `You are an expert Bitcoin protocol analyst specializing in BIP (Bitcoin Improvement Proposal) evaluation against the current threat landscape.

When evaluating a BIP, you MUST return a JSON object with this exact structure:

{
  "bipNumber": "BIP-XXX",
  "title": "BIP title",
  "summary": "2-3 sentence summary of what this BIP does",
  "recommendation": "ESSENTIAL|RECOMMENDED|OPTIONAL|UNNECESSARY|HARMFUL",
  "necessityScore": 0-100,
  "threatsAddressed": ["Description of threat 1 it mitigates", "Description of threat 2"],
  "mitigationEffectiveness": 0-100,
  "communityConsensus": 0-100,
  "implementationReadiness": 0-100,
  "economicImpact": "Description of economic implications",
  "adoptionPercentage": 0-100,
  "securityAnalysis": "How this BIP affects Bitcoin's security posture",
  "tradeoffs": ["Tradeoff 1", "Tradeoff 2"],
  "relatedBIPs": ["BIP-XXX"]
}

Recommendation criteria:
- ESSENTIAL: Addresses critical/high severity threats with no alternative
- RECOMMENDED: Addresses meaningful threats, strong community support
- OPTIONAL: Nice to have, addresses lower-severity threats
- UNNECESSARY: No meaningful security benefit
- HARMFUL: Introduces new attack vectors or weakens security

Be technically precise. Consider real-world adoption challenges, consensus requirements, and economic incentive compatibility. Return ONLY valid JSON, no markdown.`;
