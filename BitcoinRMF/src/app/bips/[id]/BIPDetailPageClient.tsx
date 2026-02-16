'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import ScoreGauge from '@/components/ScoreGauge';
import SeverityBadge from '@/components/SeverityBadge';
import CommentSection from '@/components/comments/CommentSection';
import { DetailSkeleton } from '@/components/LoadingSkeleton';
import { useBIP, useEvaluateBIP } from '@/hooks/useBIPs';
import { useThreats } from '@/hooks/useThreats';
import { useUserRole } from '@/hooks/useUserRole';
import { BIPRecommendation } from '@/types';
import ShareToXButton from '@/components/ShareToXButton';
import { ArrowLeft, Sparkles } from 'lucide-react';

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
  const { isAdmin } = useUserRole();
  const evaluateBIP = useEvaluateBIP();

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

  const addressedThreats = threats.filter((t) => bip.threatsAddressed.includes(t.id));
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
              ) : isAdmin ? (
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
              ) : null}
            </div>
          </div>
        </div>

        {/* Not evaluated notice */}
        {!evaluated && (
          <div className="bg-[#111118] border border-yellow-400/20 rounded-xl p-4">
            <p className="text-xs text-yellow-400">
              This BIP has not been AI-evaluated yet. Only metadata from the GitHub repository is available.
              {isAdmin && ' Click "Evaluate with AI" above to run a full analysis.'}
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
            {[
              { label: 'Mitigation', score: bip.mitigationEffectiveness },
              { label: 'Consensus', score: bip.communityConsensus },
              { label: 'Readiness', score: bip.implementationReadiness },
              { label: 'Adoption', score: bip.adoptionPercentage },
            ].map((item) => (
              <div key={item.label} className="bg-[#111118] border border-[#2a2a3a] rounded-xl p-4 flex flex-col items-center">
                <ScoreGauge score={item.score} label={item.label} size="md" />
              </div>
            ))}
          </div>
        )}

        {/* Economic Impact — only for evaluated BIPs */}
        {evaluated && bip.economicImpact && (
          <div className="bg-[#111118] border border-[#2a2a3a] rounded-xl p-5">
            <h2 className="text-sm font-semibold text-white mb-3">Economic Impact</h2>
            <p className="text-sm text-gray-400">{bip.economicImpact}</p>
          </div>
        )}

        {/* Threats Addressed — only for evaluated BIPs */}
        {evaluated && (
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

        {/* Comments */}
        <CommentSection targetType="bip" targetId={id} />
      </div>
    </DashboardLayout>
  );
}
