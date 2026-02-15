import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getGuildBySlug, leaveGuild } from '@/lib/db/guilds';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await params;
    const guild = await getGuildBySlug(slug);
    if (!guild) {
      return NextResponse.json({ error: 'Guild not found' }, { status: 404 });
    }

    await leaveGuild(guild.id, session.user.id);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : '';
    if (msg.includes('transfer ownership')) {
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    console.error('Guild leave error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
