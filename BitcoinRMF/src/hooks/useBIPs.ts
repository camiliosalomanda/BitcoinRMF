'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { BIPEvaluation } from '@/types';
import type { BIPInput } from '@/lib/validators';

export function useBIPs() {
  return useQuery<BIPEvaluation[]>({
    queryKey: ['bips'],
    queryFn: () => apiClient<BIPEvaluation[]>('/api/bips'),
  });
}

export function useBIP(id: string) {
  return useQuery<BIPEvaluation>({
    queryKey: ['bips', id],
    queryFn: () => apiClient<BIPEvaluation>(`/api/bips/${id}`),
    enabled: !!id,
  });
}

export function useCreateBIP() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: BIPInput) =>
      apiClient<BIPEvaluation>('/api/bips', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bips'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useUpdateBIP() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: Partial<BIPInput> & { id: string }) =>
      apiClient<BIPEvaluation>(`/api/bips/${id}`, {
        method: 'PUT',
        body: JSON.stringify(input),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bips'] });
      queryClient.invalidateQueries({ queryKey: ['bips', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

interface SyncResult {
  total: number;
  inserted: number;
  updated: number;
  errors: string[];
}

export function useSyncBIPs() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiClient<SyncResult>('/api/admin/sync-bips', { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bips'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

interface EvaluateResult {
  evaluation: Record<string, unknown>;
  bipId: string;
}

export function useEvaluateBIP() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bipId: string) =>
      apiClient<EvaluateResult>('/api/admin/evaluate-bip', {
        method: 'POST',
        body: JSON.stringify({ bipId }),
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bips'] });
      queryClient.invalidateQueries({ queryKey: ['bips', data.bipId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}
