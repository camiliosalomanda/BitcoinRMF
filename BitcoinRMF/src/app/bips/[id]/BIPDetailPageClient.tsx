'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import ScoreGauge from '@/components/ScoreGauge';
import SeverityBadge from '@/components/SeverityBadge';
import CommentSection from '@/components/comments/CommentSection';
import { DetailSkeleton } from '@/components/LoadingSkeleton';
import { useBIP, useEvaluateBIP } from '@/hooks/useBIPs';
import { useBIPMetrics } from '@/hooks/useBIPMetrics';
import { useThreats } from '@/hooks/useThreats';
import { useVulnerabilities } from '@/hooks/useVulnerabilities';
import { useRisks } from '@/hooks/useRisks';
import { BIPRecommendation } from '@/types';
import type { MetricSource } from '@/lib/bip-metrics';
import ShareToXButton from '@/components/ShareToXButton';
import { ArrowLeft, Sparkles, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

function SourceAttribution({ sources, summary }: { sources?: MetricSource[]; summary?: string }) {
  const [expanded, setExpanded] = useState(false);

  if (!sources || sources.length === 0) {
    return summary ? (
      <p className="text-[10px] text-gray-500 mt-1 text-center">{summary}</p>
    ) : null;
  }

  const primarySource = sources[0];
  const primaryText = summary || primarySource.detail;
  const truncated = primaryText.length > 60 ? primaryText.slice(0, 57) + '...' : primaryText;

  return (
    <div className="mt-1.5 w-full">
      <p className="text-[10px] text-gray-500 text-center leading-tight">{truncated}</p>
      {sources.length > 0 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-0.5 mx-auto mt-0.5 text-[9px] text-gray-600 hover:text-[#f7931a] transition-colors"
        >
          {expanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
          {expanded ? 'Hide' : 'View'} sources
        </button>
      )}
      {expanded && (
        <div className="mt-1 space-y-0.5">
          {sources.map((src, i) => (
            <div key={i} className="text-[9px] text-gray-600 flex items-start gap-1">
              <span className="shrink-0 text-gray-700">{src.name}:</span>
              <span className="break-words">{src.detail}</span>
              {src.url && (
                <a
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-[#f7931a] hover:text-[#f7931a]/80"
                >
                  <ExternalLink size={8} />
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const RECOMMENDATION_COLORS: Record<BIPRecommendation, string> = {
  [BIPRecommendation.ESSENTIAL]: 'text-green-400 bg-green-400/10 border-green-400/30',
  [BIPRecommendation.RECOMMENDED]: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  [BIPRecommendation.OPTIONAL]: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  [BIPRecommendation.UNNECESSARY]: 'text-gray-400 bg-gray-400/10 border-gray-400/30',
  [BIPRecommendation.HARMFUL]: 'text-red-400 bg-red-400/10 border-red-400/30',
};

export default function BIPDetailPageClient() {
  const params = useParams();
  const id = params.id as string;
  const { data: bip, isLoading: bipLoading } = useBIP(id);
  const { data: threats = [] } = useThreats();
  const { data: vulnerabilities = [] } = useVulnerabilities();
  const { data: derivedRisks = [] } = useRisks();
  const evaluateBIP = useEvaluateBIP();
  const { data: metrics } = useBIPMetrics(id);

  if (bipLoading) {
    return (
      <DashboardLayout>
        <DetailSkeleton />
      </DashboardLayout>
    );
  }

  if (!bip) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-gray-400">BIP evaluation not found</p>
        </div>
      </DashboardLayout>
    );
  }

  const bipNumber = bip.bipNumber; // e.g. "BIP-0340"
  const shortBipNumber = `BIP-${parseInt(bipNumber.replace(/\D/g, ''), 10)}`; // e.g. "BIP-340"
  const bipVariants = [bipNumber, shortBipNumber];

  const addressedThreats = threats.filter((t) =>
    bip.threatsAddressed.includes(t.id) ||
    t.relatedBIPs.some((b) => bipVariants.includes(b))
  );

  const addressedVulnerabilities = vulnerabilities.filter((v) =>
    v.relatedBIPs.some((b) => bipVariants.includes(b))
  );

  const relatedRisks = derivedRisks.filter((r) =>
    r.threat.relatedBIPs.some((b) => bipVariants.includes(b)) ||
    r.vulnerability.relatedBIPs.some((b) => bipVariants.includes(b))
  );

  const evaluated = bip.aiEvaluated;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Link href="/bips" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#f7931a] transition-colors">
          <ArrowLeft size={14} />
          Back to BIPs
        </Link>

        {/* Header */}
        <div className="bg-[#111118] border border-[#2a2a3a] rounded-xl p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg font-mono text-[#f7931a] font-bold">{bip.bipNumber}</span>
                {evaluated ? (
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${RECOMMENDATION_COLORS[bip.recommendation]}`}>
                    {bip.recommendation}
                  </span>
                ) : (
                  <span className="text-xs px-2 py-0.5 rounded-full border font-medium text-gray-400 bg-gray-400/10 border-gray-400/30">
                    Metadata Only
                  </span>
                )}
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                  bip.status === 'ACTIVE' || bip.status === 'FINAL' ? 'bg-green-400/10 text-green-400' :
                  bip.status === 'PROPOSED' ? 'bg-yellow-400/10 text-yellow-400' :
                  'bg-gray-400/10 text-gray-400'
                }`}>
                  {bip.status}
                </span>
              </div>
              <h1 className="text-xl font-bold text-white">{bip.title}</h1>
              {evaluated ? (
                <p className="text-sm text-gray-400 mt-2">{bip.summary}</p>
              ) : (
                <div className="mt-2 space-y-1">
                  {bip.bipAuthor && (
                    <p className="text-sm text-gray-400">Author: {bip.bipAuthor}</p>
                  )}
                  <div className="flex gap-4 text-xs text-gray-500">
                    {bip.bipType && <span>Type: {bip.bipType}</span>}
                    {bip.bipLayer && <span>Layer: {bip.bipLayer}</span>}
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-col items-end gap-2">
              {evaluated ? (
                <>
                  <ScoreGauge score={bip.necessityScore} label="Necessity" size="lg" />
                  <ShareToXButton
                    text={`${bip.bipNumber}: "${bip.title}" \u2014 ${bip.recommendation} (Necessity: ${bip.necessityScore}/100)`}
                    hashtags={['Bitcoin', 'BIP', 'BitcoinRMF']}
                  />
                </>
              ) : (
                <button
                  onClick={() => evaluateBIP.mutate(bip.id)}
                  disabled={evaluateBIP.isPending}
                  className="flex items-center gap-1.5 text-xs px-4 py-2 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-lg hover:bg-purple-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {evaluateBIP.isPending ? (
                    <>
                      <span className="inline-block w-3 h-3 border border-purple-400 border-t-transparent rounded-full animate-spin" />
                      Evaluating...
                    </>
                  ) : (
                    <>
                      <Sparkles size={12} />
                      Evaluate with AI
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Not evaluated notice */}
        {!evaluated && (
          <div className="bg-[#111118] border border-yellow-400/20 rounded-xl p-4">
            <p className="text-xs text-yellow-400">
              This BIP has not been AI-evaluated yet. Only metadata from the GitHub repository is available.
              {' Click "Evaluate with AI" above to run a full analysis.'}
            </p>
            {evaluateBIP.isError && (
              <p className="text-xs text-red-400 mt-2">
                Evaluation failed: {evaluateBIP.error instanceof Error ? evaluateBIP.error.message : 'Unknown error'}
              </p>
            )}
          </div>
        )}

        {/* Scores Grid — only for evaluated BIPs */}
        {evaluated && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#111118] border border-[#2a2a3a] rounded-xl p-4 flex flex-col items-center">
              <ScoreGauge score={bip.mitigationEffectiveness} label="Mitigation" size="md" />
              <SourceAttribution
                sources={metrics ? [{
                  name: 'Risk Data',
                  detail: metrics.mitigation.relatedThreats > 0
                    ? `${metrics.mitigation.relatedThreats} threats (avg ${metrics.mitigation.avgThreatScore}/25)`
                    : metrics.mitigation.note,
                }] : undefined}
                summary={!metrics ? 'AI estimate' : undefined}
              />
            </div>
            <div className="bg-[#111118] border border-[#2a2a3a] rounded-xl p-4 flex flex-col items-center">
              <ScoreGauge score={bip.communityConsensus} label="Consensus" size="md" />
              <SourceAttribution
                sources={metrics?.consensus.sources}
                summary={!metrics ? 'AI estimate' : undefined}
              />
            </div>
            <div className="bg-[#111118] border border-[#2a2a3a] rounded-xl p-4 flex flex-col items-center">
              <ScoreGauge score={bip.implementationReadiness} label="Readiness" size="md" />
              <SourceAttribution
                sources={metrics?.readiness.sources}
                summary={!metrics ? 'AI estimate' : undefined}
              />
            </div>
            <div className="bg-[#111118] border border-[#2a2a3a] rounded-xl p-4 flex flex-col items-center">
              <ScoreGauge score={bip.adoptionPercentage} label="Adoption" size="md" />
              <SourceAttribution
                sources={metrics?.adoption.sources}
                summary={!metrics ? 'AI estimate' : undefined}
              />
            </div>
          </div>
        )}

        {/* Economic Impact — only for evaluated BIPs */}
        {evaluated && bip.economicImpact && (
          <div className="bg-[#111118] border border-[#2a2a3a] rounded-xl p-5">
            <h2 className="text-sm font-semibold text-white mb-3">Economic Impact</h2>
            <p className="text-sm text-gray-400">{bip.economicImpact}</p>
          </div>
        )}

        {/* Threats Addressed */}
        {(evaluated || addressedThreats.length > 0) && (
          <div className="bg-[#111118] border border-[#2a2a3a] rounded-xl p-5">
            <h2 className="text-sm font-semibold text-white mb-3">
              Threats Addressed ({addressedThreats.length})
            </h2>
            <div className="space-y-2">
              {addressedThreats.map((threat) => (
                <Link
                  key={threat.id}
                  href={`/threats/${threat.id}`}
                  className="flex items-center justify-between p-3 rounded-lg border border-[#2a2a3a] hover:border-[#3a3a4a] transition-colors"
                >
                  <div>
                    <p className="text-sm text-white">{threat.name}</p>
                    <p className="text-[10px] text-gray-500">Severity: {threat.severityScore}/25</p>
                  </div>
                  <SeverityBadge rating={threat.riskRating} size="sm" />
                </Link>
              ))}
              {addressedThreats.length === 0 && (
                <p className="text-xs text-gray-600">No linked threats</p>
              )}
            </div>
          </div>
        )}

        {/* Related Vulnerabilities */}
        {addressedVulnerabilities.length > 0 && (
          <div className="bg-[#111118] border border-[#2a2a3a] rounded-xl p-5">
            <h2 className="text-sm font-semibold text-white mb-3">
              Related Vulnerabilities ({addressedVulnerabilities.length})
            </h2>
            <div className="space-y-2">
              {addressedVulnerabilities.map((vuln) => (
                <Link
                  key={vuln.id}
                  href={`/vulnerabilities/${vuln.id}`}
                  className="flex items-center justify-between p-3 rounded-lg border border-[#2a2a3a] hover:border-[#3a3a4a] transition-colors"
                >
                  <div>
                    <p className="text-sm text-white">{vuln.name}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-[10px] text-gray-500">Score: {vuln.vulnerabilityScore}/25</p>
                      {vuln.cveId && (
                        <span className="text-[10px] font-mono text-amber-400/80 bg-amber-400/10 px-1.5 py-0.5 rounded">
                          {vuln.cveId}
                        </span>
                      )}
                    </div>
                  </div>
                  <SeverityBadge rating={vuln.vulnerabilityRating} size="sm" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Related Risks */}
        {relatedRisks.length > 0 && (
          <div className="bg-[#111118] border border-[#2a2a3a] rounded-xl p-5">
            <h2 className="text-sm font-semibold text-white mb-3">
              Related Risks ({relatedRisks.length})
            </h2>
            <div className="space-y-2">
              {relatedRisks.map((risk) => (
                <Link
                  key={`${risk.threatId}-${risk.vulnerabilityId}`}
                  href={`/risks/${risk.threatId}/${risk.vulnerabilityId}`}
                  className="flex items-center justify-between p-3 rounded-lg border border-[#2a2a3a] hover:border-[#3a3a4a] transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white">{risk.threatName}</span>
                      <span className="text-[10px] text-gray-600">&rarr;</span>
                      <span className="text-sm text-amber-400">{risk.vulnerabilityName}</span>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-0.5">Score: {risk.riskScore}/25</p>
                  </div>
                  <SeverityBadge rating={risk.riskRating} size="sm" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Comments */}
        <CommentSection targetType="bip" targetId={id} />
      </div>
    </DashboardLayout>
  );
}
