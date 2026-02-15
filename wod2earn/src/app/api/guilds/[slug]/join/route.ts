import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getGuildBySlug, joinGuild } from '@/lib/db/guilds';

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

    const member = await joinGuild(guild.id, session.user.id);
    return NextResponse.json({ member }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : '';
    if (msg.includes('unique') || msg.includes('duplicate key')) {
      return NextResponse.json({ error: 'You are already in a guild' }, { status: 409 });
    }
    console.error('Guild join error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
