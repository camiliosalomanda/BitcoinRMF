'use client';

import { Threat, LIKELIHOOD_LABELS, IMPACT_LABELS, NistRmfStage, BIPRecommendation, FUDStatus } from '@/types';
import SeverityBadge from '@/components/SeverityBadge';
import STRIDEBadge from '@/components/STRIDEBadge';
import ThreatSourceBadge from '@/components/ThreatSourceBadge';
import StatusBadge from '@/components/StatusBadge';
import FAIRScoreCard from './FAIRScoreCard';
import Link from 'next/link';
import TweetEmbed from '@/components/evidence/TweetEmbed';
import ShareToXButton from '@/components/ShareToXButton';
import { useBIPs } from '@/hooks/useBIPs';
import { useFUD } from '@/hooks/useFUD';
import { useVulnerabilities } from '@/hooks/useVulnerabilities';
import { deriveRisks } from '@/lib/scoring';
import { ExternalLink, ArrowLeft, CheckCircle, Clock, AlertCircle, Bug } from 'lucide-react';

const RECOMMENDATION_COLORS: Record<BIPRecommendation, string> = {
  [BIPRecommendation.ESSENTIAL]: 'text-green-400 bg-green-400/10 border-green-400/30',
  [BIPRecommendation.RECOMMENDED]: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  [BIPRecommendation.OPTIONAL]: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  [BIPRecommendation.UNNECESSARY]: 'text-gray-400 bg-gray-400/10 border-gray-400/30',
  [BIPRecommendation.HARMFUL]: 'text-red-400 bg-red-400/10 border-red-400/30',
};

const FUD_STATUS_COLORS: Record<FUDStatus, string> = {
  ACTIVE: 'text-red-400 bg-red-400/10 border-red-400/30',
  DEBUNKED: 'text-green-400 bg-green-400/10 border-green-400/30',
  PARTIALLY_VALID: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
};

interface ThreatDetailProps {
  threat: Threat;
}

const NIST_STAGES = Object.values(NistRmfStage);

