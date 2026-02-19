// ===========================================
// FUD & Sentiment Source Fetchers
// Twitter/X (when token available), Reddit (public)
// ===========================================

export interface FUDSignal {
  source: 'twitter' | 'reddit' | 'news';
  externalId: string;
  text: string;
  author: string;
  authorFollowers?: number;
  url: string;
  publishedAt: string;
  engagement: { likes: number; retweets: number; replies: number };
  matchedKeywords: string[];
}

// --- FUD Keywords ---

const FUD_KEYWORDS = [
  'bitcoin ban', 'bitcoin dead', 'bitcoin dying', 'bitcoin crash',
  'quantum bitcoin', 'quantum computer bitcoin', 'quantum threat',
  'bitcoin hack', 'bitcoin hacked', '51% attack',
  'bitcoin energy', 'bitcoin waste', 'bitcoin environmental',
  'bitcoin ponzi', 'bitcoin scam', 'bitcoin bubble',
  'bitcoin too slow', 'bitcoin obsolete', 'bitcoin replaced',
  'cbdc replace bitcoin', 'bitcoin regulation', 'bitcoin illegal',
  'bitcoin centralized', 'mining centralization',
];

function matchKeywords(text: string): string[] {
  const lower = text.toLowerCase();
  return FUD_KEYWORDS.filter((kw) => lower.includes(kw));
}

// --- Reddit Fetcher (public, no auth needed) ---

interface RedditListing {
  data: {
    children: Array<{
      data: {
        id: string;
        title: string;
        selftext: string;
        author: string;
        score: number;
        num_comments: number;
        permalink: string;
        created_utc: number;
        ups: number;
      };
    }>;
  };
}

export async function fetchRedditSignals(since?: Date): Promise<FUDSignal[]> {
  const signals: FUDSignal[] = [];
  const subreddits = ['Bitcoin', 'CryptoCurrency'];
  const minEngagement = parseInt(process.env.FUD_MIN_ENGAGEMENT || '500', 10);

  for (const sub of subreddits) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15000);

      const res = await fetch(`https://www.reddit.com/r/${sub}/new.json?limit=50`, {
        signal: controller.signal,
        headers: { 'User-Agent': 'BitcoinRMF/1.0 (threat-monitor)' },
      });
      clearTimeout(timer);

      if (!res.ok) continue;
      const data: RedditListing = await res.json();

      for (const child of data.data.children) {
        const post = child.data;
        const fullText = `${post.title} ${post.selftext}`;
        const matched = matchKeywords(fullText);

        if (matched.length === 0) continue;

        // Filter by engagement
        const totalEngagement = post.score + post.num_comments;
        if (totalEngagement < minEngagement) continue;

        // Filter by date
        const postDate = new Date(post.created_utc * 1000);
        if (since && postDate < since) continue;

        signals.push({
          source: 'reddit',
          externalId: `reddit-${post.id}`,
          text: fullText.slice(0, 2000),
          author: post.author,
          url: `https://reddit.com${post.permalink}`,
          publishedAt: postDate.toISOString(),
          engagement: {
            likes: post.ups,
            retweets: 0,
            replies: post.num_comments,
          },
          matchedKeywords: matched,
        });
      }
    } catch {
      console.warn(`[fud-sources] Reddit r/${sub} fetch failed`);
    }
  }

  return signals;
}

// --- Twitter/X Fetcher (requires TWITTER_BEARER_TOKEN) ---

interface TwitterSearchResponse {
  data?: Array<{
    id: string;
    text: string;
    created_at: string;
    public_metrics: {
      like_count: number;
      retweet_count: number;
      reply_count: number;
    };
    author_id: string;
  }>;
  includes?: {
    users?: Array<{
      id: string;
      username: string;
      public_metrics: { followers_count: number };
    }>;
  };
}

export async function fetchTwitterSignals(since?: Date): Promise<FUDSignal[]> {
  const bearerToken = process.env.TWITTER_BEARER_TOKEN;
  if (!bearerToken) {
    // Twitter not configured — skip silently
    return [];
  }

  const signals: FUDSignal[] = [];
  const minEngagement = parseInt(process.env.FUD_MIN_ENGAGEMENT || '500', 10);

  const query = encodeURIComponent(
    '(bitcoin ban OR bitcoin dead OR quantum bitcoin OR bitcoin hack) -is:retweet lang:en'
  );
  let url = `https://api.twitter.com/2/tweets/search/recent?query=${query}&max_results=50&tweet.fields=created_at,public_metrics,author_id&expansions=author_id&user.fields=public_metrics,username`;

  if (since) {
    url += `&start_time=${since.toISOString()}`;
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
        'User-Agent': 'BitcoinRMF/1.0',
      },
    });
    clearTimeout(timer);

    if (!res.ok) {
      console.warn(`[fud-sources] Twitter API returned ${res.status}`);
      return signals;
    }

    const data: TwitterSearchResponse = await res.json();
    if (!data.data) return signals;

    // Build user map
    const userMap = new Map<string, { username: string; followers: number }>();
    for (const user of data.includes?.users || []) {
      userMap.set(user.id, {
        username: user.username,
        followers: user.public_metrics.followers_count,
      });
    }

    for (const tweet of data.data) {
      const matched = matchKeywords(tweet.text);
      if (matched.length === 0) continue;

      const totalEngagement =
        tweet.public_metrics.like_count +
        tweet.public_metrics.retweet_count +
        tweet.public_metrics.reply_count;

      if (totalEngagement < minEngagement) continue;

      const user = userMap.get(tweet.author_id);

      signals.push({
        source: 'twitter',
        externalId: `twitter-${tweet.id}`,
        text: tweet.text.slice(0, 2000),
        author: user?.username || tweet.author_id,
        authorFollowers: user?.followers,
        url: `https://x.com/i/status/${tweet.id}`,
        publishedAt: tweet.created_at,
        engagement: {
          likes: tweet.public_metrics.like_count,
          retweets: tweet.public_metrics.retweet_count,
          replies: tweet.public_metrics.reply_count,
        },
        matchedKeywords: matched,
      });
    }
  } catch {
    console.warn('[fud-sources] Twitter fetch failed');
  }

  return signals;
}

// --- Fetch All FUD Sources ---

export async function fetchAllFUDSignals(since?: Date): Promise<FUDSignal[]> {
  const results = await Promise.allSettled([
    fetchRedditSignals(since),
    fetchTwitterSignals(since),
  ]);

  const signals: FUDSignal[] = [];
  for (const result of results) {
    if (result.status === 'fulfilled') {
      signals.push(...result.value);
    } else {
      console.warn('[fud-sources] Fetch failed:', result.reason);
    }
  }

  return signals;
}
