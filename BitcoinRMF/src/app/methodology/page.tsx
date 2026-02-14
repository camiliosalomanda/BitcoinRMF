'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { Shield, Target, BarChart3, BookOpen, Scale, Database } from 'lucide-react';

const SECTIONS = [
  {
    id: 'stride',
    title: 'STRIDE Threat Classification',
    icon: Shield,
    content: `STRIDE is a threat modeling framework developed by Microsoft that categorizes threats into six types. We apply it to Bitcoin's architecture to ensure comprehensive coverage of the threat landscape.`,
    items: [
      { term: 'Spoofing', desc: 'Identity impersonation — e.g., deriving private keys from exposed public keys, social engineering attacks on custody solutions.' },
      { term: 'Tampering', desc: 'Data modification — e.g., transaction malleability, block reorganizations, supply chain attacks on node software.' },
      { term: 'Repudiation', desc: 'Deniability of actions — e.g., coinjoin and mixing services used to obscure fund origins, timestamp manipulation.' },
      { term: 'Information Disclosure', desc: 'Privacy breaches — e.g., on-chain analysis deanonymizing users, SPV bloom filter leaks, network-level surveillance.' },
      { term: 'Denial of Service', desc: 'Service disruption — e.g., network-level eclipse attacks, mempool flooding, mining pool centralization reducing liveness.' },
      { term: 'Elevation of Privilege', desc: 'Unauthorized access escalation — e.g., consensus rule bypass via 51% attacks, governance capture through soft fork manipulation.' },
    ],
  },
  {
    id: 'fair',
    title: 'FAIR Quantitative Risk Analysis',
    icon: BarChart3,
    content: `Factor Analysis of Information Risk (FAIR) provides a quantitative framework for understanding, analyzing, and measuring information risk. We use FAIR to translate qualitative threat assessments into dollar-denominated risk metrics.`,
    items: [
      { term: 'Threat Event Frequency (TEF)', desc: 'How often the threat event is expected to occur per year. Based on historical incidents, academic research, and expert estimates.' },
      { term: 'Vulnerability (V)', desc: 'Probability (0-1) that a threat event results in a loss. Considers existing controls, protocol design, and network properties.' },
      { term: 'Loss Event Frequency (LEF)', desc: 'TEF x Vulnerability. The expected number of loss events per year.' },
      { term: 'Primary Loss (USD)', desc: 'Direct financial loss — funds stolen, destroyed, or rendered inaccessible.' },
      { term: 'Secondary Loss (USD)', desc: 'Indirect losses — market cap impact, reputation damage, regulatory consequences, ecosystem disruption.' },
      { term: 'Annualized Loss Expectancy (ALE)', desc: 'LEF x (Primary + Secondary Loss). The expected annual dollar impact of the threat.' },
    ],
  },
  {
    id: 'nist-rmf',
    title: 'NIST Risk Management Framework',
    icon: Target,
    content: `The NIST Risk Management Framework (RMF) provides a structured process for managing information security and privacy risk. We track each threat through the NIST lifecycle to ensure systematic risk treatment.`,
    items: [
      { term: 'Prepare', desc: 'Establish context, priorities, and resources for managing risk. Identify essential functions and assets.' },
      { term: 'Categorize', desc: 'Classify the information system and the information processed based on impact analysis.' },
      { term: 'Select', desc: 'Choose appropriate security controls based on risk assessment and organizational needs.' },
      { term: 'Implement', desc: 'Put the selected controls into practice and document their deployment.' },
      { term: 'Assess', desc: 'Evaluate whether controls are implemented correctly, operating as intended, and producing the desired outcome.' },
      { term: 'Authorize', desc: 'Senior officials make risk-based decisions to authorize system operation.' },
      { term: 'Monitor', desc: 'Continuously track control effectiveness, environmental changes, and emerging threats.' },
    ],
  },
];

