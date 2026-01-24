// Pattern and step data types

export interface Material {
  item: string;
  details: string;
  emoji: string;
  affiliateUrl?: string; // Amazon or craft store affiliate link
}

export interface StitchTag {
  abbreviation: string;
  fullName: string;
  kidName: string;
  emoji: string;
}

export interface PatternStep {
  stepNumber: number;
  title: string;
  instruction: string;
  stitches: StitchTag[];
  stitchCount: string;
  visualTip: string;
  isCompleted: boolean;
}

export interface PatternData {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy Peasy' | 'A Little Tricky' | 'Challenge Mode';
  estimatedTime: string;
  materials: Material[];
  steps: PatternStep[];
  createdAt: string;
  completedSteps: number;
  totalStars: number;
  isComplete: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  unlocked: boolean;
  unlockedAt?: string;
  requirement: {
    type: 'patterns_completed' | 'steps_completed' | 'stars_earned' | 'streak_days';
    count: number;
  };
}

export interface UserProgress {
  totalStars: number;
  patternsCompleted: number;
  stepsCompleted: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  achievements: Achievement[];
  savedPatterns: PatternData[];
}

// User & Subscription Types
export interface User {
  id: string;
  email: string;
  displayName?: string;
  createdAt: string;
  isPro: boolean;
  subscriptionExpiry?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: string;
  period: 'monthly' | 'yearly' | 'lifetime';
  features: string[];
}

export type SubscriptionStatus = 'free' | 'pro' | 'expired';
