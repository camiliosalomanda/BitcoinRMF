'use client';

import { useState } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Shield, ShieldCheck, UserMinus, ChevronUp, ChevronDown } from 'lucide-react';
import type { GuildMemberEntry, GuildRole } from '@/types';

interface GuildMemberListProps {
  members: GuildMemberEntry[];
  currentUserRole: GuildRole | null;
  currentUserId: string | null;
  guildSlug: string;
  onRefresh: () => void;
}

const roleBadge: Record<GuildRole, { label: string; color: string; icon: typeof Shield }> = {
  admin: { label: 'Admin', color: 'text-gold bg-gold/10 border-gold/30', icon: ShieldCheck },
  moderator: { label: 'Mod', color: 'text-neon-purple bg-neon-purple/10 border-neon-purple/30', icon: Shield },
  member: { label: 'Member', color: 'text-text-muted bg-dark-surface border-card-border', icon: Shield },
};

export function GuildMemberList({
  members,
  currentUserRole,
  currentUserId,
  guildSlug,
  onRefresh,
}: GuildMemberListProps) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const canManageRoles = currentUserRole === 'admin';
  const canKick = currentUserRole === 'admin' || currentUserRole === 'moderator';

  const handleRoleChange = async (userId: string, newRole: GuildRole) => {
    setLoadingAction(userId);
    try {
      await fetch(`/api/guilds/${guildSlug}/members/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      onRefresh();
    } finally {
      setLoadingAction(null);
    }
  };

  const handleKick = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return;
    setLoadingAction(userId);
    try {
      await fetch(`/api/guilds/${guildSlug}/members/${userId}`, {
        method: 'DELETE',
      });
      onRefresh();
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="space-y-2">
      {members.map((member) => {
        const badge = roleBadge[member.role];
        const BadgeIcon = badge.icon;
        const isCurrentUser = member.user_id === currentUserId;
        const isLoading = loadingAction === member.user_id;

        return (
          <div
            key={member.user_id}
            className="flex items-center gap-3 px-4 py-3 bg-card-bg/50 border border-card-border rounded-lg"
          >
            <Avatar
              username={member.username}
              avatarUrl={member.avatar_url}
              level={member.level}
              size="sm"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">
                {member.display_name}
                {isCurrentUser && <span className="text-text-muted ml-1">(you)</span>}
              </p>
              <p className="text-xs text-text-muted">@{member.username}</p>
            </div>

            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${badge.color}`}>
              <BadgeIcon size={12} />
              {badge.label}
            </span>

            {/* Admin actions */}
            {!isCurrentUser && !isLoading && (
              <div className="flex items-center gap-1">
                {canManageRoles && member.role === 'member' && (
                  <button
                    onClick={() => handleRoleChange(member.user_id, 'moderator')}
                    className="p-1.5 rounded hover:bg-neon-purple/10 text-text-muted hover:text-neon-purple transition-colors"
                    title="Promote to Moderator"
                  >
                    <ChevronUp size={16} />
                  </button>
                )}
                {canManageRoles && member.role === 'moderator' && (
                  <button
                    onClick={() => handleRoleChange(member.user_id, 'member')}
                    className="p-1.5 rounded hover:bg-text-muted/10 text-text-muted hover:text-text-primary transition-colors"
                    title="Demote to Member"
                  >
                    <ChevronDown size={16} />
                  </button>
                )}
                {canKick && (member.role === 'member' || (currentUserRole === 'admin' && member.role === 'moderator')) && (
                  <button
                    onClick={() => handleKick(member.user_id)}
                    className="p-1.5 rounded hover:bg-red-500/10 text-text-muted hover:text-red-400 transition-colors"
                    title="Kick member"
                  >
                    <UserMinus size={16} />
                  </button>
                )}
                {canManageRoles && member.role !== 'admin' && (
                  <Button
                    size="sm"
                    variant="gold"
                    onClick={() => handleRoleChange(member.user_id, 'admin')}
                    className="ml-1 text-[10px] px-2 py-1"
                  >
                    Transfer Admin
                  </Button>
                )}
              </div>
            )}
            {isLoading && (
              <div className="w-4 h-4 border-2 border-neon-blue border-t-transparent rounded-full animate-spin" />
            )}
          </div>
        );
      })}
    </div>
  );
}
