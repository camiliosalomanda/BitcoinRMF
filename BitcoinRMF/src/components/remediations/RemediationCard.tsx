'use client';

import Link from 'next/link';
import { CheckCircle, Clock, AlertCircle, PauseCircle } from 'lucide-react';
import { RemediationStrategy, Vulnerability, BIPEvaluation, BIPRecommendation } from '@/types';
import SeverityBadge from '@/components/SeverityBadge';

const RECOMMENDATION_COLORS: Record<BIPRecommendation, string> = {
  [BIPRecommendation.ESSENTIAL]: 'text-green-400 bg-green-400/10 border-green-400/30',
  [BIPRecommendation.RECOMMENDED]: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  [BIPRecommendation.OPTIONAL]: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  [BIPRecommendation.UNNECESSARY]: 'text-gray-400 bg-gray-400/10 border-gray-400/30',
  [BIPRecommendation.HARMFUL]: 'text-red-400 bg-red-400/10 border-red-400/30',
};

const STATUS_CONFIG = {
  COMPLETED: { icon: CheckCircle, color: 'text-green-400 bg-green-400/10', label: 'Completed' },
  IN_PROGRESS: { icon: Clock, color: 'text-blue-400 bg-blue-400/10', label: 'In Progress' },
  PLANNED: { icon: AlertCircle, color: 'text-yellow-400 bg-yellow-400/10', label: 'Planned' },
  DEFERRED: { icon: PauseCircle, color: 'text-gray-400 bg-gray-400/10', label: 'Deferred' },
} as const;

interface RemediationCardProps {
  remediation: RemediationStrategy;
  parentVulnerability: Vulnerability;
  allBIPs: BIPEvaluation[];
}

export default function RemediationCard({ remediation, parentVulnerability, allBIPs }: RemediationCardProps) {
  const statusConfig = STATUS_CONFIG[remediation.status];
  const StatusIcon = statusConfig.icon;

  const resolvedBIPs = remediation.relatedBIPs
    .map((bipNum) => allBIPs.find((b) => b.bipNumber === bipNum))
    .filter(Boolean) as BIPEvaluation[];

  return (
    <div className="bg-[#111118] border border-[#2a2a3a] rounded-xl p-5 hover:border-[#3a3a4a] transition-all">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-2 flex-1">
          <StatusIcon size={16} className={`mt-0.5 ${statusConfig.color.split(' ')[0]}`} />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-white">{remediation.title}</h3>
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{remediation.description}</p>
          </div>
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded font-medium whitespace-nowrap ${statusConfig.color}`}>
          {statusConfig.label}
        </span>
      </div>

      {/* Parent Vulnerability */}
      <Link
        href={`/vulnerabilities/${parentVulnerability.id}`}
        className="flex items-center justify-between p-2.5 rounded-lg border border-[#2a2a3a] hover:border-[#3a3a4a] transition-colors mb-3"
      >
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-gray-600 uppercase tracking-wide">Parent Vulnerability</p>
          <p className="text-xs text-white truncate">{parentVulnerability.name}</p>
          <p className="text-[10px] text-gray-500">
            Score: {parentVulnerability.vulnerabilityScore}/25 (S{parentVulnerability.severity} &times; E{parentVulnerability.exploitability})
          </p>
        </div>
        <SeverityBadge rating={parentVulnerability.vulnerabilityRating} size="sm" />
      </Link>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-[#0a0f1a] rounded-lg p-2 text-center">
          <p className="text-[10px] text-gray-600">Effectiveness</p>
          <p className="text-sm font-bold text-white">{remediation.effectiveness}%</p>
        </div>
        <div className="bg-[#0a0f1a] rounded-lg p-2 text-center">
          <p className="text-[10px] text-gray-600">Timeline</p>
          <p className="text-sm font-bold text-white">{remediation.timelineMonths}mo</p>
        </div>
        <div className="bg-[#0a0f1a] rounded-lg p-2 text-center">
          <p className="text-[10px] text-gray-600">Est. Cost</p>
          <p className="text-sm font-bold text-white">
            {remediation.estimatedCostUSD >= 1_000_000
              ? `$${(remediation.estimatedCostUSD / 1_000_000).toFixed(1)}M`
              : remediation.estimatedCostUSD >= 1_000
                ? `$${(remediation.estimatedCostUSD / 1_000).toFixed(0)}K`
                : `$${remediation.estimatedCostUSD}`}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#f7931a] rounded-full transition-all"
            style={{ width: `${remediation.effectiveness}%` }}
          />
        </div>
      </div>

      {/* Related BIPs */}
      {resolvedBIPs.length > 0 && (
        <div>
          <p className="text-[10px] text-gray-600 uppercase tracking-wide mb-1.5">Related BIPs</p>
          <div className="flex flex-wrap gap-1.5">
            {resolvedBIPs.map((bip) => (
              <Link
                key={bip.id}
                href={`/bips/${bip.id}`}
                className={`text-[10px] px-2 py-0.5 rounded-full border font-medium hover:opacity-80 transition-opacity ${RECOMMENDATION_COLORS[bip.recommendation]}`}
              >
                {bip.bipNumber}
              </Link>
            ))}
            {remediation.relatedBIPs
              .filter((bipNum) => !allBIPs.find((b) => b.bipNumber === bipNum))
              .map((bipNum) => (
                <span key={bipNum} className="text-[10px] px-2 py-0.5 rounded bg-[#f7931a]/10 text-[#f7931a] font-mono">
                  {bipNum}
                </span>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
