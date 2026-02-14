import type { RecoveryLevel, RecoveryRecommendation } from '@/types';

export interface RecoveryTierInfo {
  label: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export const RECOVERY_TIERS: Record<RecoveryLevel, RecoveryTierInfo> = {
  low: {
    label: 'Rest Day',
    description: 'Light movement to help your body recover',
    icon: 'Moon',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-400/10',
    borderColor: 'border-emerald-400/30',
  },
  medium: {
    label: 'Active Recovery',
    description: 'Moderate activity to stay moving without overloading',
    icon: 'Heart',
    color: 'text-sky-400',
    bgColor: 'bg-sky-400/10',
    borderColor: 'border-sky-400/30',
  },
  high: {
    label: 'Full WOD',
    description: 'Push your limits with a full workout',
    icon: 'Flame',
    color: 'text-purple-400',
    bgColor: 'bg-purple-400/10',
    borderColor: 'border-purple-400/30',
  },
};

export const RECOVERY_TIER_ORDER: RecoveryLevel[] = ['low', 'medium', 'high'];

export function getRecoveryRecommendation(
  score: number | null,
  source: string | null
): RecoveryRecommendation {
  if (score === null || score === undefined) {
    return { level: 'high', score: null, source: null, confidence: 'none' };
  }

  let level: RecoveryLevel;
  if (score <= 33) {
    level = 'low';
  } else if (score <= 66) {
    level = 'medium';
  } else {
    level = 'high';
  }

  return { level, score, source, confidence: 'data' };
}
