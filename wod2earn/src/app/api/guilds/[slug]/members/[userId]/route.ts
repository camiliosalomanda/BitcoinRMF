import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getGuildBySlug, getGuildMember, updateMemberRole, removeMember, transferAdmin } from '@/lib/db/guilds';
import type { GuildRole } from '@/types';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string; userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug, userId } = await params;
    const guild = await getGuildBySlug(slug);
    if (!guild) {
      return NextResponse.json({ error: 'Guild not found' }, { status: 404 });
    }

    // Only admin can change roles
    const caller = await getGuildMember(guild.id, session.user.id);
    if (!caller || caller.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { role }: { role: GuildRole } = body;

    if (!['admin', 'moderator', 'member'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Cannot change own role
    if (userId === session.user.id) {
      return NextResponse.json({ error: 'Cannot change your own role' }, { status: 400 });
    }

    const target = await getGuildMember(guild.id, userId);
    if (!target) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    if (role === 'admin') {
      // Transfer admin
      await transferAdmin(guild.id, session.user.id, userId);
    } else {
      await updateMemberRole(guild.id, userId, role);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Guild member PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string; userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug, userId } = await params;
    const guild = await getGuildBySlug(slug);
    if (!guild) {
      return NextResponse.json({ error: 'Guild not found' }, { status: 404 });
    }

    // Admin or moderator can kick
    const caller = await getGuildMember(guild.id, session.user.id);
    if (!caller || caller.role === 'member') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Cannot kick yourself
    if (userId === session.user.id) {
      return NextResponse.json({ error: 'Cannot kick yourself' }, { status: 400 });
    }

    const target = await getGuildMember(guild.id, userId);
    if (!target) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Moderators cannot kick admins or other moderators
    if (caller.role === 'moderator' && target.role !== 'member') {
      return NextResponse.json({ error: 'Moderators can only kick members' }, { status: 403 });
    }

    await removeMember(guild.id, userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Guild member DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
