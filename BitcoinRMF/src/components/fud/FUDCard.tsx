'use client';

import Link from 'next/link';
import { MessageSquare } from 'lucide-react';
import { FUDAnalysis, FUDStatus } from '@/types';
import { useRMFStore } from '@/lib/store';

interface FUDCardProps {
  fud: FUDAnalysis;
}

const STATUS_COLORS: Record<FUDStatus, string> = {
  ACTIVE: 'text-red-400 bg-red-400/10',
  DEBUNKED: 'text-green-400 bg-green-400/10',
  PARTIALLY_VALID: 'text-yellow-400 bg-yellow-400/10',
};

function getValidityColor(score: number): string {
  if (score >= 60) return '#ef4444';
  if (score >= 40) return '#eab308';
  if (score >= 20) return '#22c55e';
  return '#10b981';
}

export default function FUDCard({ fud }: FUDCardProps) {
  const commentCount = useRMFStore((s) => s.getCommentCount('fud', fud.id));
  const barColor = getValidityColor(fud.validityScore);

  return (
    <Link
      href={`/fud/${fud.id}`}
      className="block bg-[#111118] border border-[#2a2a3a] rounded-xl p-5 hover:border-[#3a3a4a] transition-all"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-white">{fud.narrative}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] text-gray-500">{fud.category}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${STATUS_COLORS[fud.status]}`}>
              {fud.status.replace(/_/g, ' ')}
            </span>
          </div>
        </div>
      </div>

      {/* Validity meter */}
      <div className="space-y-1">
        <div className="flex justify-between text-[10px]">
          <span className="text-green-400">FUD</span>
          <span className="text-gray-500">{fud.validityScore}% valid</span>
          <span className="text-red-400">Valid</span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${fud.validityScore}%`, backgroundColor: barColor }}
          />
        </div>
      </div>

      <div className="flex items-center gap-3 mt-3 text-[10px] text-gray-500">
        <span>{fud.evidenceFor.length} supporting</span>
        <span>{fud.evidenceAgainst.length} debunking</span>
        <span>{fud.relatedThreats.length} linked threats</span>
        {commentCount > 0 && (
          <span className="flex items-center gap-0.5 ml-auto">
            <MessageSquare size={10} />
            {commentCount}
          </span>
        )}
      </div>
    </Link>
  );
}
