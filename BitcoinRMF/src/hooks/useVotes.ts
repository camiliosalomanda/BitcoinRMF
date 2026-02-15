'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { VoteSummary, VoteTargetType } from '@/types';

export function useVoteSummary(targetType: VoteTargetType, targetId: string) {
  return useQuery<VoteSummary>({
    queryKey: ['votes', targetType, targetId],
    queryFn: () => apiClient<VoteSummary>(`/api/votes/${targetType}/${targetId}`),
  });
}

interface CastVoteParams {
  targetType: VoteTargetType;
  targetId: string;
  voteValue: 1 | -1;
}

interface CastVoteResponse {
  voteRecorded: boolean;
  netScore: number;
  newStatus: string | null;
}

export function useCastVote() {
  const queryClient = useQueryClient();
  return useMutation<CastVoteResponse, Error, CastVoteParams>({
    mutationFn: (params) =>
      apiClient<CastVoteResponse>('/api/votes', {
        method: 'POST',
        body: JSON.stringify(params),
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['votes', variables.targetType, variables.targetId] });
      queryClient.invalidateQueries({ queryKey: ['review-queue'] });
      queryClient.invalidateQueries({ queryKey: ['threats'] });
      queryClient.invalidateQueries({ queryKey: ['fud'] });
      queryClient.invalidateQueries({ queryKey: ['my-submissions'] });
    },
    onError: (_error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['votes', variables.targetType, variables.targetId] });
    },
  });
}

interface RemoveVoteParams {
  targetType: VoteTargetType;
  targetId: string;
}

export function useRemoveVote() {
  const queryClient = useQueryClient();
  return useMutation<{ deleted: boolean }, Error, RemoveVoteParams>({
    mutationFn: (params) =>
      apiClient<{ deleted: boolean }>(`/api/votes/${params.targetType}/${params.targetId}`, {
        method: 'DELETE',
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['votes', variables.targetType, variables.targetId] });
      queryClient.invalidateQueries({ queryKey: ['review-queue'] });
    },
    onError: (_error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['votes', variables.targetType, variables.targetId] });
    },
  });
}
