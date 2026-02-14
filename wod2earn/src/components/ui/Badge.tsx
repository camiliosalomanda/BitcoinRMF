import type { DifficultyLevel, AchievementRarity, RecoveryLevel } from '@/types';

interface BadgeProps {
  variant?: 'difficulty' | 'rarity' | 'recovery' | 'custom';
  difficulty?: DifficultyLevel;
  rarity?: AchievementRarity;
  recoveryLevel?: RecoveryLevel;
  color?: string;
  children: React.ReactNode;
}

const difficultyColors: Record<DifficultyLevel, string> = {
  beginner: 'bg-neon-green/20 text-neon-green border-neon-green/30',
  intermediate: 'bg-neon-blue/20 text-neon-blue border-neon-blue/30',
  advanced: 'bg-neon-purple/20 text-neon-purple border-neon-purple/30',
  elite: 'bg-gold/20 text-gold border-gold/30',
};

const rarityColors: Record<AchievementRarity, string> = {
  common: 'bg-text-secondary/20 text-text-secondary border-text-secondary/30',
  rare: 'bg-neon-blue/20 text-neon-blue border-neon-blue/30',
  epic: 'bg-neon-purple/20 text-neon-purple border-neon-purple/30',
  legendary: 'bg-gold/20 text-gold border-gold/30',
};

const recoveryColors: Record<RecoveryLevel, string> = {
  low: 'bg-emerald-400/20 text-emerald-400 border-emerald-400/30',
  medium: 'bg-sky-400/20 text-sky-400 border-sky-400/30',
  high: 'bg-purple-400/20 text-purple-400 border-purple-400/30',
};

export function Badge({ variant = 'custom', difficulty, rarity, recoveryLevel, children }: BadgeProps) {
  let colorClass = 'bg-card-border text-text-secondary border-card-border';

  if (variant === 'difficulty' && difficulty) {
    colorClass = difficultyColors[difficulty];
  } else if (variant === 'rarity' && rarity) {
    colorClass = rarityColors[rarity];
  } else if (variant === 'recovery' && recoveryLevel) {
    colorClass = recoveryColors[recoveryLevel];
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorClass}`}>
      {children}
    </span>
  );
}
