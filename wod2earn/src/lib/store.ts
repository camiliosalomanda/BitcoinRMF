'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile, Quest, Workout, DailyQuestAssignment, RecoveryRecommendation } from '@/types';

interface AppState {
  // User
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;

  // Daily Quests
  dailyQuests: DailyQuestAssignment[];
  setDailyQuests: (quests: DailyQuestAssignment[]) => void;

  // Recovery Recommendation
  recoveryRecommendation: RecoveryRecommendation | null;
  setRecoveryRecommendation: (rec: RecoveryRecommendation | null) => void;

  // Recent Workouts
  recentWorkouts: Workout[];
  setRecentWorkouts: (workouts: Workout[]) => void;

  // Quest browsing
  quests: Quest[];
  setQuests: (quests: Quest[]) => void;

  // UI State
  showLevelUpModal: boolean;
  levelUpData: { newLevel: number; title: string } | null;
  triggerLevelUp: (newLevel: number, title: string) => void;
  dismissLevelUp: () => void;

  showAchievementToast: boolean;
  achievementToastData: { name: string; description: string; icon: string; rarity: string } | null;
  triggerAchievementToast: (data: { name: string; description: string; icon: string; rarity: string }) => void;
  dismissAchievementToast: () => void;

  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // User
      user: null,
      setUser: (user) => set({ user }),

      // Daily Quests
      dailyQuests: [],
      setDailyQuests: (dailyQuests) => set({ dailyQuests }),

      // Recovery Recommendation
      recoveryRecommendation: null,
      setRecoveryRecommendation: (recoveryRecommendation) => set({ recoveryRecommendation }),

      // Recent Workouts
      recentWorkouts: [],
      setRecentWorkouts: (recentWorkouts) => set({ recentWorkouts }),

      // Quests
      quests: [],
      setQuests: (quests) => set({ quests }),

      // Level Up Modal
      showLevelUpModal: false,
      levelUpData: null,
      triggerLevelUp: (newLevel, title) =>
        set({ showLevelUpModal: true, levelUpData: { newLevel, title } }),
      dismissLevelUp: () => set({ showLevelUpModal: false, levelUpData: null }),

      // Achievement Toast
      showAchievementToast: false,
      achievementToastData: null,
      triggerAchievementToast: (data) =>
        set({ showAchievementToast: true, achievementToastData: data }),
      dismissAchievementToast: () =>
        set({ showAchievementToast: false, achievementToastData: null }),

      // Sidebar
      sidebarOpen: false,
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
    }),
    {
      name: 'wod2earn-store',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
