// ===========================================
// External Threat Source Fetchers
// NVD/CVE, Bitcoin Core GitHub, Bitcoin Optech
// ===========================================

export interface ExternalThreatSignal {
  source: 'nvd' | 'github_bitcoin' | 'bitcoin_optech';
  externalId: string;
  sourceUrl: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'unknown';
  publishedDate: string;
  relatedBIPs: string[];
  cveId?: string;
}

// --- BIP Reference Extraction ---

const BIP_REGEX = /\bBIP[-\s]?(\d{1,4})\b/gi;

export function extractBIPReferences(text: string): string[] {
  const matches = new Set<string>();
  let match;
  while ((match = BIP_REGEX.exec(text)) !== null) {
    const num = parseInt(match[1], 10);
    if (num > 0 && num < 10000) {
      matches.add(`BIP-${num}`);
    }
  }
  return [...matches];
}

// --- Shared Helpers ---

async function fetchWithTimeout<T>(
  url: string,
  options: RequestInit = {},
  timeoutMs = 15000,
): Promise<T | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const headers: Record<string, string> = {
      'User-Agent': 'BitcoinRMF/1.0',
      ...(options.headers as Record<string, string> || {}),
    };
    if (process.env.GITHUB_TOKEN && url.includes('github.com')) {
      headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
    }
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers,
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    return await res.json() as T;
  } catch {
    return null;
  }
}

async function fetchText(url: string, timeoutMs = 15000): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'BitcoinRMF/1.0' },
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

// --- NVD/CVE Fetcher ---
// Free API: 5 requests per 30 seconds (50 with NVD_API_KEY)
// https://services.nvd.nist.gov/rest/json/cves/2.0

interface NVDResponse {
  vulnerabilities: Array<{
    cve: {
      id: string;
      descriptions: Array<{ lang: string; value: string }>;
      published: string;
      lastModified: string;
      metrics?: {
        cvssMetricV31?: Array<{
          cvssData: { baseSeverity: string; baseScore: number };
        }>;
      };
    };
  }>;
}

function mapCVSSSeverity(severity: string): ExternalThreatSignal['severity'] {
  const s = severity.toUpperCase();
  if (s === 'CRITICAL') return 'critical';
  if (s === 'HIGH') return 'high';
  if (s === 'MEDIUM') return 'medium';
  if (s === 'LOW') return 'low';
  return 'unknown';
}

export async function fetchNVDSignals(since?: Date): Promise<ExternalThreatSignal[]> {
  const signals: ExternalThreatSignal[] = [];

  let url = 'https://services.nvd.nist.gov/rest/json/cves/2.0?keywordSearch=bitcoin&resultsPerPage=20';
  if (since) {
    const sinceStr = since.toISOString().replace(/\.\d+Z$/, '.000');
    url += `&lastModStartDate=${sinceStr}&lastModEndDate=${new Date().toISOString().replace(/\.\d+Z$/, '.000')}`;
  }

  const headers: Record<string, string> = {};
  if (process.env.NVD_API_KEY) {
    headers['apiKey'] = process.env.NVD_API_KEY;
  }

  const data = await fetchWithTimeout<NVDResponse>(url, { headers });
  if (!data?.vulnerabilities) return signals;

  for (const vuln of data.vulnerabilities) {
    const cve = vuln.cve;
    const desc = cve.descriptions.find((d) => d.lang === 'en')?.value || '';
    const cvss = cve.metrics?.cvssMetricV31?.[0];
    const severity = cvss
      ? mapCVSSSeverity(cvss.cvssData.baseSeverity)
      : 'unknown';

    signals.push({
      source: 'nvd',
      externalId: cve.id,
      sourceUrl: `https://nvd.nist.gov/vuln/detail/${cve.id}`,
      title: cve.id,
      description: desc.slice(0, 2000),
      severity,
      publishedDate: cve.published,
      relatedBIPs: extractBIPReferences(desc),
      cveId: cve.id,
    });
  }

  return signals;
}

// --- Bitcoin Core GitHub Issues/PRs Fetcher ---

interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string | null;
  html_url: string;
  created_at: string;
  updated_at: string;
  labels: Array<{ name: string }>;
  state: string;
}

export async function fetchGitHubBitcoinSignals(since?: Date): Promise<ExternalThreatSignal[]> {
  const signals: ExternalThreatSignal[] = [];

  let url = 'https://api.github.com/repos/bitcoin/bitcoin/issues?labels=Bug&sort=updated&direction=desc&per_page=20&state=all';
  if (since) {
    url += `&since=${since.toISOString()}`;
  }

  const issues = await fetchWithTimeout<GitHubIssue[]>(url);
  if (!issues) return signals;

  for (const issue of issues) {
    const fullText = `${issue.title} ${issue.body || ''}`;
    const labels = issue.labels.map((l) => l.name.toLowerCase());

    // Determine severity from labels
    let severity: ExternalThreatSignal['severity'] = 'medium';
    if (labels.some((l) => l.includes('critical') || l.includes('security'))) {
      severity = 'high';
    } else if (labels.some((l) => l.includes('minor') || l.includes('trivial'))) {
      severity = 'low';
    }

    signals.push({
      source: 'github_bitcoin',
      externalId: `bitcoin-issue-${issue.number}`,
      sourceUrl: issue.html_url,
      title: issue.title.slice(0, 500),
      description: (issue.body || '').slice(0, 2000),
      severity,
      publishedDate: issue.created_at,
      relatedBIPs: extractBIPReferences(fullText),
    });
  }

  return signals;
}

// --- Bitcoin Optech RSS Fetcher ---

export async function fetchOptechSignals(since?: Date): Promise<ExternalThreatSignal[]> {
  const signals: ExternalThreatSignal[] = [];

  const xml = await fetchText('https://bitcoinops.org/feed.xml');
  if (!xml) return signals;

  // Simple XML parsing for RSS items (no dependency required)
  const items = xml.split('<item>').slice(1);

  for (const item of items.slice(0, 20)) {
    const title = extractXMLTag(item, 'title');
    const link = extractXMLTag(item, 'link');
    const description = extractXMLTag(item, 'description');
    const pubDate = extractXMLTag(item, 'pubDate');

    if (!title || !link) continue;

    // Skip if before `since` date
    if (since && pubDate) {
      const itemDate = new Date(pubDate);
      if (itemDate < since) continue;
    }

    // Only include items with security/vulnerability-related keywords
    const fullText = `${title} ${description || ''}`;
    const securityKeywords = [
      'vulnerability', 'exploit', 'attack', 'security', 'CVE',
      'disclosure', 'malicious', 'bug', 'fix', 'patch',
    ];
    const isSecurityRelated = securityKeywords.some((kw) =>
      fullText.toLowerCase().includes(kw)
    );

    if (!isSecurityRelated) continue;

    signals.push({
      source: 'bitcoin_optech',
      externalId: `optech-${hashString(link)}`,
      sourceUrl: link,
      title: decodeHTML(title).slice(0, 500),
      description: decodeHTML(description || '').slice(0, 2000),
      severity: 'unknown',
      publishedDate: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
      relatedBIPs: extractBIPReferences(fullText),
    });
  }

  return signals;
}

// --- Fetch All Sources ---

export async function fetchAllThreatSignals(since?: Date): Promise<ExternalThreatSignal[]> {
  const results = await Promise.allSettled([
    fetchNVDSignals(since),
    fetchGitHubBitcoinSignals(since),
    fetchOptechSignals(since),
  ]);

  const signals: ExternalThreatSignal[] = [];
  for (const result of results) {
    if (result.status === 'fulfilled') {
      signals.push(...result.value);
    } else {
      console.warn('[threat-sources] Fetch failed:', result.reason);
    }
  }

  return signals;
}

// --- XML Helpers ---

function extractXMLTag(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</${tag}>`, 'i');
  const match = xml.match(regex);
  return match ? match[1].trim() : '';
}

function decodeHTML(html: string): string {
  return html
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/<[^>]+>/g, '');
}

function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}
