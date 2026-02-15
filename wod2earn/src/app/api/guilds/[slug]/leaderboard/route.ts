import { NextResponse } from 'next/server';
import {
  getGuildBySlug,
  getGuildLeaderboardTotalXP,
  getGuildLeaderboardWeeklyXP,
  getGuildLeaderboardStreaks,
} from '@/lib/db/guilds';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const guild = await getGuildBySlug(slug);
    if (!guild) {
      return NextResponse.json({ error: 'Guild not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'total_xp';

    let entries;
    switch (type) {
      case 'weekly_xp':
        entries = await getGuildLeaderboardWeeklyXP(guild.id);
        break;
      case 'streaks':
        entries = await getGuildLeaderboardStreaks(guild.id);
        break;
      default:
        entries = await getGuildLeaderboardTotalXP(guild.id);
    }

    return NextResponse.json({ entries });
  } catch (error) {
    console.error('Guild leaderboard error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
