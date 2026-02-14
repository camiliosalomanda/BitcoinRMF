'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Swords, Filter } from 'lucide-react';
import { useQuests } from '@/hooks/useQuests';
import { QuestCard } from '@/components/workout/QuestCard';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { RECOVERY_TIERS } from '@/lib/recovery';
import type { DifficultyLevel, QuestCategory, RecoveryLevel } from '@/types';

const difficulties: DifficultyLevel[] = ['beginner', 'intermediate', 'advanced', 'elite'];
const categories: QuestCategory[] = ['strength', 'cardio', 'flexibility', 'endurance', 'mixed'];
const recoveryLevels: { key: RecoveryLevel; label: string }[] = [
  { key: 'low', label: RECOVERY_TIERS.low.label },
  { key: 'medium', label: RECOVERY_TIERS.medium.label },
  { key: 'high', label: RECOVERY_TIERS.high.label },
];

export default function QuestsPage() {
  const { status } = useSession();
  const router = useRouter();
  const { quests, loading, filters, setFilters } = useQuests();

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin');
  }, [status, router]);

  return (
    <div className="min-h-screen bg-dark-bg">
      <Navbar />
      <Sidebar />
      <main className="pt-16 lg:pl-60">
        <div className="p-4 sm:p-6 max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-heading text-2xl font-bold flex items-center gap-2">
                <Swords className="text-neon-blue" size={24} /> Quest Board
              </h1>
              <p className="text-text-secondary text-sm mt-1">Choose your challenge and earn XP</p>
            </div>
          </div>

          {/* Recovery Level Filter */}
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-text-muted" />
              <span className="text-xs text-text-muted">Recovery:</span>
            </div>
            <button
              onClick={() => setFilters({ ...filters, recovery_level: undefined })}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                !filters.recovery_level ? 'bg-neon-green/20 border-neon-green text-neon-green' : 'border-card-border text-text-secondary hover:border-neon-green/30'
              }`}
            >
              All
            </button>
            {recoveryLevels.map((r) => (
              <button
                key={r.key}
                onClick={() => setFilters({ ...filters, recovery_level: filters.recovery_level === r.key ? undefined : r.key })}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  filters.recovery_level === r.key ? 'bg-neon-green/20 border-neon-green text-neon-green' : 'border-card-border text-text-secondary hover:border-neon-green/30'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Difficulty Filter */}
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-muted ml-5">Difficulty:</span>
            </div>
            <button
              onClick={() => setFilters({ ...filters, difficulty: undefined })}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                !filters.difficulty ? 'bg-neon-blue/20 border-neon-blue text-neon-blue' : 'border-card-border text-text-secondary hover:border-neon-blue/30'
              }`}
            >
              All
            </button>
            {difficulties.map((d) => (
              <button
                key={d}
                onClick={() => setFilters({ ...filters, difficulty: filters.difficulty === d ? undefined : d })}
                className={`px-3 py-1 rounded-full text-xs font-medium border capitalize transition-colors ${
                  filters.difficulty === d ? 'bg-neon-blue/20 border-neon-blue text-neon-blue' : 'border-card-border text-text-secondary hover:border-neon-blue/30'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 mb-8">
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-muted ml-5">Category:</span>
            </div>
            <button
              onClick={() => setFilters({ ...filters, category: undefined })}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                !filters.category ? 'bg-neon-pink/20 border-neon-pink text-neon-pink' : 'border-card-border text-text-secondary hover:border-neon-pink/30'
              }`}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setFilters({ ...filters, category: filters.category === c ? undefined : c })}
                className={`px-3 py-1 rounded-full text-xs font-medium border capitalize transition-colors ${
                  filters.category === c ? 'bg-neon-pink/20 border-neon-pink text-neon-pink' : 'border-card-border text-text-secondary hover:border-neon-pink/30'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="w-8 h-8 border-2 border-neon-blue border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-text-secondary text-sm">Loading quests...</p>
            </div>
          ) : quests.length === 0 ? (
            <div className="text-center py-20">
              <Swords className="text-text-muted mx-auto mb-3" size={48} />
              <p className="text-text-secondary">No quests found with these filters.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {quests.map((quest) => (
                <QuestCard key={quest.id} quest={quest} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
