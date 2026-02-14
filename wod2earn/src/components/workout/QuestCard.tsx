'use client';

import Link from 'next/link';
import { Clock, Zap } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { RECOVERY_TIERS } from '@/lib/recovery';
import type { Quest } from '@/types';

interface QuestCardProps {
  quest: Quest;
}

const categoryIcons: Record<string, string> = {
  strength: '\u{1F4AA}',
  cardio: '\u{1F3C3}',
  flexibility: '\u{1F9D8}',
  endurance: '\u{1F525}',
  mixed: '\u{26A1}',
};

export function QuestCard({ quest }: QuestCardProps) {
  const tier = RECOVERY_TIERS[quest.recovery_level];

  return (
    <Card className="flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{categoryIcons[quest.category] || '\u{2694}'}</span>
          <div>
            <h3 className="font-semibold text-text-primary">{quest.title}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="difficulty" difficulty={quest.difficulty}>
                {quest.difficulty}
              </Badge>
              <Badge variant="recovery" recoveryLevel={quest.recovery_level}>
                {tier.label}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 text-gold font-bold text-sm">
          <Zap size={14} /> {quest.xp_reward}
        </div>
      </div>

      <p className="text-sm text-text-secondary mb-4 flex-1">{quest.description}</p>

      {/* Exercises preview */}
      <div className="space-y-1 mb-4">
        {quest.exercises.slice(0, 3).map((ex, i) => (
          <div key={i} className="text-xs text-text-muted flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-neon-blue flex-shrink-0" />
            {ex.name}
            {ex.sets && ex.reps && ` - ${ex.sets}x${ex.reps}`}
            {ex.duration_seconds && ` - ${Math.floor(ex.duration_seconds / 60)}min`}
          </div>
        ))}
        {quest.exercises.length > 3 && (
          <p className="text-xs text-text-muted">+{quest.exercises.length - 3} more exercises</p>
        )}
      </div>

      <div className="flex items-center justify-between mt-auto pt-3 border-t border-card-border">
        <span className="text-xs text-text-muted flex items-center gap-1">
          <Clock size={12} /> ~{quest.estimated_minutes} min
        </span>
        <Link
          href={`/workouts/log?quest=${quest.id}`}
          className="text-xs font-semibold text-neon-blue hover:underline"
        >
          Start Quest &rarr;
        </Link>
      </div>
    </Card>
  );
}
