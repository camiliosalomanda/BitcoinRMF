'use client';

/**
 * CCO Risk Assessment Skill
 * Identify and evaluate business risks
 */

import React, { useState } from 'react';
import Link from 'next/link';

interface Risk {
  id: string;
  name: string;
  category: 'operational' | 'financial' | 'strategic' | 'compliance' | 'reputational' | 'cyber' | 'legal';
  likelihood: 'rare' | 'unlikely' | 'possible' | 'likely' | 'almost-certain';
  impact: 'negligible' | 'minor' | 'moderate' | 'major' | 'severe';
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  mitigation: string;
  owner: string;
  timeline: string;
}

interface RiskCategory {
  category: string;
  riskCount: number;
  avgScore: number;
  criticalCount: number;
  topRisk: string;
}

interface RiskAssessment {
  summary: {
    totalRisks: number;
    criticalRisks: number;
    highRisks: number;
    overallRiskLevel: 'low' | 'medium' | 'high' | 'critical';
    riskScore: number;
    topRiskArea: string;
  };
  categories: RiskCategory[];
  risks: Risk[];
  heatmapData: { likelihood: string; impact: string; count: number }[];
  mitigationPriorities: string[];
  recommendations: string[];
}

const CATEGORY_ICONS: Record<string, string> = {
  operational: '⚙️',
  financial: '💰',
  strategic: '🎯',
  compliance: '📋',
  reputational: '👁️',
  cyber: '🔒',
  legal: '⚖️',
};

