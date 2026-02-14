import { NextResponse } from 'next/server';

export interface BitcoinMetrics {
  price: number | null;
  priceChange24h: number | null;
  hashrate: number | null;     // EH/s
  difficulty: number | null;
  blockHeight: number | null;
  mempoolSize: number | null;  // unconfirmed tx count
  mempoolVSize: number | null; // vMB
  medianFee: number | null;    // sat/vB
  lastUpdated: string;
}

// Server-side cache: 5-minute TTL
let cachedMetrics: BitcoinMetrics | null = null;
let cacheExpiry = 0;
const CACHE_TTL_MS = 5 * 60 * 1000;

async function fetchJSON<T>(url: string, timeoutMs = 8000): Promise<T | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return null;
    return await res.json() as T;
  } catch {
    return null;
  }
}

async function fetchMetrics(): Promise<BitcoinMetrics> {
  // Fetch from multiple public APIs in parallel
  const [mempoolStats, mempoolDifficulty, mempoolBlocks, blockchainTicker] = await Promise.all([
    // mempool.space: mempool stats
    fetchJSON<{ count: number; vsize: number; total_fee: number }>('https://mempool.space/api/mempool'),
    // mempool.space: difficulty adjustment
    fetchJSON<{ difficultyChange: number; progressPercent: number }>('https://mempool.space/api/v1/difficulty-adjustment'),
    // mempool.space: recent blocks (hashrate + height)
    fetchJSON<Array<{ height: number; difficulty: number; extras?: { avgFeeRate?: number } }>>('https://mempool.space/api/v1/blocks'),
    // blockchain.info: ticker for price
    fetchJSON<{ USD: { last: number; symbol: string } }>('https://blockchain.info/ticker'),
  ]);

  // mempool.space recommended fees for median
  const fees = await fetchJSON<{ halfHourFee: number; hourFee: number; fastestFee: number }>('https://mempool.space/api/v1/fees/recommended');

  // Price from blockchain.info
  const price = blockchainTicker?.USD?.last ?? null;

  // Hashrate: derive from difficulty (rough estimate)
  // hashrate ≈ difficulty × 2^32 / 600 (H/s), convert to EH/s
  const latestBlock = mempoolBlocks?.[0];
  const difficulty = latestBlock?.difficulty ?? null;
  let hashrate: number | null = null;
  if (difficulty) {
    hashrate = Math.round((difficulty * 2 ** 32 / 600) / 1e18 * 100) / 100; // EH/s
  }

  return {
    price,
    priceChange24h: null, // blockchain.info ticker doesn't provide 24h change
    hashrate,
    difficulty,
    blockHeight: latestBlock?.height ?? null,
    mempoolSize: mempoolStats?.count ?? null,
    mempoolVSize: mempoolStats?.vsize ? Math.round(mempoolStats.vsize / 1_000_000 * 100) / 100 : null,
    medianFee: fees?.halfHourFee ?? null,
    lastUpdated: new Date().toISOString(),
  };
}

export async function GET() {
  try {
    const now = Date.now();

    if (cachedMetrics && now < cacheExpiry) {
      return NextResponse.json(cachedMetrics);
    }

    const metrics = await fetchMetrics();
    cachedMetrics = metrics;
    cacheExpiry = now + CACHE_TTL_MS;

    return NextResponse.json(metrics, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60' },
    });
  } catch {
    // Return stale cache if available, otherwise error
    if (cachedMetrics) {
      return NextResponse.json(cachedMetrics);
    }
    return NextResponse.json(
      { error: 'Failed to fetch Bitcoin metrics' },
      { status: 502 }
    );
  }
}
