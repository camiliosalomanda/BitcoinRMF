'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Shield, Search, Plus } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { GuildCard } from '@/components/guilds/GuildCard';
import { CreateGuildModal } from '@/components/guilds/CreateGuildModal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { Guild, GuildWithRole } from '@/types';

export default function GuildsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [myGuild, setMyGuild] = useState<GuildWithRole | null>(null);
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin');
  }, [status, router]);

  const fetchMyGuild = useCallback(async () => {
    try {
      const res = await fetch('/api/guilds/me');
      if (res.ok) {
        const data = await res.json();
        setMyGuild(data.guild);
      }
    } catch (err) {
      console.error('Fetch my guild error:', err);
    }
  }, []);

  const fetchGuilds = useCallback(async () => {
    setLoading(true);
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : '';
      const res = await fetch(`/api/guilds${params}`);
      if (res.ok) {
        const data = await res.json();
        setGuilds(data.guilds ?? []);
      }
    } catch (err) {
      console.error('Fetch guilds error:', err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchMyGuild();
  }, [fetchMyGuild]);

  useEffect(() => {
    if (!myGuild) {
      fetchGuilds();
    }
  }, [myGuild, fetchGuilds]);

  const handleCreated = (slug: string) => {
    setShowCreate(false);
    router.push(`/guilds/${slug}`);
  };

  // Debounced search
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  return (
    <div className="min-h-screen bg-dark-bg">
      <Navbar />
      <Sidebar />
      <main className="pt-16 lg:pl-60">
        <div className="p-4 sm:p-6 max-w-4xl mx-auto">
          <h1 className="font-heading text-2xl font-bold flex items-center gap-2 mb-6">
            <Shield className="text-neon-purple" size={24} /> Guild
          </h1>

          {/* User's guild */}
          {myGuild && (
            <div className="mb-8">
              <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-3">Your Guild</h2>
              <GuildCard guild={myGuild} />
              <p className="text-xs text-text-muted mt-2">
                Role: <span className="capitalize text-neon-purple">{myGuild.role}</span>
              </p>
            </div>
          )}

          {/* Browse guilds (only if no guild) */}
          {!myGuild && (
            <>
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                  <Input
                    id="guild-search"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search guilds..."
                    className="pl-9"
                  />
                </div>
                <Button onClick={() => setShowCreate(true)}>
                  <Plus size={16} className="mr-1" /> Create Guild
                </Button>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-2 border-neon-purple border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              ) : guilds.length === 0 ? (
                <div className="text-center py-12">
                  <Shield className="text-text-muted mx-auto mb-3" size={40} />
                  <p className="text-text-muted">
                    {search ? 'No guilds found' : 'No guilds yet. Create the first one!'}
                  </p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {guilds.map((guild) => (
                    <GuildCard key={guild.id} guild={guild} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <CreateGuildModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={handleCreated}
      />
    </div>
  );
}
