'use client';

import { ThumbsUp, ThumbsDown, LogIn } from 'lucide-react';
import { useVoteSummary, useCastVote, useRemoveVote } from '@/hooks/useVotes';
import { useUserRole } from '@/hooks/useUserRole';
import type { VoteTargetType } from '@/types';

interface VotePanelProps {
  targetType: VoteTargetType;
  targetId: string;
  submittedBy?: string;
  itemStatus?: string;
}

export default function VotePanel({ targetType, targetId, submittedBy, itemStatus }: VotePanelProps) {
  const { isAuthenticated, user } = useUserRole();
  const xId = user?.xId;
  const { data: summary } = useVoteSummary(targetType, targetId);
  const castVote = useCastVote();
  const removeVote = useRemoveVote();

  // Only show voting UI for items under review
  if (itemStatus !== 'draft' && itemStatus !== 'under_review') {
    return null;
  }

  const isOwnSubmission = submittedBy && xId && submittedBy === xId;
  const userVote = summary?.userVote ?? null;
  const approvals = summary?.approvals ?? 0;
  const rejections = summary?.rejections ?? 0;
  const netScore = summary?.netScore ?? 0;
  const threshold = summary?.threshold ?? 3;
  const isPending = castVote.isPending || removeVote.isPending;

  function handleVote(value: 1 | -1) {
    if (isPending) return;

    if (userVote === value) {
      // Toggle off — remove vote
      removeVote.mutate({ targetType, targetId });
    } else {
      castVote.mutate({ targetType, targetId, voteValue: value });
    }
  }

  // Progress bar: map net score to a visual indicator
  // Range: -threshold to +threshold
  const progressPercent = Math.min(100, Math.max(0, ((netScore + threshold) / (threshold * 2)) * 100));

  return (
    <div className="bg-[#111118] border border-[#2a2a3a] rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">Community Vote</h3>
        <span className="text-[10px] text-gray-500">
          {netScore >= 0 ? '+' : ''}{netScore} net · needs {netScore >= 0 ? `+${threshold - netScore}` : `${threshold + Math.abs(netScore)}`} more to {netScore >= 0 ? 'publish' : 'archive'}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-[10px] mb-1">
          <span className="text-red-400">−{threshold} archive</span>
          <span className="text-gray-500">0</span>
          <span className="text-green-400">+{threshold} publish</span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden relative">
          <div
            className="absolute top-0 h-full rounded-full transition-all duration-300"
            style={{
              left: '0%',
              width: `${progressPercent}%`,
              backgroundColor: netScore > 0 ? '#22c55e' : netScore < 0 ? '#ef4444' : '#6b7280',
            }}
          />
          {/* Center marker */}
          <div className="absolute top-0 left-1/2 w-0.5 h-full bg-gray-600" />
        </div>
      </div>

      {/* Vote buttons */}
      {!isAuthenticated ? (
        <div className="flex items-center gap-2 text-gray-500">
          <LogIn size={14} />
          <span className="text-xs">Sign in to vote</span>
        </div>
      ) : isOwnSubmission ? (
        <p className="text-xs text-gray-500">You cannot vote on your own submission</p>
      ) : (
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleVote(1)}
            disabled={isPending}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-all disabled:opacity-50 ${
              userVote === 1
                ? 'bg-green-400/10 text-green-400 border-green-400/30'
                : 'text-gray-400 border-[#2a2a3a] hover:text-green-400 hover:border-green-400/20 hover:bg-green-400/5'
            }`}
          >
            <ThumbsUp size={16} />
            <span>{approvals}</span>
          </button>

          <button
            onClick={() => handleVote(-1)}
            disabled={isPending}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-all disabled:opacity-50 ${
              userVote === -1
                ? 'bg-red-400/10 text-red-400 border-red-400/30'
                : 'text-gray-400 border-[#2a2a3a] hover:text-red-400 hover:border-red-400/20 hover:bg-red-400/5'
            }`}
          >
            <ThumbsDown size={16} />
            <span>{rejections}</span>
          </button>
        </div>
      )}
    </div>
  );
}
