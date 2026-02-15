'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Shield, Users } from 'lucide-react';
import type { Guild } from '@/types';

interface GuildCardProps {
  guild: Guild;
  showLink?: boolean;
}

export function GuildCard({ guild, showLink = true }: GuildCardProps) {
  const content = (
    <Card glow="purple" className="relative">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-lg bg-neon-purple/20 border border-neon-purple/30 flex items-center justify-center flex-shrink-0">
          <Shield className="text-neon-purple" size={24} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-heading font-bold text-text-primary truncate">{guild.name}</h3>
          {guild.description && (
            <p className="text-sm text-text-secondary mt-1 line-clamp-2">{guild.description}</p>
          )}
          <div className="flex items-center gap-1 mt-2 text-xs text-text-muted">
            <Users size={14} />
            <span>{guild.member_count} {guild.member_count === 1 ? 'member' : 'members'}</span>
          </div>
        </div>
      </div>
    </Card>
  );

  if (showLink) {
    return <Link href={`/guilds/${guild.slug}`}>{content}</Link>;
  }
  return content;
}
