import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDailyQuests, assignDailyQuests, selectDailyQuest } from '@/lib/db/quests';
import { getLatestRecoveryScore } from '@/lib/db/recovery';
import { getRecoveryRecommendation } from '@/lib/recovery';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let quests = await getDailyQuests(session.user.id);
    if (quests.length === 0) {
      quests = await assignDailyQuests(session.user.id);
    }

    // Get recovery recommendation
    const recoveryScore = await getLatestRecoveryScore(session.user.id);
    const recommendation = getRecoveryRecommendation(
      recoveryScore?.score ?? null,
      recoveryScore?.source ?? null
    );

    return NextResponse.json({ quests, recommendation });
  } catch (error) {
    console.error('Daily quests API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { questId } = await request.json();
    if (!questId) {
      return NextResponse.json({ error: 'questId is required' }, { status: 400 });
    }

    const assignment = await selectDailyQuest(session.user.id, questId);
    if (!assignment) {
      return NextResponse.json({ error: 'Quest not found in daily assignments' }, { status: 404 });
    }

    return NextResponse.json({ assignment });
  } catch (error) {
    console.error('Daily quest select error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
