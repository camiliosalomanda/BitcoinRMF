'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RiskMatrixCell, LIKELIHOOD_LABELS, IMPACT_LABELS, LikelihoodLevel, ImpactLevel } from '@/types';
import { getMatrixCellColor } from '@/lib/scoring';
import SeverityBadge from '@/components/SeverityBadge';
import Link from 'next/link';
import { useBIPs } from '@/hooks/useBIPs';

interface RiskHeatmapProps {
  matrix: RiskMatrixCell[][];
}

export default function RiskHeatmap({ matrix }: RiskHeatmapProps) {
  const [selectedCell, setSelectedCell] = useState<RiskMatrixCell | null>(null);
  const { data: allBIPs = [] } = useBIPs();
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        {/* Y-axis label */}
        <div className="flex flex-col items-center justify-center">
          <span className="text-[10px] text-gray-500 uppercase tracking-wider -rotate-90 whitespace-nowrap">
            Likelihood
          </span>
        </div>

        <div className="flex-1">
          {/* Y-axis values */}
          <div className="flex gap-2">
            <div className="flex flex-col justify-between w-24 pr-2">
              {[5, 4, 3, 2, 1].map((l) => (
                <div key={l} className="h-20 flex items-center justify-end">
                  <div className="text-right">
                    <span className="text-sm font-mono text-gray-400">{l}</span>
                    <p className="text-[9px] text-gray-600">{LIKELIHOOD_LABELS[l as LikelihoodLevel]}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Grid */}
            <div className="flex-1">
              <div className="grid grid-rows-5 gap-2">
                {matrix.map((row, ri) => (
                  <div key={ri} className="grid grid-cols-5 gap-2">
                    {row.map((cell) => (
                      <button
                        key={`${cell.likelihood}-${cell.impact}`}
                        onClick={() => setSelectedCell(cell.count > 0 ? cell : null)}
                        className={`h-20 rounded-lg flex flex-col items-center justify-center transition-all border-2 ${
                          getMatrixCellColor(cell.likelihood, cell.impact)
                        } ${
                          selectedCell?.likelihood === cell.likelihood && selectedCell?.impact === cell.impact
                            ? 'border-white ring-2 ring-white/20'
                            : 'border-transparent hover:border-white/20'
                        } ${cell.count > 0 ? 'cursor-pointer' : 'cursor-default'}`}
                      >
                        <span className="text-2xl font-bold text-white">{cell.count || ''}</span>
                        {cell.count > 0 && (
                          <span className="text-[9px] text-white/70 mt-0.5">
                            {cell.count === 1 ? 'risk' : 'risks'}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                ))}
              </div>

              {/* X-axis values */}
              <div className="grid grid-cols-5 gap-2 mt-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="text-center">
                    <span className="text-sm font-mono text-gray-400">{i}</span>
                    <p className="text-[9px] text-gray-600">{IMPACT_LABELS[i as ImpactLevel]}</p>
                  </div>
                ))}
              </div>

              {/* X-axis label */}
              <div className="text-center mt-2">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider">Impact</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Selected cell detail */}
      {selectedCell && selectedCell.count > 0 && (
        <div className="bg-[#111118] border border-[#2a2a3a] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-3">
            Likelihood {selectedCell.likelihood} ({LIKELIHOOD_LABELS[selectedCell.likelihood]}) &times; Severity {selectedCell.impact} ({IMPACT_LABELS[selectedCell.impact]})
            <span className="text-gray-500 ml-2">— {selectedCell.count} risk{selectedCell.count !== 1 ? 's' : ''}</span>
          </h3>
          <div className="space-y-2">
            {selectedCell.risks.length > 0 ? (
              selectedCell.risks.map((risk) => (
                <Link
                  key={`${risk.threatId}-${risk.vulnerabilityId}`}
                  href={`/risks/${risk.threatId}/${risk.vulnerabilityId}`}
                  className="flex items-center justify-between p-3 rounded-lg border border-[#2a2a3a] hover:border-[#3a3a4a] transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white">
                        {risk.threatName}
                      </span>
                      <span className="text-[10px] text-gray-600">&rarr;</span>
                      <span className="text-sm text-amber-400">
                        {risk.vulnerabilityName}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      Score: {risk.riskScore}/25
                    </p>
                    {(() => {
                      const bipNums = Array.from(new Set([
                        ...risk.threat.relatedBIPs,
                        ...risk.vulnerability.relatedBIPs,
                      ]));
                      if (bipNums.length === 0) return null;
                      return (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {bipNums.map((bipNum) => {
                            const bip = allBIPs.find((b) => b.bipNumber === bipNum);
                            return bip ? (
                              <span
                                key={bipNum}
                                role="link"
                                tabIndex={0}
                                className="text-[9px] px-1.5 py-0.5 rounded bg-[#f7931a]/10 text-[#f7931a] border border-[#f7931a]/20 hover:bg-[#f7931a]/20 transition-colors cursor-pointer"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  router.push(`/bips/${bip.id}`);
                                }}
                              >
                                {bipNum}
                              </span>
                            ) : (
                              <span
                                key={bipNum}
                                className="text-[9px] px-1.5 py-0.5 rounded bg-gray-400/10 text-gray-400 border border-gray-400/20"
                              >
                                {bipNum}
                              </span>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                  <SeverityBadge rating={risk.riskRating} size="sm" />
                </Link>
              ))
            ) : (
              selectedCell.threats.map((threat) => (
                <Link
                  key={threat.id}
                  href={`/threats/${threat.id}`}
                  className="flex items-center justify-between p-3 rounded-lg border border-[#2a2a3a] hover:border-[#3a3a4a] transition-colors"
                >
                  <div>
                    <p className="text-sm text-white">{threat.name}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      {threat.strideCategory.replace(/_/g, ' ')} — {threat.threatSource.replace(/_/g, ' ')}
                    </p>
                  </div>
                  <SeverityBadge rating={threat.riskRating} size="sm" />
                </Link>
              ))
            )}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 justify-center">
        <span className="text-[10px] text-gray-500">Risk Level:</span>
        {[
          { label: 'Very Low', color: 'bg-green-500/10' },
          { label: 'Low', color: 'bg-green-500/20' },
          { label: 'Medium', color: 'bg-yellow-500/30' },
          { label: 'High', color: 'bg-orange-500/50' },
          { label: 'Critical', color: 'bg-red-500/70' },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1">
            <div className={`w-3 h-3 rounded ${item.color}`} />
            <span className="text-[10px] text-gray-500">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
