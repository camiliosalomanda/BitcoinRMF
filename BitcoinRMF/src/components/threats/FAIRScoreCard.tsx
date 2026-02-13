'use client';

import { FAIREstimates } from '@/types';

interface FAIRScoreCardProps {
  fair: FAIREstimates;
}

function formatUSD(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

export default function FAIRScoreCard({ fair }: FAIRScoreCardProps) {
  return (
    <div className="bg-[#1a1a24] border border-[#2a2a3a] rounded-lg p-4">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
        FAIR Quantitative Analysis
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-[10px] text-gray-500">Threat Event Frequency</p>
          <p className="text-lg font-bold text-white">{fair.threatEventFrequency}<span className="text-xs text-gray-500 ml-1">/yr</span></p>
        </div>
        <div>
          <p className="text-[10px] text-gray-500">Vulnerability</p>
          <p className="text-lg font-bold text-white">{(fair.vulnerability * 100).toFixed(0)}%</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-500">Loss Event Frequency</p>
          <p className="text-lg font-bold text-cyan-400">{fair.lossEventFrequency.toFixed(2)}<span className="text-xs text-gray-500 ml-1">/yr</span></p>
        </div>
        <div>
          <p className="text-[10px] text-gray-500">Annualized Loss</p>
          <p className="text-lg font-bold text-[#f7931a]">{formatUSD(fair.annualizedLossExpectancy)}</p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-[#2a2a3a]">
        <div className="flex justify-between text-[10px]">
          <div>
            <span className="text-gray-500">Primary Loss: </span>
            <span className="text-white font-medium">{formatUSD(fair.primaryLossUSD)}</span>
          </div>
          <div>
            <span className="text-gray-500">Secondary Loss: </span>
            <span className="text-white font-medium">{formatUSD(fair.secondaryLossUSD)}</span>
          </div>
        </div>
      </div>

      {/* Visual bar */}
      <div className="mt-3">
        <div className="flex items-center gap-2 text-[10px] text-gray-500 mb-1">
          <span>Loss Magnitude Composition</span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden flex">
          <div
            className="h-full bg-red-500 rounded-l-full"
            style={{ width: `${(fair.primaryLossUSD / (fair.primaryLossUSD + fair.secondaryLossUSD)) * 100}%` }}
          />
          <div
            className="h-full bg-orange-500 rounded-r-full"
            style={{ width: `${(fair.secondaryLossUSD / (fair.primaryLossUSD + fair.secondaryLossUSD)) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-[9px] text-gray-600 mt-1">
          <span>Primary</span>
          <span>Secondary</span>
        </div>
      </div>
    </div>
  );
}