const RISK_LEVEL_COLORS = {
  low: { bg: 'bg-green-100', text: 'text-green-700' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  high: { bg: 'bg-orange-100', text: 'text-orange-700' },
  critical: { bg: 'bg-red-100', text: 'text-red-700' },
};

const LIKELIHOOD_MAP: Record<string, number> = {
  'rare': 1, 'unlikely': 2, 'possible': 3, 'likely': 4, 'almost-certain': 5
};

const IMPACT_MAP: Record<string, number> = {
  'negligible': 1, 'minor': 2, 'moderate': 3, 'major': 4, 'severe': 5
};

export default function RiskAssessmentPage() {
  const [riskInfo, setRiskInfo] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<RiskAssessment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'risks' | 'categories' | 'heatmap'>('risks');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const runAssessment = async () => {
    if (!riskInfo.trim() && files.length === 0) {
      setError('Please provide risk information or upload documents');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));
      formData.append('riskInfo', riskInfo);

      const response = await fetch('/api/skills/cco/risk-assessment', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Assessment failed');
      }

      const data = await response.json();
      setResult(data.assessment);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assess risks');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearAll = () => {
    setRiskInfo('');
    setFiles([]);
    setResult(null);
    setError(null);
  };

  const filteredRisks = result?.risks.filter(
    r => selectedCategory === 'all' || r.category === selectedCategory
  ) || [];

  const getHeatmapColor = (likelihood: string, impact: string) => {
    const l = LIKELIHOOD_MAP[likelihood] || 3;
    const i = IMPACT_MAP[impact] || 3;
    const score = l * i;
    if (score >= 20) return 'bg-red-500';
    if (score >= 12) return 'bg-orange-500';
    if (score >= 6) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link href="/skills" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Risk Assessment</h1>
                <p className="text-gray-500 text-sm">Casey will identify and evaluate business risks</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {!result ? (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Describe Your Business & Risk Landscape</h3>
              <textarea
                value={riskInfo}
                onChange={(e) => setRiskInfo(e.target.value)}
                placeholder="Describe your business and potential risks:

• Industry and business model
• Key operations and processes
• Technology dependencies
• Regulatory environment
• Known risks or concerns
• Recent incidents or near-misses

Example:
B2B SaaS company, 50 employees
- Process sensitive customer data (PII, payment info)
- AWS infrastructure, single region deployment
- 3 key vendors for critical operations
- SOC 2 certified, GDPR applicable
- Concerns about key person dependencies"
                className="w-full h-64 px-4 py-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-slate-500 text-gray-900"
              />
            </div>

            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Upload Risk Documents (Optional)</h3>
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer hover:border-slate-400 hover:bg-slate-50 transition-colors">
                <span className="text-2xl mb-2">📊</span>
                <p className="text-gray-600 text-sm">Risk registers, incident reports, audit findings</p>
                <input type="file" multiple className="hidden" onChange={handleFileSelect} accept=".pdf,.doc,.docx,.txt,.csv,.xlsx" />
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

            {error && <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>}

            <button
              onClick={runAssessment}
              disabled={isAnalyzing || (!riskInfo.trim() && files.length === 0)}
              className="w-full px-6 py-3 bg-slate-700 text-white font-semibold rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />Assessing Risks...</>
              ) : (
                <>⚠️ Run Risk Assessment</>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border p-6">
              <div className="grid gap-4 md:grid-cols-6">
                <div className={`p-4 rounded-lg ${RISK_LEVEL_COLORS[result.summary.overallRiskLevel].bg}`}>
                  <p className={`text-xl font-bold capitalize ${RISK_LEVEL_COLORS[result.summary.overallRiskLevel].text}`}>{result.summary.overallRiskLevel}</p>
                  <p className="text-xs text-gray-600">Overall Risk</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-gray-700">{result.summary.riskScore}</p>
                  <p className="text-xs text-gray-500">Risk Score</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-gray-700">{result.summary.totalRisks}</p>
                  <p className="text-xs text-gray-500">Total Risks</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-red-700">{result.summary.criticalRisks}</p>
                  <p className="text-xs text-red-600">Critical</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-orange-700">{result.summary.highRisks}</p>
                  <p className="text-xs text-orange-600">High</p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm font-medium text-yellow-800">{result.summary.topRiskArea}</p>
                  <p className="text-xs text-yellow-600">Top Risk Area</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border overflow-hidden">
              <div className="flex border-b">
                <button onClick={() => setActiveTab('risks')} className={`flex-1 px-4 py-3 text-sm font-medium ${activeTab === 'risks' ? 'bg-slate-50 text-slate-700 border-b-2 border-slate-500' : 'text-gray-500'}`}>
                  Risk Register ({result.risks.length})
                </button>
                <button onClick={() => setActiveTab('categories')} className={`flex-1 px-4 py-3 text-sm font-medium ${activeTab === 'categories' ? 'bg-slate-50 text-slate-700 border-b-2 border-slate-500' : 'text-gray-500'}`}>
                  By Category
                </button>
                <button onClick={() => setActiveTab('heatmap')} className={`flex-1 px-4 py-3 text-sm font-medium ${activeTab === 'heatmap' ? 'bg-slate-50 text-slate-700 border-b-2 border-slate-500' : 'text-gray-500'}`}>
                  Risk Matrix
                </button>
              </div>

              <div className="max-h-[500px] overflow-y-auto">
                {activeTab === 'risks' && (
                  <div>
                    <div className="p-3 bg-gray-50 border-b flex gap-2 flex-wrap">
                      <button onClick={() => setSelectedCategory('all')} className={`px-3 py-1 text-xs rounded-full ${selectedCategory === 'all' ? 'bg-slate-700 text-white' : 'bg-white border'}`}>All</button>
                      {Object.keys(CATEGORY_ICONS).map(cat => (
                        <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-3 py-1 text-xs rounded-full capitalize ${selectedCategory === cat ? 'bg-slate-700 text-white' : 'bg-white border'}`}>
                          {CATEGORY_ICONS[cat]} {cat}
                        </button>
                      ))}
                    </div>
                    <div className="divide-y">
                      {filteredRisks.map((risk) => {
                        const levelColors = RISK_LEVEL_COLORS[risk.riskLevel];
                        return (
                          <div key={risk.id} className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xl">{CATEGORY_ICONS[risk.category]}</span>
                                <h4 className="font-medium text-gray-900">{risk.name}</h4>
                              </div>
                              <span className={`px-2 py-1 text-xs rounded-full ${levelColors.bg} ${levelColors.text}`}>{risk.riskLevel} ({risk.riskScore})</span>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{risk.description}</p>
                            <div className="grid gap-2 md:grid-cols-2 text-sm mb-3">
                              <div><span className="text-gray-500">Likelihood:</span> <span className="capitalize">{risk.likelihood}</span></div>
                              <div><span className="text-gray-500">Impact:</span> <span className="capitalize">{risk.impact}</span></div>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-lg">
                              <p className="text-sm text-slate-800"><strong>Mitigation:</strong> {risk.mitigation}</p>
                              <p className="text-xs text-slate-600 mt-1">Owner: {risk.owner} • Timeline: {risk.timeline}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {activeTab === 'categories' && (
                  <div className="divide-y">
                    {result.categories.map((cat, index) => (
                      <div key={index} className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{CATEGORY_ICONS[cat.category] || '📊'}</span>
                            <h4 className="font-medium text-gray-900 capitalize">{cat.category}</h4>
                          </div>
                          <span className="text-lg font-bold text-gray-700">{cat.riskCount} risks</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="text-center p-2 bg-gray-50 rounded"><p className="font-bold text-gray-700">{cat.avgScore.toFixed(1)}</p><p className="text-xs text-gray-500">Avg Score</p></div>
                          <div className="text-center p-2 bg-red-50 rounded"><p className="font-bold text-red-700">{cat.criticalCount}</p><p className="text-xs text-red-600">Critical</p></div>
                          <div className="p-2 bg-yellow-50 rounded"><p className="text-xs text-yellow-600">Top Risk</p><p className="text-sm text-yellow-800">{cat.topRisk}</p></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'heatmap' && (
                  <div className="p-4">
                    <table className="w-full">
                      <thead>
                        <tr>
                          <th className="p-2 text-xs text-gray-500"></th>
                          {['negligible', 'minor', 'moderate', 'major', 'severe'].map(impact => (
                            <th key={impact} className="p-2 text-xs text-gray-500 capitalize">{impact}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {['almost-certain', 'likely', 'possible', 'unlikely', 'rare'].map(likelihood => (
                          <tr key={likelihood}>
                            <td className="p-2 text-xs text-gray-500 capitalize">{likelihood}</td>
                            {['negligible', 'minor', 'moderate', 'major', 'severe'].map(impact => {
                              const count = result.heatmapData.find(d => d.likelihood === likelihood && d.impact === impact)?.count || 0;
                              return (
                                <td key={impact} className="p-1">
                                  <div className={`w-12 h-12 rounded flex items-center justify-center text-white font-bold ${count > 0 ? getHeatmapColor(likelihood, impact) : 'bg-gray-100 text-gray-400'}`}>{count || '-'}</div>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="flex justify-center gap-4 mt-4 text-xs">
                      <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-500 rounded"></span> Low</span>
                      <span className="flex items-center gap-1"><span className="w-3 h-3 bg-yellow-500 rounded"></span> Medium</span>
                      <span className="flex items-center gap-1"><span className="w-3 h-3 bg-orange-500 rounded"></span> High</span>
                      <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-500 rounded"></span> Critical</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-red-50 rounded-xl border border-red-200 p-6">
              <h3 className="font-semibold text-red-800 mb-3">🚨 Immediate Mitigation Priorities</h3>
              <ol className="space-y-2">
                {result.mitigationPriorities.map((priority, index) => (
                  <li key={index} className="flex items-start gap-2 text-red-700"><span className="font-bold">{index + 1}.</span><span>{priority}</span></li>
                ))}
              </ol>
            </div>

            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">🎯 Risk Management Recommendations</h3>
              <ol className="space-y-3">
                {result.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-slate-100 text-slate-700 rounded-full flex items-center justify-center text-sm font-bold">{index + 1}</span>
                    <p className="text-gray-700">{rec}</p>
                  </li>
                ))}
              </ol>
            </div>

            <div className="flex gap-4">
              <button onClick={clearAll} className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">New Assessment</button>
              <Link href="/dashboard" className="px-6 py-3 bg-slate-700 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors">Discuss with Casey</Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
