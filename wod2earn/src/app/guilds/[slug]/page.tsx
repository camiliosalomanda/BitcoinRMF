'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Shield, Users, Trophy, ArrowLeft, LogOut, LogIn } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/Button';
import { GuildMemberList } from '@/components/guilds/GuildMemberList';
import { GuildLeaderboard } from '@/components/guilds/GuildLeaderboard';
import type { Guild, GuildMemberEntry, GuildRole } from '@/types';
import Link from 'next/link';

type Tab = 'members' | 'leaderboard';

export default function GuildDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [guild, setGuild] = useState<Guild | null>(null);
  const [members, setMembers] = useState<GuildMemberEntry[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('members');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin');
  }, [status, router]);

  const fetchGuild = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/guilds/${slug}`);
      if (res.ok) {
        const data = await res.json();
        setGuild(data.guild);
        setMembers(data.members ?? []);
      } else if (res.status === 404) {
        router.push('/guilds');
      }
    } catch (err) {
      console.error('Fetch guild error:', err);
    } finally {
      setLoading(false);
    }
  }, [slug, router]);

  useEffect(() => {
    fetchGuild();
  }, [fetchGuild]);

  const currentUserId = session?.user?.id ?? null;
  const currentMember = members.find((m) => m.user_id === currentUserId);
  const currentUserRole: GuildRole | null = currentMember?.role ?? null;
  const isMember = !!currentMember;

  const handleJoin = async () => {
    setActionLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/guilds/${slug}/join`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to join');
        return;
      }
      fetchGuild();
    } catch {
      setError('Something went wrong');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!confirm('Are you sure you want to leave this guild?')) return;
    setActionLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/guilds/${slug}/leave`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to leave');
        return;
      }
      router.push('/guilds');
    } catch {
      setError('Something went wrong');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg">
        <Navbar />
        <Sidebar />
        <main className="pt-16 lg:pl-60">
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-neon-purple border-t-transparent rounded-full animate-spin" />
          </div>
        </main>
      </div>
    );
  }

  if (!guild) return null;

  return (
    <div className="min-h-screen bg-dark-bg">
      <Navbar />
      <Sidebar />
      <main className="pt-16 lg:pl-60">
        <div className="p-4 sm:p-6 max-w-4xl mx-auto">
          {/* Back link */}
          <Link
            href="/guilds"
            className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-primary mb-4 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Guilds
          </Link>

          {/* Guild header */}
          <div className="bg-card-bg border border-card-border rounded-xl p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-neon-purple/20 border border-neon-purple/30 flex items-center justify-center flex-shrink-0">
                <Shield className="text-neon-purple" size={32} />
              </div>
              <div className="flex-1">
                <h1 className="font-heading text-2xl font-bold text-text-primary">{guild.name}</h1>
                {guild.description && (
                  <p className="text-sm text-text-secondary mt-1">{guild.description}</p>
                )}
                <div className="flex items-center gap-1 mt-2 text-sm text-text-muted">
                  <Users size={16} />
                  <span>{guild.member_count} {guild.member_count === 1 ? 'member' : 'members'}</span>
                </div>
              </div>
              <div className="flex-shrink-0">
                {!isMember ? (
                  <Button onClick={handleJoin} loading={actionLoading}>
                    <LogIn size={16} className="mr-1" /> Join Guild
                  </Button>
                ) : (
                  <Button variant="danger" onClick={handleLeave} loading={actionLoading}>
                    <LogOut size={16} className="mr-1" /> Leave Guild
                  </Button>
                )}
              </div>
            </div>
            {error && <p className="text-sm text-red-400 mt-3">{error}</p>}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('members')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium border transition-all ${
                activeTab === 'members'
                  ? 'bg-neon-purple/20 border-neon-purple text-neon-purple'
                  : 'border-card-border text-text-secondary hover:text-text-primary hover:border-neon-purple/30'
              }`}
            >
              <Users size={16} /> Members
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium border transition-all ${
                activeTab === 'leaderboard'
                  ? 'bg-neon-purple/20 border-neon-purple text-neon-purple'
                  : 'border-card-border text-text-secondary hover:text-text-primary hover:border-neon-purple/30'
              }`}
            >
              <Trophy size={16} /> Leaderboard
            </button>
          </div>

          {/* Tab content */}
          {activeTab === 'members' ? (
            <GuildMemberList
              members={members}
              currentUserRole={currentUserRole}
              currentUserId={currentUserId}
              guildSlug={slug}
              onRefresh={fetchGuild}
            />
          ) : (
            <GuildLeaderboard guildSlug={slug} />
          )}
        </div>
      </main>
    </div>
  );
}
