'use client';

/**
 * CHRO Compensation Analysis Skill
 * Benchmark compensation against market rates
 */

import React, { useState } from 'react';
import Link from 'next/link';

interface RoleCompensation {
  title: string;
  level: string;
  currentSalary: string;
  marketMin: string;
  marketMid: string;
  marketMax: string;
  percentile: number;
  status: 'below' | 'competitive' | 'above';
  recommendation: string;
}

interface CompIssue {
  id: string;
  category: 'equity' | 'market' | 'structure' | 'compliance' | 'retention';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  affectedRoles: string[];
  description: string;
  financialImpact: string;
  recommendation: string;
}

interface CompMetric {
  name: string;
  value: string;
  benchmark: string;
  status: 'good' | 'warning' | 'poor';
  insight: string;
}

interface CompAnalysis {
  summary: {
    rolesAnalyzed: number;
    avgMarketPosition: number;
    belowMarket: number;
    atRisk: number;
    totalAdjustmentNeeded: string;
    topPriority: string;
  };
  roles: RoleCompensation[];
  issues: CompIssue[];
  metrics: CompMetric[];
  equityAnalysis: string[];
  recommendations: string[];
}

const CATEGORY_ICONS = {
  equity: '⚖️',
  market: '📊',
  structure: '🏗️',
  compliance: '📋',
  retention: '🎯',
};

