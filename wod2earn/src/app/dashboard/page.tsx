'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { StatsOverview } from '@/components/dashboard/StatsOverview';
import { XPBar } from '@/components/dashboard/XPBar';
import { StreakCounter } from '@/components/dashboard/StreakCounter';
import { DailyQuestsWidget } from '@/components/dashboard/DailyQuestsWidget';
import { RecentWorkouts } from '@/components/dashboard/RecentWorkouts';
import { AchievementShowcase } from '@/components/dashboard/AchievementShowcase';
import type { UserProfile, DailyQuestAssignment, Workout, UserAchievement, RecoveryRecommendation } from '@/types';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { setUser } = useAppStore();
  const [user, setLocalUser] = useState<UserProfile | null>(null);
  const [dailyQuests, setDailyQuests] = useState<DailyQuestAssignment[]>([]);
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([]);
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [weeklyWorkouts, setWeeklyWorkouts] = useState(0);
  const [recommendation, setRecommendation] = useState<RecoveryRecommendation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (!session?.user?.id) return;

    async function fetchDashboard() {
      try {
        const res = await fetch('/api/dashboard');
        if (res.ok) {
          const data = await res.json();
          setLocalUser(data.user);
          setUser(data.user);
          setDailyQuests(data.dailyQuests ?? []);
          setRecentWorkouts(data.recentWorkouts ?? []);
          setAchievements(data.achievements ?? []);
          setWeeklyWorkouts(data.weeklyWorkouts ?? 0);
          setRecommendation(data.recommendation ?? null);
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, [session?.user?.id, setUser]);

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-neon-blue border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-text-secondary text-sm">Loading your stats...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <p className="text-text-secondary">Could not load profile. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Dashboard</h1>
          <p className="text-text-secondary text-sm mt-1">Welcome back, {user.display_name}!</p>
        </div>
        <Link
          href="/workouts/log"
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-neon-green/20 border border-neon-green text-neon-green rounded-lg hover:bg-neon-green/30 transition-colors glow-green"
        >
          <Plus size={16} /> Log Workout
        </Link>
      </div>

      {/* Stats Grid */}
      <StatsOverview user={user} weeklyWorkouts={weeklyWorkouts} />

      {/* XP Bar */}
      <XPBar user={user} />

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <StreakCounter user={user} />
          <DailyQuestsWidget quests={dailyQuests} recommendation={recommendation} />
        </div>
        <div className="space-y-6">
          <RecentWorkouts workouts={recentWorkouts} />
          <AchievementShowcase achievements={achievements} />
        </div>
      </div>
    </div>
  );
}
