'use client';

import {
  DerivedRisk,
  LIKELIHOOD_LABELS,
  SEVERITY_LABELS,
  NistRmfStage,
  LikelihoodLevel,
  SeverityLevel,
} from '@/types';
import SeverityBadge from '@/components/SeverityBadge';
import STRIDEBadge from '@/components/STRIDEBadge';
import FAIRScoreCard from '@/components/threats/FAIRScoreCard';
import ShareToXButton from '@/components/ShareToXButton';
import Link from 'next/link';
import { useBIPs } from '@/hooks/useBIPs';
import {
  ArrowLeft,
  Shield,
  Bug,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';

const NIST_STAGES = Object.values(NistRmfStage);

interface RiskDetailProps {
  risk: DerivedRisk;
}

export default function RiskDetail({ risk }: RiskDetailProps) {
  const { data: allBIPs = [] } = useBIPs();
  const { threat, vulnerability } = risk;
  const currentStageIdx = NIST_STAGES.indexOf(threat.nistStage);

  // Union of affected components
  const allComponents = Array.from(
    new Set([...threat.affectedComponents, ...vulnerability.affectedComponents])
  );

  // Remediations from vulnerability
  const remediations = vulnerability.remediationStrategies;

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/risk-matrix"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#f7931a] transition-colors"
      >
        <ArrowLeft size={14} />
        Back to Risk Matrix
      </Link>

      {/* Header */}
      <div className="bg-[#111118] border border-[#2a2a3a] rounded-xl p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white mb-2">
              {risk.threatName}
              <span className="text-gray-600 mx-2">&rarr;</span>
              {risk.vulnerabilityName}
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              <STRIDEBadge category={threat.strideCategory} />
              <span className="text-[10px] text-gray-500">Risk from threat &times; vulnerability pairing</span>
            </div>
          </div>
          <div className="text-right space-y-2">
            <SeverityBadge rating={risk.riskRating} />
            <p className="text-2xl font-bold text-[#f7931a] mt-1">
              {risk.riskScore}
              <span className="text-sm text-gray-500">/25</span>
            </p>
            <ShareToXButton
              text={`\u26a0\ufe0f ${risk.riskRating} Bitcoin Risk: "${risk.threatName} \u2192 ${risk.vulnerabilityName}" \u2014 Score ${risk.riskScore}/25`}
              hashtags={['Bitcoin', 'BitcoinRMF']}
            />
          </div>
        </div>
      </div>

      {/* Risk Summary — parent threat & vulnerability cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href={`/threats/${threat.id}`}
          className="bg-[#111118] border border-[#2a2a3a] rounded-xl p-5 hover:border-[#3a3a4a] transition-colors"
        >
          <div className="flex items-center gap-2 mb-3">
            <Shield size={16} className="text-[#f7931a]" />
            <h2 className="text-sm font-semibold text-white">Parent Threat</h2>
          </div>
          <p className="text-sm text-gray-200">{threat.name}</p>
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{threat.description}</p>
          <div className="flex items-center gap-3 mt-3">
            <SeverityBadge rating={threat.riskRating} size="sm" />
            <span className="text-[10px] text-gray-500">
              Score: {threat.severityScore}/25
            </span>
          </div>
        </Link>

        <Link
          href={`/vulnerabilities/${vulnerability.id}`}
          className="bg-[#111118] border border-[#2a2a3a] rounded-xl p-5 hover:border-[#3a3a4a] transition-colors"
        >
          <div className="flex items-center gap-2 mb-3">
            <Bug size={16} className="text-amber-400" />
            <h2 className="text-sm font-semibold text-white">Parent Vulnerability</h2>
          </div>
          <p className="text-sm text-gray-200">{vulnerability.name}</p>
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{vulnerability.description}</p>
          <div className="flex items-center gap-3 mt-3">
            <SeverityBadge rating={vulnerability.vulnerabilityRating} size="sm" />
            <span className="text-[10px] text-gray-500">
              Score: {vulnerability.vulnerabilityScore}/25
            </span>
          </div>
        </Link>
      </div>

      {/* FAIR Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FAIRScoreCard fair={threat.fairEstimates} />

        {/* Likelihood & Impact side-by-side */}
        <div className="space-y-4">
          <div className="bg-[#111118] border border-[#2a2a3a] rounded-xl p-5">
            <h2 className="text-sm font-semibold text-white mb-2">
              Likelihood: {risk.likelihood}/5 ({LIKELIHOOD_LABELS[risk.likelihood as LikelihoodLevel]})
            </h2>
            <p className="text-sm text-gray-400">{threat.likelihoodJustification}</p>
            <div className="mt-3 h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#f7931a] rounded-full transition-all"
                style={{ width: `${(risk.likelihood / 5) * 100}%` }}
              />
            </div>
          </div>
          <div className="bg-[#111118] border border-[#2a2a3a] rounded-xl p-5">
            <h2 className="text-sm font-semibold text-white mb-2">
              Impact (Severity): {risk.impact}/5 ({SEVERITY_LABELS[risk.impact as SeverityLevel]})
            </h2>
            <p className="text-xs text-gray-500">
              Derived from vulnerability severity — how severe the consequence if exploited.
            </p>
            <div className="mt-3 h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500 rounded-full transition-all"
                style={{ width: `${(risk.impact / 5) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* NIST RMF Stage */}
      <div className="bg-[#111118] border border-[#2a2a3a] rounded-xl p-5">
        <h2 className="text-sm font-semibold text-white mb-4">NIST RMF Stage</h2>
        <div className="flex items-center gap-1">
          {NIST_STAGES.map((stage, idx) => (
            <div key={stage} className="flex-1">
              <div
                className={`h-2 rounded-full ${
                  idx <= currentStageIdx ? 'bg-[#f7931a]' : 'bg-gray-800'
                }`}
              />
              <p
                className={`text-[9px] mt-1 text-center ${
                  idx === currentStageIdx
                    ? 'text-[#f7931a] font-bold'
                    : idx < currentStageIdx
                      ? 'text-gray-400'
                      : 'text-gray-600'
                }`}
              >
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
          {remediations.map((rem) => (
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
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                    rem.status === 'COMPLETED'
                      ? 'text-green-400 bg-green-400/10'
                      : rem.status === 'IN_PROGRESS'
                        ? 'text-blue-400 bg-blue-400/10'
                        : rem.status === 'PLANNED'
                          ? 'text-yellow-400 bg-yellow-400/10'
                          : 'text-gray-400 bg-gray-400/10'
                  }`}
                >
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
                            <Link
                              href={`/bips/${bip.id}`}
                              className="text-[#f7931a] hover:underline"
                            >
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
              <div className="mt-2 h-1 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#f7931a] rounded-full transition-all"
                  style={{ width: `${rem.effectiveness}%` }}
                />
              </div>
            </div>
          ))}
          {remediations.length === 0 && (
            <p className="text-xs text-gray-600">No remediation strategies defined</p>
          )}
        </div>
      </div>

      {/* Affected Components */}
      <div className="bg-[#111118] border border-[#2a2a3a] rounded-xl p-5">
        <h2 className="text-sm font-semibold text-white mb-3">Affected Components</h2>
        <div className="flex flex-wrap gap-2">
          {allComponents.map((comp) => (
            <span
              key={comp}
              className="text-xs px-2 py-1 rounded bg-cyan-400/10 text-cyan-400 border border-cyan-400/20"
            >
              {comp.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