const SEVERITY_COLORS = {
  critical: { bg: 'bg-red-100', text: 'text-red-700' },
  high: { bg: 'bg-orange-100', text: 'text-orange-700' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  low: { bg: 'bg-blue-100', text: 'text-blue-700' },
};

const STATUS_COLORS = {
  below: { bg: 'bg-red-100', text: 'text-red-700', label: 'Below Market' },
  competitive: { bg: 'bg-green-100', text: 'text-green-700', label: 'Competitive' },
  above: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Above Market' },
};

export default function CompensationAnalysisPage() {
  const [compInfo, setCompInfo] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<CompAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'roles' | 'issues' | 'metrics'>('roles');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const runAnalysis = async () => {
    if (!compInfo.trim() && files.length === 0) {
      setError('Please provide compensation data or upload files');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));
      formData.append('compInfo', compInfo);

      const response = await fetch('/api/skills/chro/compensation-analysis', {
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
      setError(err instanceof Error ? err.message : 'Failed to analyze compensation');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearAll = () => {
    setCompInfo('');
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
              <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">💳</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Compensation Analysis</h1>
                <p className="text-gray-500 text-sm">Taylor will benchmark your compensation against market rates</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {!result ? (
          <div className="space-y-6">
            {/* Input */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Describe Your Compensation Structure</h3>
              <textarea
                value={compInfo}
                onChange={(e) => setCompInfo(e.target.value)}
                placeholder="Provide your compensation data:

• Role titles and levels
• Current salaries (or ranges)
• Location(s)
• Industry
• Company stage/size

Example:
Industry: B2B SaaS, Series B, San Francisco
Team: 50 employees

Engineering:
- Senior Software Engineer: $180,000
- Staff Engineer: $220,000
- Engineering Manager: $200,000

Product:
- Product Manager: $160,000
- Senior PM: $185,000

Sales:
- Account Executive: $75,000 base + commission
- Sales Manager: $120,000 base

We want to be at 75th percentile for engineering roles."
                className="w-full h-64 px-4 py-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-900"
              />
            </div>

            {/* File Upload */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Upload Compensation Data (Optional)</h3>
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer hover:border-pink-400 hover:bg-pink-50 transition-colors">
                <span className="text-2xl mb-2">📊</span>
                <p className="text-gray-600 text-sm">Salary spreadsheets, comp bands, market data</p>
                <input type="file" multiple className="hidden" onChange={handleFileSelect} accept=".csv,.xlsx,.xls,.pdf,.txt" />
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
              disabled={isAnalyzing || (!compInfo.trim() && files.length === 0)}
              className="w-full px-6 py-3 bg-pink-600 text-white font-semibold rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Analyzing Compensation...
                </>
              ) : (
                <>💳 Analyze Compensation</>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-white rounded-xl border p-6">
              <div className="grid gap-4 md:grid-cols-5">
                <div className="p-4 bg-pink-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-pink-700">{result.summary.rolesAnalyzed}</p>
                  <p className="text-xs text-pink-600">Roles Analyzed</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-gray-700">{result.summary.avgMarketPosition}%</p>
                  <p className="text-xs text-gray-500">Avg Market Position</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-red-700">{result.summary.belowMarket}</p>
                  <p className="text-xs text-red-600">Below Market</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-orange-700">{result.summary.atRisk}</p>
                  <p className="text-xs text-orange-600">At Retention Risk</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-lg font-bold text-blue-700">{result.summary.totalAdjustmentNeeded}</p>
                  <p className="text-xs text-blue-600">Est. Adjustment</p>
                </div>
              </div>
            </div>

            {/* Equity Analysis */}
            {result.equityAnalysis.length > 0 && (
              <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-6">
                <h3 className="font-semibold text-yellow-800 mb-3">⚖️ Pay Equity Findings</h3>
                <ul className="space-y-2">
                  {result.equityAnalysis.map((finding, index) => (
                    <li key={index} className="flex items-start gap-2 text-yellow-700">
                      <span>•</span><span>{finding}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tabs */}
            <div className="bg-white rounded-xl border overflow-hidden">
              <div className="flex border-b">
                <button
                  onClick={() => setActiveTab('roles')}
                  className={`flex-1 px-4 py-3 text-sm font-medium ${activeTab === 'roles' ? 'bg-pink-50 text-pink-700 border-b-2 border-pink-500' : 'text-gray-500'}`}
                >
                  Roles ({result.roles.length})
                </button>
                <button
                  onClick={() => setActiveTab('issues')}
                  className={`flex-1 px-4 py-3 text-sm font-medium ${activeTab === 'issues' ? 'bg-pink-50 text-pink-700 border-b-2 border-pink-500' : 'text-gray-500'}`}
                >
                  Issues ({result.issues.length})
                </button>
                <button
                  onClick={() => setActiveTab('metrics')}
                  className={`flex-1 px-4 py-3 text-sm font-medium ${activeTab === 'metrics' ? 'bg-pink-50 text-pink-700 border-b-2 border-pink-500' : 'text-gray-500'}`}
                >
                  Metrics
                </button>
              </div>

              <div className="max-h-[500px] overflow-y-auto">
                {activeTab === 'roles' && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Current</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Market Range</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Percentile</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {result.roles.map((role, index) => {
                          const status = STATUS_COLORS[role.status];
                          return (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-4 py-3">
                                <p className="font-medium text-gray-900">{role.title}</p>
                                <p className="text-xs text-gray-500">{role.level}</p>
                              </td>
                              <td className="px-4 py-3 text-right font-medium text-gray-900">{role.currentSalary}</td>
                              <td className="px-4 py-3 text-right text-sm text-gray-600">
                                {role.marketMin} - {role.marketMax}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className={`font-bold ${
                                  role.percentile < 25 ? 'text-red-600' :
                                  role.percentile < 50 ? 'text-orange-600' :
                                  role.percentile < 75 ? 'text-green-600' :
                                  'text-blue-600'
                                }`}>
                                  {role.percentile}th
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className={`px-2 py-1 text-xs rounded-full ${status.bg} ${status.text}`}>
                                  {status.label}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {activeTab === 'issues' && (
                  <div className="divide-y">
                    {result.issues.map((issue) => {
                      const colors = SEVERITY_COLORS[issue.severity];
                      return (
                        <div key={issue.id} className="p-4">
                          <div className="flex items-start gap-3">
                            <span className="text-xl">{CATEGORY_ICONS[issue.category]}</span>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-gray-900">{issue.title}</h4>
                                <span className={`px-2 py-0.5 text-xs rounded-full ${colors.bg} ${colors.text}`}>{issue.severity}</span>
                              </div>
                              <p className="text-xs text-gray-500 mb-2">Affects: {issue.affectedRoles.join(', ')}</p>
                              <p className="text-sm text-gray-600 mb-2">{issue.description}</p>
                              <p className="text-sm text-orange-700 mb-2"><strong>Financial Impact:</strong> {issue.financialImpact}</p>
                              <div className="p-3 bg-pink-50 rounded-lg">
                                <p className="text-sm text-pink-800">💡 {issue.recommendation}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {activeTab === 'metrics' && (
                  <div className="divide-y">
                    {result.metrics.map((metric, index) => (
                      <div key={index} className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{metric.name}</h4>
                          <span className={`px-3 py-1 rounded-full text-sm ${
                            metric.status === 'good' ? 'bg-green-100 text-green-700' :
                            metric.status === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {metric.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mb-2">
                          <span className="text-2xl font-bold text-gray-900">{metric.value}</span>
                          <span className="text-sm text-gray-500">Benchmark: {metric.benchmark}</span>
                        </div>
                        <p className="text-sm text-gray-600">{metric.insight}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">🎯 Priority Actions</h3>
              <ol className="space-y-3">
                {result.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-pink-100 text-pink-700 rounded-full flex items-center justify-center text-sm font-bold">{index + 1}</span>
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
              <Link href="/dashboard" className="px-6 py-3 bg-pink-600 text-white font-medium rounded-lg hover:bg-pink-700 transition-colors">
                Discuss with Taylor
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
