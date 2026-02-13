'use client';

import Link from 'next/link';
import { Threat, LIKELIHOOD_LABELS, IMPACT_LABELS } from '@/types';
import SeverityBadge from '@/components/SeverityBadge';
import STRIDEBadge from '@/components/STRIDEBadge';
import ThreatSourceBadge from '@/components/ThreatSourceBadge';
import StatusBadge from '@/components/StatusBadge';

interface ThreatCardProps {
  threat: Threat;
}

export default function ThreatCard({ threat }: ThreatCardProps) {
  return (
    <Link
      href={`/threats/${threat.id}`}
      className="block bg-[#111118] border border-[#2a2a3a] rounded-xl p-4 hover:border-[#3a3a4a] transition-all hover:shadow-lg hover:shadow-black/20"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-sm font-semibold text-white flex-1">{threat.name}</h3>
        <SeverityBadge rating={threat.riskRating} size="sm" />
      </div>

      <p className="text-xs text-gray-500 line-clamp-2 mb-3">{threat.description}</p>

      <div className="flex flex-wrap items-center gap-2 mb-3">
        <STRIDEBadge category={threat.strideCategory} size="sm" />
        <ThreatSourceBadge source={threat.threatSource} />
        <StatusBadge status={threat.status} />
      </div>

      <div className="flex items-center justify-between text-[10px] text-gray-600">
        <span>
          L: {threat.likelihood} ({LIKELIHOOD_LABELS[threat.likelihood]}) / I: {threat.impact} ({IMPACT_LABELS[threat.impact]})
        </span>
        <span className="font-mono text-[#f7931a]">{threat.severityScore}/25</span>
      </div>
    </Link>
  );
}
