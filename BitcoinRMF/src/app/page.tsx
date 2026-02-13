'use client';

import Link from 'next/link';
import {
  Shield,
  Grid3X3,
  FileCode,
  MessageSquareWarning,
  Activity,
  Bitcoin,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';
import { getMatrixCellColor } from '@/lib/scoring';

const FEATURES = [
  {
    icon: Shield,
    title: 'STRIDE Threat Modeling',
    description: 'Categorize Bitcoin threats using the industry-standard STRIDE framework — Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege.',
    color: '#ef4444',
  },
  {
    icon: Activity,
    title: 'FAIR Quantification',
    description: 'Quantify risk with Factor Analysis of Information Risk — estimate threat event frequency, vulnerability probability, and annualized loss expectancy in USD.',
    color: '#f7931a',
  },
  {
    icon: Grid3X3,
    title: 'NIST RMF Lifecycle',
    description: 'Track threats through the full NIST Risk Management Framework — Prepare, Categorize, Select, Implement, Assess, Authorize, Monitor.',
    color: '#3b82f6',
  },
  {
    icon: FileCode,
    title: 'BIP Evaluator',
    description: 'Score Bitcoin Improvement Proposal necessity against the current threat landscape. Evidence-based analysis of whether a BIP is essential, recommended, or unnecessary.',
    color: '#22c55e',
  },
  {
    icon: MessageSquareWarning,
    title: 'FUD Counter',
    description: 'Track FUD narratives with validity scoring. Evidence for and against each claim, debunk summaries, and price impact estimates.',
    color: '#eab308',
  },
];

// Static preview matrix data
const PREVIEW_MATRIX = [
  [0, 0, 0, 1, 2],
  [0, 0, 2, 2, 0],
  [0, 1, 2, 2, 0],
  [0, 0, 1, 1, 1],
  [0, 0, 1, 0, 0],
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Navigation */}
      <nav className="border-b border-[#2a2a3a] bg-[#0a0a0f]/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-[#f7931a] to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-[#f7931a]/20">
              <Bitcoin size={20} className="text-white" />
            </div>
            <span className="font-bold text-lg text-white">Bitcoin RMF</span>
          </div>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 bg-[#f7931a] hover:bg-[#f7931a]/90 text-black font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
          >
            Open Dashboard
            <ArrowRight size={14} />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f7931a]/10 border border-[#f7931a]/20 text-[#f7931a] text-xs font-medium mb-6">
            <Shield size={12} />
            Institutional-Grade Risk Analysis
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
            Bitcoin Risk Management
            <br />
            <span className="text-[#f7931a]">Framework</span>
          </h1>
          <p className="text-lg text-gray-400 mt-6 max-w-2xl mx-auto">
            Apply NIST RMF, FAIR, and STRIDE frameworks to Bitcoin&apos;s threat landscape.
            Identify threats, score severity, track remediation, evaluate BIP necessity,
            and counter FUD with evidence-based analysis.
          </p>
          <div className="flex items-center justify-center gap-4 mt-8">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 bg-[#f7931a] hover:bg-[#f7931a]/90 text-black font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              View Dashboard
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/threats"
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-[#2a2a3a] px-6 py-3 rounded-lg transition-colors"
            >
              Threat Register
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Risk Matrix Preview */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="bg-[#111118] border border-[#2a2a3a] rounded-2xl p-8">
          <div className="text-center mb-6">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Live Risk Heatmap</h2>
          </div>
          <div className="max-w-md mx-auto">
            <div className="grid grid-rows-5 gap-1.5">
              {PREVIEW_MATRIX.map((row, ri) => (
                <div key={ri} className="grid grid-cols-5 gap-1.5">
                  {row.map((count, ci) => (
                    <div
                      key={ci}
                      className={`h-12 rounded-lg flex items-center justify-center text-sm font-bold ${getMatrixCellColor(
                        5 - ri,
                        ci + 1
                      )} ${count > 0 ? 'text-white' : 'text-transparent'}`}
                    >
                      {count || ''}
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-3 text-[10px] text-gray-600">
              <span>Likelihood &uarr;</span>
              <span>Impact &rarr;</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-white">Comprehensive Risk Intelligence</h2>
          <p className="text-gray-500 mt-2">Five integrated modules for complete Bitcoin risk analysis</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="bg-[#111118] border border-[#2a2a3a] rounded-xl p-6 hover:border-[#3a3a4a] transition-all"
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: `${feature.color}15` }}>
                  <Icon size={20} style={{ color: feature.color }} />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="bg-gradient-to-r from-[#f7931a]/10 to-amber-900/10 border border-[#f7931a]/20 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Ready to analyze Bitcoin&apos;s threat landscape?</h2>
          <p className="text-gray-400 mb-6">18 pre-seeded threats, 5 BIP evaluations, and 5 FUD narratives ready to explore.</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-[#f7931a] hover:bg-[#f7931a]/90 text-black font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Launch Dashboard
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#2a2a3a] py-6">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-xs text-gray-600">
          <span>Bitcoin RMF — Institutional-Grade Risk Analysis</span>
          <span>NIST RMF + FAIR + STRIDE</span>
        </div>
      </footer>
    </div>
  );
}
