'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Dumbbell } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ExerciseForm } from '@/components/workout/ExerciseForm';
import { WorkoutCompletionModal } from '@/components/workout/WorkoutCompletionModal';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { useAppStore } from '@/lib/store';
import { getTitleForLevel } from '@/lib/xp';
import { RECOVERY_TIERS } from '@/lib/recovery';
import type { Exercise, DifficultyLevel, Quest } from '@/types';

function LogWorkoutForm() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const questId = searchParams.get('quest');
  const { triggerLevelUp, triggerAchievementToast } = useAppStore();

  const [title, setTitle] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([{ name: '', sets: 3, reps: 10 }]);
  const [duration, setDuration] = useState(30);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('beginner');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [quest, setQuest] = useState<Quest | null>(null);
  const [completionData, setCompletionData] = useState<{
    xpEarned: number;
    newStreak: number;
    streakMaintained: boolean;
    levelsGained: number;
    newLevel: number;
  } | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);

  useEffect(() => {
    if (!questId) return;
    async function loadQuest() {
      try {
        const res = await fetch(`/api/quests?id=${questId}`);
        if (res.ok) {
          const data = await res.json();
          const q = data.quests?.[0];
          if (q) {
            setQuest(q);
            setTitle(q.title);
            setExercises(q.exercises);
            setDifficulty(q.difficulty);
            setDuration(q.estimated_minutes);
          }
        }
      } catch (err) {
        console.error('Failed to load quest:', err);
      }
    }
    loadQuest();
  }, [questId]);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin');
  }, [status, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || exercises.length === 0) return;
    setLoading(true);

    try {
      const res = await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          exercises: exercises.filter((ex) => ex.name.trim()),
          duration_seconds: duration * 60,
          difficulty,
          quest_id: quest?.id || undefined,
          notes: notes || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCompletionData({
          xpEarned: data.xpEarned,
          newStreak: data.newStreak,
          streakMaintained: data.streakMaintained,
          levelsGained: data.levelsGained,
          newLevel: data.newLevel,
        });
        setShowCompletion(true);

        if (data.levelsGained > 0) {
          setTimeout(() => {
            triggerLevelUp(data.newLevel, getTitleForLevel(data.newLevel));
          }, 2000);
        }

        if (data.newAchievements?.length > 0) {
          data.newAchievements.forEach((ach: { name: string; icon: string; rarity: string }, i: number) => {
            setTimeout(() => {
              triggerAchievementToast({
                name: ach.name,
                description: 'Achievement Unlocked!',
                icon: ach.icon,
                rarity: ach.rarity,
              });
            }, 1000 + i * 2000);
          });
        }
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to log workout');
      }
    } catch {
      alert('Failed to log workout');
    } finally {
      setLoading(false);
    }
  }

  const difficulties: DifficultyLevel[] = ['beginner', 'intermediate', 'advanced', 'elite'];

  return (
    <>
      <div className="p-4 sm:p-6 max-w-3xl mx-auto">
        <h1 className="font-heading text-2xl font-bold flex items-center gap-2 mb-2">
          <Dumbbell className="text-neon-green" size={24} />
          {quest ? `Quest: ${quest.title}` : 'Log Workout'}
        </h1>

        {quest?.recovery_level && (
          <div className="flex items-center gap-2 mb-6">
            <Badge variant="recovery" recoveryLevel={quest.recovery_level}>
              {RECOVERY_TIERS[quest.recovery_level].label}
            </Badge>
            <span className="text-xs text-text-muted">{RECOVERY_TIERS[quest.recovery_level].description}</span>
          </div>
        )}

        {!quest?.recovery_level && <div className="mb-6" />}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-card-bg border border-card-border rounded-xl p-5">
            <Input
              id="title"
              label="Workout Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Morning Push Day"
              required
            />
          </div>

          <div className="bg-card-bg border border-card-border rounded-xl p-5">
            <ExerciseForm exercises={exercises} onChange={setExercises} />
          </div>

          <div className="bg-card-bg border border-card-border rounded-xl p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                id="duration"
                label="Duration (minutes)"
                type="number"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                min={1}
                max={300}
                required
              />
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Difficulty</label>
                <div className="flex flex-wrap gap-2">
                  {difficulties.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDifficulty(d)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium border capitalize transition-colors ${
                        difficulty === d
                          ? 'bg-neon-blue/20 border-neon-blue text-neon-blue'
                          : 'border-card-border text-text-secondary hover:border-neon-blue/30'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-text-secondary mb-1.5">
                Notes (optional)
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="How did it go?"
                rows={3}
                className="w-full px-4 py-2.5 bg-dark-surface border border-card-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue/50 transition-colors resize-none"
              />
            </div>
          </div>

          <Button type="submit" loading={loading} className="w-full" size="lg">
            Complete Workout
          </Button>
        </form>
      </div>

      <WorkoutCompletionModal
        isOpen={showCompletion}
        onClose={() => {
          setShowCompletion(false);
          router.push('/dashboard');
        }}
        data={completionData}
      />
    </>
  );
}

export default function LogWorkoutPage() {
  return (
    <div className="min-h-screen bg-dark-bg">
      <Navbar />
      <Sidebar />
      <main className="pt-16 lg:pl-60">
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="w-8 h-8 border-2 border-neon-blue border-t-transparent rounded-full animate-spin" />
            </div>
          }
        >
          <LogWorkoutForm />
        </Suspense>
      </main>
    </div>
  );
}
