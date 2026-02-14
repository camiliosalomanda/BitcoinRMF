import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserById } from '@/lib/db/users';
import { getWorkoutsByUser, getWeeklyWorkoutCount } from '@/lib/db/workouts';
import { getDailyQuests, assignDailyQuests } from '@/lib/db/quests';
import { getUserAchievements } from '@/lib/db/achievements';
import { getLatestRecoveryScore } from '@/lib/db/recovery';
import { getRecoveryRecommendation } from '@/lib/recovery';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    const [user, recentWorkouts, weeklyWorkouts, achievements, recoveryScore] = await Promise.all([
      getUserById(userId),
      getWorkoutsByUser(userId, 5),
      getWeeklyWorkoutCount(userId),
      getUserAchievements(userId),
      getLatestRecoveryScore(userId),
    ]);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get or assign daily quests
    let dailyQuests = await getDailyQuests(userId);
    if (dailyQuests.length === 0) {
      dailyQuests = await assignDailyQuests(userId);
    }

    const recommendation = getRecoveryRecommendation(
      recoveryScore?.score ?? null,
      recoveryScore?.source ?? null
    );

    return NextResponse.json({
      user,
      dailyQuests,
      recentWorkouts,
      weeklyWorkouts,
      achievements,
      recommendation,
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
