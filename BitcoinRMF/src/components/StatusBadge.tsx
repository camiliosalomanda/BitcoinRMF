'use client';

import { ThreatStatus } from '@/types';

const STATUS_CONFIG: Record<ThreatStatus, { label: string; color: string; dot: string }> = {
  [ThreatStatus.IDENTIFIED]: { label: 'Identified', color: 'text-gray-300 bg-gray-500/10', dot: 'bg-gray-400' },
  [ThreatStatus.ANALYZING]: { label: 'Analyzing', color: 'text-blue-300 bg-blue-500/10', dot: 'bg-blue-400' },
  [ThreatStatus.MITIGATED]: { label: 'Mitigated', color: 'text-green-300 bg-green-500/10', dot: 'bg-green-400' },
  [ThreatStatus.ACCEPTED]: { label: 'Accepted', color: 'text-yellow-300 bg-yellow-500/10', dot: 'bg-yellow-400' },
  [ThreatStatus.MONITORING]: { label: 'Monitoring', color: 'text-cyan-300 bg-cyan-500/10', dot: 'bg-cyan-400' },
  [ThreatStatus.ESCALATED]: { label: 'Escalated', color: 'text-red-300 bg-red-500/10', dot: 'bg-red-400' },
};

interface StatusBadgeProps {
  status: ThreatStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium rounded-full px-2.5 py-1 ${config.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
