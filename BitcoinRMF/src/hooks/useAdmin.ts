'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

interface PendingItem {
  id: string;
  type: 'threat' | 'bip' | 'fud';
  name: string;
  status: string;
  submitted_by_name: string | null;
  created_at: string;
}

interface AuditEntry {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  user_id: string;
  user_name: string;
  diff: unknown;
  created_at: string;
}

export function useReviewQueue() {
  return useQuery<PendingItem[]>({
    queryKey: ['admin', 'pending'],
    queryFn: () => apiClient<PendingItem[]>('/api/admin/pending'),
  });
}

export function useAuditLog(limit = 50) {
  return useQuery<AuditEntry[]>({
    queryKey: ['admin', 'audit-log', limit],
    queryFn: () =>
      apiClient<AuditEntry[]>('/api/admin/audit-log', {
        params: { limit: String(limit) },
      }),
  });
}

export function usePublishMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ type, id, status, reason }: { type: 'threats' | 'bips' | 'fud'; id: string; status: string; reason?: string }) =>
      apiClient(`/api/${type}/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, reason }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'pending'] });
      queryClient.invalidateQueries({ queryKey: ['threats'] });
      queryClient.invalidateQueries({ queryKey: ['bips'] });
      queryClient.invalidateQueries({ queryKey: ['fud'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

interface SubmissionItem {
  id: string;
  type: 'threat' | 'bip' | 'fud';
  name: string;
  status: string;
  created_at: string;
  rejection_reason?: string;
}

export function useMySubmissions() {
  return useQuery<SubmissionItem[]>({
    queryKey: ['my-submissions'],
    queryFn: () => apiClient<SubmissionItem[]>('/api/submissions'),
  });
}
