import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserGuild } from '@/lib/db/guilds';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const guild = await getUserGuild(session.user.id);
    return NextResponse.json({ guild });
  } catch (error) {
    console.error('Guild me GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
