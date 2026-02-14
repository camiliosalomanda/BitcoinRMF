'use client';

import { Threat, LIKELIHOOD_LABELS, IMPACT_LABELS, NistRmfStage } from '@/types';
import SeverityBadge from '@/components/SeverityBadge';
import STRIDEBadge from '@/components/STRIDEBadge';
import ThreatSourceBadge from '@/components/ThreatSourceBadge';
import StatusBadge from '@/components/StatusBadge';
import FAIRScoreCard from './FAIRScoreCard';
import Link from 'next/link';
import TweetEmbed from '@/components/evidence/TweetEmbed';
import { ExternalLink, ArrowLeft, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface ThreatDetailProps {
  threat: Threat;
}

const NIST_STAGES = Object.values(NistRmfStage);

export default function ThreatDetail({ threat }: ThreatDetailProps) {
  const currentStageIdx = NIST_STAGES.indexOf(threat.nistStage);

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
          <div className="text-right">
            <SeverityBadge rating={threat.riskRating} />
            <p className="text-2xl font-bold text-[#f7931a] mt-1">{threat.severityScore}<span className="text-sm text-gray-500">/25</span></p>
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

      {/* Remediation Strategies */}
      <div className="bg-[#111118] border border-[#2a2a3a] rounded-xl p-5">
        <h2 className="text-sm font-semibold text-white mb-4">Remediation Strategies</h2>
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
                  <span>BIPs: {rem.relatedBIPs.join(', ')}</span>
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
          <h2 className="text-sm font-semibold text-white mb-3">Related BIPs</h2>
          <div className="flex flex-wrap gap-2">
            {threat.relatedBIPs.map((bip) => (
              <span key={bip} className="text-xs px-2 py-1 rounded bg-[#f7931a]/10 text-[#f7931a] font-mono">
                {bip}
              </span>
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
