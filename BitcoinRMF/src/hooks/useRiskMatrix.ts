'use client';

import { useMemo } from 'react';
import { useThreats } from './useThreats';
import { buildRiskMatrix } from '@/lib/scoring';
import type { RiskMatrixCell } from '@/types';

export function useRiskMatrix() {
  const { data: threats, isLoading, error } = useThreats();

  const matrix = useMemo<RiskMatrixCell[][] | undefined>(() => {
    if (!threats) return undefined;
    return buildRiskMatrix(threats);
  }, [threats]);

  return { data: matrix, isLoading, error };
}
