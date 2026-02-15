'use client';

import { useState, useEffect, useCallback } from 'react';
import { LeaderboardTable } from '@/components/leaderboard/LeaderboardTable';
import type { LeaderboardEntry } from '@/types';

const tabs = [
  { id: 'total_xp', label: 'Total XP', valueLabel: 'XP' },
  { id: 'weekly_xp', label: 'Weekly XP', valueLabel: 'XP' },
  { id: 'streaks', label: 'Streaks', valueLabel: 'Days' },
];

interface GuildLeaderboardProps {
  guildSlug: string;
}

export function GuildLeaderboard({ guildSlug }: GuildLeaderboardProps) {
  const [activeTab, setActiveTab] = useState('total_xp');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/guilds/${guildSlug}/leaderboard?type=${activeTab}`);
      if (res.ok) {
        const data = await res.json();
        setEntries(data.entries ?? []);
      }
    } catch (err) {
      console.error('Guild leaderboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [guildSlug, activeTab]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const currentTab = tabs.find((t) => t.id === activeTab)!;

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
              activeTab === tab.id
                ? 'bg-neon-purple/20 border-neon-purple text-neon-purple'
                : 'border-card-border text-text-secondary hover:text-text-primary hover:border-neon-purple/30'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-card-bg border border-card-border rounded-xl p-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-neon-purple border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <LeaderboardTable entries={entries} valueLabel={currentTab.valueLabel} />
        )}
      </div>
    </div>
  );
}
