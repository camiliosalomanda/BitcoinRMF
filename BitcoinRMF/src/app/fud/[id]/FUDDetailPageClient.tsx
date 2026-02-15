'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import SeverityBadge from '@/components/SeverityBadge';
import CommentSection from '@/components/comments/CommentSection';
import VotePanel from '@/components/votes/VotePanel';
import { DetailSkeleton } from '@/components/LoadingSkeleton';
import { useFUDItem } from '@/hooks/useFUD';
import { useThreats } from '@/hooks/useThreats';
import { FUDStatus } from '@/types';
import TweetEmbed from '@/components/evidence/TweetEmbed';
import ShareToXButton from '@/components/ShareToXButton';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';

const X_URL_PATTERN = /^https?:\/\/(twitter\.com|x\.com)\/\w+\/status\/\d+/;

const STATUS_COLORS: Record<FUDStatus, string> = {
  ACTIVE: 'text-red-400 bg-red-400/10 border-red-400/30',
  DEBUNKED: 'text-green-400 bg-green-400/10 border-green-400/30',
  PARTIALLY_VALID: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
};

export default function FUDDetailPageClient() {
  const params = useParams();
  const id = params.id as string;
  const { data: fud, isLoading: fudLoading } = useFUDItem(id);
  const { data: threats = [] } = useThreats();

  if (fudLoading) {
    return (
      <DashboardLayout>
        <DetailSkeleton />
      </DashboardLayout>
    );
  }

  if (!fud) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-gray-400">FUD analysis not found</p>
        </div>
      </DashboardLayout>
    );
  }

  const relatedThreats = threats.filter((t) => fud.relatedThreats.includes(t.id));

  function getValidityColor(score: number): string {
    if (score >= 60) return '#ef4444';
    if (score >= 40) return '#eab308';
    if (score >= 20) return '#22c55e';
    return '#10b981';
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Link href="/fud" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#f7931a] transition-colors">
          <ArrowLeft size={14} />
          Back to FUD Tracker
        </Link>

        {/* Header */}
        <div className="bg-[#111118] border border-[#2a2a3a] rounded-xl p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] text-gray-500 uppercase">{fud.category}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_COLORS[fud.status]}`}>
                  {fud.status.replace(/_/g, ' ')}
                </span>
              </div>
              <h1 className="text-xl font-bold text-white">{fud.narrative}</h1>
            </div>
            <div className="text-right space-y-2">
              <p className="text-3xl font-bold" style={{ color: getValidityColor(fud.validityScore) }}>
                {fud.validityScore}%
              </p>
              <p className="text-[10px] text-gray-500">Validity Score</p>
              <ShareToXButton
                text={`Bitcoin FUD Check: "${fud.narrative.length > 100 ? fud.narrative.slice(0, 100) + '\u2026' : fud.narrative}" \u2014 ${fud.status.replace(/_/g, ' ')} (Validity: ${fud.validityScore}%)`}
                hashtags={['Bitcoin', 'FUD', 'BitcoinRMF']}
              />
            </div>
          </div>

          {/* Validity bar */}
          <div className="mt-4">
            <div className="flex justify-between text-[10px] mb-1">
              <span className="text-green-400">Complete FUD (0%)</span>
              <span className="text-red-400">Completely Valid (100%)</span>
            </div>
            <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${fud.validityScore}%`, backgroundColor: getValidityColor(fud.validityScore) }}
              />
            </div>
          </div>
        </div>

        {/* Debunk Summary */}
        <div className="bg-[#111118] border border-[#2a2a3a] rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-3">Analysis Summary</h2>
          <p className="text-sm text-gray-400">{fud.debunkSummary}</p>
        </div>

        {/* Evidence For / Against */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#111118] border border-[#2a2a3a] rounded-xl p-5">
            <h2 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
              <XCircle size={14} />
              Evidence Supporting Concern ({fud.evidenceFor.length})
            </h2>
            <div className="space-y-2">
              {fud.evidenceFor.map((ev, idx) => (
                X_URL_PATTERN.test(ev) ? (
                  <TweetEmbed key={idx} url={ev} />
                ) : (
                  <p key={idx} className="text-sm text-gray-400 flex items-start gap-2">
                    <span className="text-red-400/50 mt-0.5">&bull;</span>
                    {ev}
                  </p>
                )
              ))}
            </div>
          </div>

          <div className="bg-[#111118] border border-[#2a2a3a] rounded-xl p-5">
            <h2 className="text-sm font-semibold text-green-400 mb-3 flex items-center gap-2">
              <CheckCircle size={14} />
              Evidence Against / Debunking ({fud.evidenceAgainst.length})
            </h2>
            <div className="space-y-2">
              {fud.evidenceAgainst.map((ev, idx) => (
                X_URL_PATTERN.test(ev) ? (
                  <TweetEmbed key={idx} url={ev} />
                ) : (
                  <p key={idx} className="text-sm text-gray-400 flex items-start gap-2">
                    <span className="text-green-400/50 mt-0.5">&bull;</span>
                    {ev}
                  </p>
                )
              ))}
            </div>
          </div>
        </div>

        {/* Price Impact */}
        <div className="bg-[#111118] border border-[#2a2a3a] rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-3">Price Impact Estimate</h2>
          <p className="text-sm text-gray-400">{fud.priceImpactEstimate}</p>
        </div>

        {/* Related Threats */}
        <div className="bg-[#111118] border border-[#2a2a3a] rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-3">
            Related Threats ({relatedThreats.length})
          </h2>
          <div className="space-y-2">
            {relatedThreats.map((threat) => (
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
            {relatedThreats.length === 0 && (
              <p className="text-xs text-gray-600">No linked threats</p>
            )}
          </div>
        </div>

        {/* Community Vote */}
        <VotePanel targetType="fud" targetId={id} submittedBy={fud.submittedBy} itemStatus={fud.workflowStatus} />

        {/* Comments */}
        <CommentSection targetType="fud" targetId={id} />
      </div>
    </DashboardLayout>
  );
}
