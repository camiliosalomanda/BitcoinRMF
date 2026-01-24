'use client';

/**
 * CFO Pricing Strategy Skill
 * Analyze pricing models and recommend optimizations
 */

import React, { useState } from 'react';
import Link from 'next/link';

interface PricingTier {
  name: string;
  currentPrice: string;
  suggestedPrice: string;
  changePercent: number;
  rationale: string;
  expectedImpact: string;
}

interface PricingIssue {
  id: string;
  type: 'underpriced' | 'overpriced' | 'opportunity' | 'competitive' | 'margin';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  revenue_impact: string;
  recommendation: string;
}

interface CompetitorAnalysis {
  competitor: string;
  theirPrice: string;
  yourPrice: string;
  positioning: 'premium' | 'competitive' | 'budget' | 'unknown';
  notes: string;
}

interface PricingAnalysis {
  summary: {
    currentModel: string;
    marketPosition: 'premium' | 'mid-market' | 'budget' | 'mixed';
    overallAssessment: 'optimal' | 'needs-adjustment' | 'significant-changes-needed';
    potentialRevenueGain: string;
  };
  tiers: PricingTier[];
  issues: PricingIssue[];
  competitors: CompetitorAnalysis[];
  strategies: string[];
  recommendations: string[];
}

const ISSUE_ICONS = {
  underpriced: '📉',
  overpriced: '📈',
  opportunity: '💡',
  competitive: '🎯',
  margin: '💰',
};

