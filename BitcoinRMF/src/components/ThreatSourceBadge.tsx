'use client';

import { ThreatSource } from '@/types';

const SOURCE_CONFIG: Record<ThreatSource, { label: string; color: string }> = {
  [ThreatSource.SOCIAL_MEDIA]: { label: 'Social Media', color: 'text-pink-400 bg-pink-400/10' },
  [ThreatSource.TECHNOLOGY]: { label: 'Technology', color: 'text-blue-400 bg-blue-400/10' },
  [ThreatSource.REGULATORY]: { label: 'Regulatory', color: 'text-violet-400 bg-violet-400/10' },
  [ThreatSource.NETWORK]: { label: 'Network', color: 'text-emerald-400 bg-emerald-400/10' },
  [ThreatSource.PROTOCOL]: { label: 'Protocol', color: 'text-cyan-400 bg-cyan-400/10' },
  [ThreatSource.CRYPTOGRAPHIC]: { label: 'Cryptographic', color: 'text-amber-400 bg-amber-400/10' },
  [ThreatSource.OPERATIONAL]: { label: 'Operational', color: 'text-orange-400 bg-orange-400/10' },
  [ThreatSource.SUPPLY_CHAIN]: { label: 'Supply Chain', color: 'text-red-400 bg-red-400/10' },
};

interface ThreatSourceBadgeProps {
  source: ThreatSource;
}

export default function ThreatSourceBadge({ source }: ThreatSourceBadgeProps) {
  const config = SOURCE_CONFIG[source];
  return (
    <span className={`inline-flex items-center text-[10px] font-medium rounded px-1.5 py-0.5 ${config.color}`}>
      {config.label}
    </span>
  );
}
