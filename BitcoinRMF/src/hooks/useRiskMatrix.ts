'use client';

import { useMemo } from 'react';
import { useRisks } from './useRisks';
import { buildRiskMatrixFromRisks } from '@/lib/scoring';
import type { RiskMatrixCell } from '@/types';

export function useRiskMatrix() {
  const { data: risks, isLoading, error } = useRisks();

  const matrix = useMemo<RiskMatrixCell[][] | undefined>(() => {
    if (!risks) return undefined;
    return buildRiskMatrixFromRisks(risks);
  }, [risks]);

  return { data: matrix, isLoading, error };
}
