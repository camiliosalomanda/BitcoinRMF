'use client';

import Link from 'next/link';
import { Moon, Heart, Flame, Check, ArrowRight, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { RECOVERY_TIERS, RECOVERY_TIER_ORDER } from '@/lib/recovery';
import type { DailyQuestAssignment, RecoveryRecommendation, RecoveryLevel } from '@/types';

interface DailyQuestsWidgetProps {
  quests: DailyQuestAssignment[];
  recommendation?: RecoveryRecommendation | null;
}

const tierIcons: Record<RecoveryLevel, typeof Moon> = {
  low: Moon,
  medium: Heart,
  high: Flame,
};

export function DailyQuestsWidget({ quests, recommendation }: DailyQuestsWidgetProps) {
  const hasCompleted = quests.some((q) => q.completed);

  // Sort quests by recovery tier order
  const sortedQuests = [...quests].sort((a, b) => {
    return RECOVERY_TIER_ORDER.indexOf(a.recovery_level) - RECOVERY_TIER_ORDER.indexOf(b.recovery_level);
  });

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Flame className="text-neon-blue" size={20} />
          <h3 className="font-heading font-bold">Daily Quests</h3>
        </div>
        <Link href="/quests" className="text-xs text-neon-blue hover:underline flex items-center gap-1">
          View all <ArrowRight size={12} />
        </Link>
      </div>

      {recommendation && recommendation.confidence === 'data' && recommendation.score !== null && (
        <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-dark-surface border border-card-border">
          <Sparkles size={14} className="text-gold flex-shrink-0" />
          <span className="text-xs text-text-secondary">
            Recovery score: <span className="font-bold text-text-primary">{recommendation.score}/100</span>
            {recommendation.source && <span className="text-text-muted"> via {recommendation.source}</span>}
          </span>
        </div>
      )}

      {sortedQuests.length === 0 ? (
        <p className="text-sm text-text-muted py-4 text-center">
          No quests assigned yet. Check back soon!
        </p>
      ) : (
        <div className="space-y-3">
          {sortedQuests.map((assignment) => {
            const quest = assignment.quest;
            if (!quest) return null;

            const tier = RECOVERY_TIERS[assignment.recovery_level];
            const Icon = tierIcons[assignment.recovery_level];
            const isRecommended = recommendation?.confidence === 'data' && recommendation.level === assignment.recovery_level;
            const isDimmed = hasCompleted && !assignment.completed;

            return (
              <Link
                key={assignment.id}
                href={`/workouts/log?quest=${quest.id}`}
                className={`block p-3 rounded-lg border transition-all ${
                  assignment.completed
                    ? 'bg-neon-green/5 border-neon-green/20'
                    : isDimmed
                      ? 'bg-dark-surface/50 border-card-border/50 opacity-50'
                      : `${tier.bgColor} ${tier.borderColor} hover:scale-[1.01]`
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    {assignment.completed ? (
                      <div className="w-8 h-8 rounded-full bg-neon-green/20 flex items-center justify-center flex-shrink-0">
                        <Check className="text-neon-green" size={16} />
                      </div>
                    ) : (
                      <div className={`w-8 h-8 rounded-full ${tier.bgColor} border ${tier.borderColor} flex items-center justify-center flex-shrink-0`}>
                        <Icon className={tier.color} size={14} />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-medium truncate ${assignment.completed ? 'text-neon-green line-through' : 'text-text-primary'}`}>
                          {quest.title}
                        </p>
                        {isRecommended && !assignment.completed && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-gold/20 text-gold border border-gold/30">
                            Recommended
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="recovery" recoveryLevel={assignment.recovery_level}>
                          {tier.label}
                        </Badge>
                        <span className="text-[10px] text-text-muted">~{quest.estimated_minutes} min</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-gold flex-shrink-0 ml-2">+{quest.xp_reward} XP</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {hasCompleted && (
        <p className="text-xs text-neon-green text-center mt-3 font-medium">
          Quest completed today! Streak maintained.
        </p>
      )}
    </Card>
  );
}
