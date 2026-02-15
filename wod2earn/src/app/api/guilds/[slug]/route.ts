import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getGuildBySlug, getGuildMembers, updateGuild, getGuildMember } from '@/lib/db/guilds';

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

    const members = await getGuildMembers(guild.id);
    return NextResponse.json({ guild, members });
  } catch (error) {
    console.error('Guild detail GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
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

    // Only admin can update
    const member = await getGuildMember(guild.id, session.user.id);
    if (!member || member.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description }: { name?: string; description?: string } = body;

    const updated = await updateGuild(guild.id, { name, description });
    return NextResponse.json({ guild: updated });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : '';
    if (msg.includes('duplicate key')) {
      return NextResponse.json({ error: 'A guild with that name already exists' }, { status: 409 });
    }
    console.error('Guild PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
