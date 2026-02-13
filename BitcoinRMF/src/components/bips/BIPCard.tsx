'use client';

import Link from 'next/link';
import { MessageSquare } from 'lucide-react';
import { BIPEvaluation, BIPRecommendation } from '@/types';
import { useRMFStore } from '@/lib/store';
import ScoreGauge from '@/components/ScoreGauge';

interface BIPCardProps {
  bip: BIPEvaluation;
}

const RECOMMENDATION_COLORS: Record<BIPRecommendation, string> = {
  [BIPRecommendation.ESSENTIAL]: 'text-green-400 bg-green-400/10 border-green-400/30',
  [BIPRecommendation.RECOMMENDED]: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  [BIPRecommendation.OPTIONAL]: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  [BIPRecommendation.UNNECESSARY]: 'text-gray-400 bg-gray-400/10 border-gray-400/30',
  [BIPRecommendation.HARMFUL]: 'text-red-400 bg-red-400/10 border-red-400/30',
};

export default function BIPCard({ bip }: BIPCardProps) {
  const commentCount = useRMFStore((s) => s.getCommentCount('bip', bip.id));

  return (
    <Link
      href={`/bips/${bip.id}`}
      className="block bg-[#111118] border border-[#2a2a3a] rounded-xl p-5 hover:border-[#3a3a4a] transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-[#f7931a]">{bip.bipNumber}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium border ${RECOMMENDATION_COLORS[bip.recommendation]}`}>
              {bip.recommendation}
            </span>
          </div>
          <h3 className="text-sm font-semibold text-white">{bip.title}</h3>
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{bip.summary}</p>
        </div>
        <ScoreGauge score={bip.necessityScore} label="Necessity" size="sm" />
      </div>

      <div className="flex items-center gap-4 mt-4 text-[10px] text-gray-500">
        <span>Threats: {bip.threatsAddressed.length}</span>
        <span>Adoption: {bip.adoptionPercentage}%</span>
        <span>Consensus: {bip.communityConsensus}%</span>
        {commentCount > 0 && (
          <span className="flex items-center gap-0.5">
            <MessageSquare size={10} />
            {commentCount}
          </span>
        )}
        <span className={`ml-auto px-1.5 py-0.5 rounded ${
          bip.status === 'ACTIVE' || bip.status === 'FINAL' ? 'bg-green-400/10 text-green-400' :
          bip.status === 'PROPOSED' ? 'bg-yellow-400/10 text-yellow-400' :
          'bg-gray-400/10 text-gray-400'
        }`}>
          {bip.status}
        </span>
      </div>
    </Link>
  );
}
