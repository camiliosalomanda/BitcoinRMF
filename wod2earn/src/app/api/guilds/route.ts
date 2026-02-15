import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createGuild, searchGuilds } from '@/lib/db/guilds';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const guilds = await searchGuilds(search);
    return NextResponse.json({ guilds });
  } catch (error) {
    console.error('Guilds GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description }: { name: string; description?: string } = body;

    if (!name || name.trim().length < 2) {
      return NextResponse.json({ error: 'Guild name must be at least 2 characters' }, { status: 400 });
    }

    if (name.trim().length > 50) {
      return NextResponse.json({ error: 'Guild name must be 50 characters or less' }, { status: 400 });
    }

    const guild = await createGuild({
      name: name.trim(),
      description: description?.trim(),
      created_by: session.user.id,
    });

    return NextResponse.json({ guild }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : '';
    if (msg.includes('duplicate key') || msg.includes('unique')) {
      return NextResponse.json({ error: 'A guild with that name already exists' }, { status: 409 });
    }
    if (msg.includes('unique') && msg.includes('user_id')) {
      return NextResponse.json({ error: 'You are already in a guild' }, { status: 409 });
    }
    console.error('Guilds POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