export default function MethodologyPage() {
  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Methodology</h1>
          <p className="text-gray-500 text-sm mt-1">
            How we assess, quantify, and manage Bitcoin&apos;s threat landscape
          </p>
        </div>

        {/* Overview */}
        <div className="bg-[#111118] border border-[#2a2a3a] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen size={20} className="text-[#f7931a]" />
            <h2 className="text-lg font-semibold text-white">Framework Overview</h2>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed">
            Bitcoin RMF combines three institutional-grade frameworks to provide comprehensive
            risk analysis. <strong className="text-gray-300">STRIDE</strong> ensures we categorize threats
            systematically. <strong className="text-gray-300">FAIR</strong> translates qualitative assessments into
            quantitative dollar-denominated risk. <strong className="text-gray-300">NIST RMF</strong> provides the
            lifecycle process for tracking threats from identification through remediation.
          </p>
          <p className="text-sm text-gray-400 leading-relaxed mt-3">
            Each threat is scored on a 5x5 risk matrix (Likelihood x Impact), with severity scores
            ranging from 1 (minimal) to 25 (catastrophic). Threats are rated as CRITICAL (&ge;20),
            HIGH (15-19), MEDIUM (10-14), LOW (5-9), or VERY LOW (1-4).
          </p>
        </div>

        {/* Framework Sections */}
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          return (
            <div key={section.id} id={section.id} className="bg-[#111118] border border-[#2a2a3a] rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Icon size={20} className="text-[#f7931a]" />
                <h2 className="text-lg font-semibold text-white">{section.title}</h2>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed mb-4">{section.content}</p>
              <div className="space-y-3">
                {section.items.map((item) => (
                  <div key={item.term} className="border-l-2 border-[#f7931a]/30 pl-4">
                    <p className="text-sm font-medium text-gray-200">{item.term}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Scoring Rubric */}
        <div className="bg-[#111118] border border-[#2a2a3a] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Scale size={20} className="text-[#f7931a]" />
            <h2 className="text-lg font-semibold text-white">Scoring Rubric</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2a2a3a]">
                  <th className="text-left py-2 pr-4 text-[10px] font-medium text-gray-500 uppercase">Level</th>
                  <th className="text-left py-2 pr-4 text-[10px] font-medium text-gray-500 uppercase">Likelihood</th>
                  <th className="text-left py-2 text-[10px] font-medium text-gray-500 uppercase">Impact</th>
                </tr>
              </thead>
              <tbody className="text-gray-400">
                <tr className="border-b border-[#2a2a3a]/50">
                  <td className="py-2 pr-4 font-medium text-gray-300">1</td>
                  <td className="py-2 pr-4">Rare — less than 1% annual probability</td>
                  <td className="py-2">Negligible — minimal disruption, no material loss</td>
                </tr>
                <tr className="border-b border-[#2a2a3a]/50">
                  <td className="py-2 pr-4 font-medium text-gray-300">2</td>
                  <td className="py-2 pr-4">Unlikely — 1-10% annual probability</td>
                  <td className="py-2">Minor — localized impact, limited financial loss</td>
                </tr>
                <tr className="border-b border-[#2a2a3a]/50">
                  <td className="py-2 pr-4 font-medium text-gray-300">3</td>
                  <td className="py-2 pr-4">Possible — 10-30% annual probability</td>
                  <td className="py-2">Moderate — significant disruption, notable financial loss</td>
                </tr>
                <tr className="border-b border-[#2a2a3a]/50">
                  <td className="py-2 pr-4 font-medium text-gray-300">4</td>
                  <td className="py-2 pr-4">Likely — 30-70% annual probability</td>
                  <td className="py-2">Major — severe disruption, large-scale financial impact</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-medium text-gray-300">5</td>
                  <td className="py-2 pr-4">Almost Certain — greater than 70% annual probability</td>
                  <td className="py-2">Catastrophic — systemic failure, existential threat to Bitcoin</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Data Sources & Transparency */}
        <div className="bg-[#111118] border border-[#2a2a3a] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Database size={20} className="text-[#f7931a]" />
            <h2 className="text-lg font-semibold text-white">Data Sources & Transparency</h2>
          </div>
          <div className="space-y-3 text-sm text-gray-400">
            <p>All threat assessments are evidence-based and cite their sources. Key data sources include:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-500">
              <li>Academic research papers and cryptographic analysis</li>
              <li>CVE databases and vulnerability disclosures</li>
              <li>Historical incident reports and post-mortems</li>
              <li>Bitcoin Core repository and BIP documentation</li>
              <li>Network monitoring data (mempool.space, blockchain.info)</li>
              <li>Mining pool distribution and hashrate metrics</li>
              <li>Regulatory filings and government publications</li>
            </ul>
            <p className="mt-3">
              FAIR estimates use empirical data wherever available and clearly document assumptions.
              All mutations (score changes, status updates, content edits) are recorded in the audit
              log with user attribution and diff tracking. Community members can submit new threats,
              BIP evaluations, and FUD analyses for admin review.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