export default function ThreatDetail({ threat }: ThreatDetailProps) {
  const { data: allBIPs = [] } = useBIPs();
  const { data: allFUD = [] } = useFUD();
  const { data: allVulnerabilities = [] } = useVulnerabilities();
  const currentStageIdx = NIST_STAGES.indexOf(threat.nistStage);

  const resolvedBIPs = allBIPs.filter((bip) => threat.relatedBIPs.includes(bip.bipNumber));
  const relatedFUD = allFUD.filter((fud) => fud.relatedThreats.includes(threat.id));
  const linkedVulns = allVulnerabilities.filter((v) => threat.vulnerabilityIds.includes(v.id));
  const derivedRisks = deriveRisks([threat], linkedVulns);

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link href="/threats" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#f7931a] transition-colors">
        <ArrowLeft size={14} />
        Back to Threats
      </Link>

      {/* Header */}
      <div className="bg-[#111118] border border-[#2a2a3a] rounded-xl p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white mb-2">{threat.name}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <STRIDEBadge category={threat.strideCategory} />
              <ThreatSourceBadge source={threat.threatSource} />
              <StatusBadge status={threat.status} />
            </div>
          </div>
          <div className="text-right space-y-2">
            <SeverityBadge rating={threat.riskRating} />
            <p className="text-2xl font-bold text-[#f7931a] mt-1">{threat.severityScore}<span className="text-sm text-gray-500">/25</span></p>
            <ShareToXButton
              text={`\u26a0\ufe0f ${threat.riskRating} Bitcoin Threat: "${threat.name}" \u2014 Severity ${threat.severityScore}/25 (${threat.strideCategory})`}
              hashtags={['Bitcoin', 'BitcoinRMF']}
            />
          </div>
        </div>
        <p className="text-sm text-gray-400 mt-4">{threat.description}</p>
        <p className="text-xs text-gray-600 mt-2">STRIDE Rationale: {threat.strideRationale}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vulnerability & Exploit */}
        <div className="bg-[#111118] border border-[#2a2a3a] rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-3">Vulnerability</h2>
          <p className="text-sm text-gray-400">{threat.vulnerability}</p>
          <h2 className="text-sm font-semibold text-white mt-5 mb-3">Exploit Scenario</h2>
          <p className="text-sm text-gray-400">{threat.exploitScenario}</p>
        </div>

        {/* FAIR Analysis */}
        <FAIRScoreCard fair={threat.fairEstimates} />
      </div>

      {/* Likelihood & Impact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#111118] border border-[#2a2a3a] rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-2">
            Likelihood: {threat.likelihood}/5 ({LIKELIHOOD_LABELS[threat.likelihood]})
          </h2>
          <p className="text-sm text-gray-400">{threat.likelihoodJustification}</p>
        </div>
        <div className="bg-[#111118] border border-[#2a2a3a] rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-2">
            Impact: {threat.impact}/5 ({IMPACT_LABELS[threat.impact]})
          </h2>
          <p className="text-sm text-gray-400">{threat.impactJustification}</p>
        </div>
      </div>

      {/* NIST RMF Stage */}
      <div className="bg-[#111118] border border-[#2a2a3a] rounded-xl p-5">
        <h2 className="text-sm font-semibold text-white mb-4">NIST RMF Stage</h2>
        <div className="flex items-center gap-1">
          {NIST_STAGES.map((stage, idx) => (
            <div key={stage} className="flex-1">
              <div className={`h-2 rounded-full ${
                idx <= currentStageIdx ? 'bg-[#f7931a]' : 'bg-gray-800'
              }`} />
              <p className={`text-[9px] mt-1 text-center ${
                idx === currentStageIdx ? 'text-[#f7931a] font-bold' : idx < currentStageIdx ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {stage}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Linked Vulnerabilities */}
      <div className="bg-[#111118] border border-[#2a2a3a] rounded-xl p-5">
        <h2 className="text-sm font-semibold text-white mb-4">
          Linked Vulnerabilities ({linkedVulns.length})
        </h2>
        <div className="space-y-2">
          {linkedVulns.map((vuln) => (
            <Link
              key={vuln.id}
              href={`/vulnerabilities/${vuln.id}`}
              className="flex items-center justify-between p-3 rounded-lg border border-[#2a2a3a] hover:border-[#3a3a4a] transition-colors"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Bug size={14} className="text-amber-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-white truncate">{vuln.name}</p>
                  <p className="text-[10px] text-gray-500">
                    Score: {vuln.vulnerabilityScore}/25 (S{vuln.severity} &times; E{vuln.exploitability})
                  </p>
                </div>
              </div>
              <SeverityBadge rating={vuln.vulnerabilityRating} size="sm" />
            </Link>
          ))}
          {linkedVulns.length === 0 && (
            <p className="text-xs text-gray-600">No linked vulnerabilities</p>
          )}
        </div>
      </div>

      {/* Derived Risks */}
      {derivedRisks.length > 0 && (
        <div className="bg-[#111118] border border-[#2a2a3a] rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4">
            Derived Risks ({derivedRisks.length})
          </h2>
          <div className="space-y-2">
            {derivedRisks.map((risk) => (
              <div
                key={`${risk.threatId}-${risk.vulnerabilityId}`}
                className="flex items-center justify-between p-3 rounded-lg border border-[#2a2a3a]"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white">{risk.threatName}</span>
                    <span className="text-[10px] text-gray-600">&rarr;</span>
                    <Link href={`/vulnerabilities/${risk.vulnerabilityId}`} className="text-sm text-amber-400 hover:text-[#f7931a]">
                      {risk.vulnerabilityName}
                    </Link>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    Likelihood {risk.likelihood} &times; Severity {risk.impact} = Risk Score {risk.riskScore}/25
                  </p>
                </div>
                <SeverityBadge rating={risk.riskRating} size="sm" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Remediation Strategies */}
      <div className="bg-[#111118] border border-[#2a2a3a] rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white">Remediation Strategies</h2>
          {linkedVulns.length > 0 && (
            <span className="text-[10px] text-gray-600">Remediations now tracked on vulnerabilities</span>
          )}
        </div>
        <div className="space-y-3">
          {threat.remediationStrategies.map((rem) => (
            <div key={rem.id} className="border border-[#2a2a3a] rounded-lg p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2">
                  {rem.status === 'COMPLETED' ? (
                    <CheckCircle size={16} className="text-green-400 mt-0.5" />
                  ) : rem.status === 'IN_PROGRESS' ? (
                    <Clock size={16} className="text-blue-400 mt-0.5" />
                  ) : (
                    <AlertCircle size={16} className="text-gray-500 mt-0.5" />
                  )}
                  <div>
                    <h3 className="text-sm font-medium text-white">{rem.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">{rem.description}</p>
                  </div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                  rem.status === 'COMPLETED' ? 'text-green-400 bg-green-400/10' :
                  rem.status === 'IN_PROGRESS' ? 'text-blue-400 bg-blue-400/10' :
                  rem.status === 'PLANNED' ? 'text-yellow-400 bg-yellow-400/10' :
                  'text-gray-400 bg-gray-400/10'
                }`}>
                  {rem.status}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-3 text-[10px] text-gray-500">
                <span>Effectiveness: {rem.effectiveness}%</span>
                <span>Timeline: {rem.timelineMonths}mo</span>
                {rem.relatedBIPs.length > 0 && (
                  <span className="flex items-center gap-1">
                    BIPs:{' '}
                    {rem.relatedBIPs.map((bipNum, i) => {
                      const bip = allBIPs.find((b) => b.bipNumber === bipNum);
                      return (
                        <span key={bipNum}>
                          {bip ? (
                            <Link href={`/bips/${bip.id}`} className="text-[#f7931a] hover:underline">
                              {bipNum}
                            </Link>
                          ) : (
                            <span>{bipNum}</span>
                          )}
                          {i < rem.relatedBIPs.length - 1 && ', '}
                        </span>
                      );
                    })}
                  </span>
                )}
              </div>
              {/* Progress bar */}
              <div className="mt-2 h-1 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#f7931a] rounded-full transition-all"
                  style={{ width: `${rem.effectiveness}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Related BIPs & Evidence */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#111118] border border-[#2a2a3a] rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-3">
            Related BIPs ({resolvedBIPs.length})
          </h2>
          <div className="space-y-2">
            {resolvedBIPs.map((bip) => (
              <Link
                key={bip.id}
                href={`/bips/${bip.id}`}
                className="flex items-center justify-between p-3 rounded-lg border border-[#2a2a3a] hover:border-[#3a3a4a] transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-[#f7931a] font-bold">{bip.bipNumber}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${RECOMMENDATION_COLORS[bip.recommendation]}`}>
                      {bip.recommendation}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{bip.title}</p>
                </div>
                <span className="text-xs text-gray-500">Necessity: {bip.necessityScore}/100</span>
              </Link>
            ))}
            {/* Show unresolved BIP numbers that aren't in the database */}
            {threat.relatedBIPs
              .filter((bipNum) => !allBIPs.find((b) => b.bipNumber === bipNum))
              .map((bipNum) => (
                <div key={bipNum} className="flex items-center p-3 rounded-lg border border-[#2a2a3a]">
                  <span className="text-xs px-2 py-1 rounded bg-[#f7931a]/10 text-[#f7931a] font-mono">{bipNum}</span>
                </div>
              ))}
            {threat.relatedBIPs.length === 0 && (
              <p className="text-xs text-gray-600">No related BIPs</p>
            )}
          </div>
        </div>

        <div className="bg-[#111118] border border-[#2a2a3a] rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-3">Evidence Sources</h2>
          <div className="space-y-2">
            {threat.evidenceSources.map((src, idx) => (
              src.type === 'X_POST' && src.url ? (
                <TweetEmbed key={idx} url={src.url} />
              ) : (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400">{src.type}</span>
                  <span className="text-xs text-gray-400 flex-1 truncate">{src.title}</span>
                  {src.url && (
                    <a href={src.url} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-[#f7931a]">
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              )
            ))}
          </div>
        </div>
      </div>

      {/* Related FUD */}
      <div className="bg-[#111118] border border-[#2a2a3a] rounded-xl p-5">
        <h2 className="text-sm font-semibold text-white mb-3">
          Related FUD ({relatedFUD.length})
        </h2>
        <div className="space-y-2">
          {relatedFUD.map((fud) => (
            <Link
              key={fud.id}
              href={`/fud/${fud.id}`}
              className="flex items-center justify-between p-3 rounded-lg border border-[#2a2a3a] hover:border-[#3a3a4a] transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{fud.narrative}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-gray-500 uppercase">{fud.category}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${FUD_STATUS_COLORS[fud.status]}`}>
                    {fud.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
              <span className="text-xs text-gray-500 ml-3">Validity: {fud.validityScore}%</span>
            </Link>
          ))}
          {relatedFUD.length === 0 && (
            <p className="text-xs text-gray-600">No related FUD narratives</p>
          )}
        </div>
      </div>

      {/* Affected Components */}
      <div className="bg-[#111118] border border-[#2a2a3a] rounded-xl p-5">
        <h2 className="text-sm font-semibold text-white mb-3">Affected Components</h2>
        <div className="flex flex-wrap gap-2">
          {threat.affectedComponents.map((comp) => (
            <span key={comp} className="text-xs px-2 py-1 rounded bg-cyan-400/10 text-cyan-400 border border-cyan-400/20">
              {comp.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