const SEVERITY_COLORS = {
  critical: { bg: 'bg-red-100', text: 'text-red-700' },
  high: { bg: 'bg-orange-100', text: 'text-orange-700' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  low: { bg: 'bg-blue-100', text: 'text-blue-700' },
};

export default function PricingStrategyPage() {
  const [pricingInfo, setPricingInfo] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<PricingAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'tiers' | 'issues' | 'competitors'>('tiers');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const runAnalysis = async () => {
    if (!pricingInfo.trim() && files.length === 0) {
      setError('Please provide pricing information or upload files');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));
      formData.append('pricingInfo', pricingInfo);

      const response = await fetch('/api/skills/cfo/pricing-strategy', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Analysis failed');
      }

      const data = await response.json();
      setResult(data.analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze pricing');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearAll = () => {
    setPricingInfo('');
    setFiles([]);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link href="/skills" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🏷️</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Pricing Strategy</h1>
                <p className="text-gray-500 text-sm">Alex will analyze your pricing and recommend optimizations</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {!result ? (
          <div className="space-y-6">
            {/* Pricing Input */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Describe Your Pricing</h3>
              <textarea
                value={pricingInfo}
                onChange={(e) => setPricingInfo(e.target.value)}
                placeholder="Describe your current pricing structure:

• What products/services do you offer?
• What are your current prices/tiers?
• Who are your main competitors and their pricing?
• What are your costs and target margins?
• Any specific pricing challenges or goals?

Example:
We offer a SaaS product with 3 tiers:
- Basic: $29/month - 1 user, 5GB storage
- Pro: $79/month - 5 users, 50GB storage  
- Enterprise: $199/month - unlimited users, 500GB storage

Competitors charge $39-299 for similar features.
Our gross margin is around 70%."
                className="w-full h-56 px-4 py-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900"
              />
            </div>

            {/* File Upload */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Upload Pricing Data (Optional)</h3>
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer hover:border-emerald-400 hover:bg-emerald-50 transition-colors">
                <span className="text-2xl mb-2">📄</span>
                <p className="text-gray-600 text-sm">Pricing sheets, competitor analysis, cost breakdowns</p>
                <input type="file" multiple className="hidden" onChange={handleFileSelect} accept=".csv,.xlsx,.xls,.pdf,.txt,.json" />
              </label>
              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  {files.map((file, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">📄 {file.name}</span>
                      <button onClick={() => setFiles(files.filter((_, idx) => idx !== i))} className="text-gray-400 hover:text-red-500">✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
            )}

            <button
              onClick={runAnalysis}
              disabled={isAnalyzing || (!pricingInfo.trim() && files.length === 0)}
              className="w-full px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Analyzing Pricing...
                </>
              ) : (
                <>🏷️ Analyze Pricing Strategy</>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-white rounded-xl border p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{result.summary.currentModel}</h3>
                  <p className="text-sm text-gray-500">Market Position: {result.summary.marketPosition}</p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    result.summary.overallAssessment === 'optimal' ? 'bg-green-100 text-green-700' :
                    result.summary.overallAssessment === 'needs-adjustment' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {result.summary.overallAssessment.replace(/-/g, ' ')}
                  </span>
                  <p className="text-sm text-emerald-600 font-medium mt-2">
                    Potential Revenue Gain: {result.summary.potentialRevenueGain}
                  </p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl border overflow-hidden">
              <div className="flex border-b">
                <button
                  onClick={() => setActiveTab('tiers')}
                  className={`flex-1 px-4 py-3 text-sm font-medium ${activeTab === 'tiers' ? 'bg-emerald-50 text-emerald-700 border-b-2 border-emerald-500' : 'text-gray-500'}`}
                >
                  Pricing Tiers ({result.tiers.length})
                </button>
                <button
                  onClick={() => setActiveTab('issues')}
                  className={`flex-1 px-4 py-3 text-sm font-medium ${activeTab === 'issues' ? 'bg-emerald-50 text-emerald-700 border-b-2 border-emerald-500' : 'text-gray-500'}`}
                >
                  Issues ({result.issues.length})
                </button>
                <button
                  onClick={() => setActiveTab('competitors')}
                  className={`flex-1 px-4 py-3 text-sm font-medium ${activeTab === 'competitors' ? 'bg-emerald-50 text-emerald-700 border-b-2 border-emerald-500' : 'text-gray-500'}`}
                >
                  Competitors ({result.competitors.length})
                </button>
              </div>

              <div className="max-h-[400px] overflow-y-auto">
                {activeTab === 'tiers' && (
                  <div className="divide-y">
                    {result.tiers.map((tier, index) => (
                      <div key={index} className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{tier.name}</h4>
                          <div className="flex items-center gap-3">
                            <span className="text-gray-500 line-through">{tier.currentPrice}</span>
                            <span className="text-xl">→</span>
                            <span className={`font-bold ${tier.changePercent > 0 ? 'text-green-600' : tier.changePercent < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                              {tier.suggestedPrice}
                            </span>
                            <span className={`text-sm ${tier.changePercent > 0 ? 'text-green-600' : tier.changePercent < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                              ({tier.changePercent > 0 ? '+' : ''}{tier.changePercent}%)
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-1"><strong>Rationale:</strong> {tier.rationale}</p>
                        <p className="text-sm text-emerald-700"><strong>Expected Impact:</strong> {tier.expectedImpact}</p>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'issues' && (
                  <div className="divide-y">
                    {result.issues.map((issue) => {
                      const colors = SEVERITY_COLORS[issue.severity];
                      return (
                        <div key={issue.id} className="p-4">
                          <div className="flex items-start gap-3">
                            <span className="text-xl">{ISSUE_ICONS[issue.type]}</span>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-gray-900">{issue.title}</h4>
                                <span className={`px-2 py-0.5 text-xs rounded-full ${colors.bg} ${colors.text}`}>{issue.severity}</span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{issue.description}</p>
                              <p className="text-sm text-orange-700 mb-2"><strong>Revenue Impact:</strong> {issue.revenue_impact}</p>
                              <div className="p-3 bg-emerald-50 rounded-lg">
                                <p className="text-sm text-emerald-800">💡 {issue.recommendation}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {activeTab === 'competitors' && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Competitor</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Their Price</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Your Price</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Position</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {result.competitors.map((comp, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{comp.competitor}</td>
                            <td className="px-4 py-3 text-sm text-right text-gray-600">{comp.theirPrice}</td>
                            <td className="px-4 py-3 text-sm text-right text-gray-600">{comp.yourPrice}</td>
                            <td className="px-4 py-3 text-center">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                comp.positioning === 'premium' ? 'bg-purple-100 text-purple-700' :
                                comp.positioning === 'competitive' ? 'bg-blue-100 text-blue-700' :
                                comp.positioning === 'budget' ? 'bg-green-100 text-green-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {comp.positioning}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">{comp.notes}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Strategies */}
            <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-6">
              <h3 className="font-semibold text-emerald-800 mb-3">💡 Pricing Strategies to Consider</h3>
              <ul className="space-y-2">
                {result.strategies.map((strategy, index) => (
                  <li key={index} className="flex items-start gap-2 text-emerald-700">
                    <span>•</span><span>{strategy}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">🎯 Priority Actions</h3>
              <ol className="space-y-3">
                {result.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-sm font-bold">{index + 1}</span>
                    <p className="text-gray-700">{rec}</p>
                  </li>
                ))}
              </ol>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button onClick={clearAll} className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
                New Analysis
              </button>
              <Link href="/dashboard" className="px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors">
                Discuss with Alex
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
