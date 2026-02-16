'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { getSeverityRating } from '@/lib/scoring';
import type { DerivedRisk, Threat, Vulnerability } from '@/types';

export function useRisks() {
  return useQuery<DerivedRisk[]>({
    queryKey: ['risks'],
    queryFn: () => apiClient<DerivedRisk[]>('/api/risks'),
  });
}

export function useRisk(threatId: string, vulnId: string) {
  const threatQuery = useQuery<Threat>({
    queryKey: ['threats', threatId],
    queryFn: () => apiClient<Threat>(`/api/threats/${threatId}`),
    enabled: !!threatId,
  });

  const vulnQuery = useQuery<Vulnerability>({
    queryKey: ['vulnerabilities', vulnId],
    queryFn: () => apiClient<Vulnerability>(`/api/vulnerabilities/${vulnId}`),
    enabled: !!vulnId,
  });

  const threat = threatQuery.data;
  const vulnerability = vulnQuery.data;

  const risk: DerivedRisk | undefined =
    threat && vulnerability
      ? {
          threatId: threat.id,
          vulnerabilityId: vulnerability.id,
          threatName: threat.name,
          vulnerabilityName: vulnerability.name,
          likelihood: threat.likelihood,
          impact: vulnerability.severity,
          riskScore: threat.likelihood * vulnerability.severity,
          riskRating: getSeverityRating(threat.likelihood * vulnerability.severity),
          threat,
          vulnerability,
        }
      : undefined;

  return {
    data: risk,
    isLoading: threatQuery.isLoading || vulnQuery.isLoading,
  };
}
