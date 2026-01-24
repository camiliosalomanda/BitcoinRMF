'use client';

/**
 * CHRO Org Structure Review Skill
 * Analyze organizational structure and reporting relationships
 */

import React, { useState } from 'react';
import Link from 'next/link';

interface OrgUnit {
  name: string;
  head: string;
  headcount: number;
  directReports: number;
  layers: number;
  spanOfControl: number;
  status: 'optimal' | 'narrow' | 'wide' | 'deep';
  issues: string[];
}

interface OrgIssue {
  id: string;
  category: 'span' | 'layers' | 'silos' | 'gaps' | 'duplication' | 'alignment';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  affectedAreas: string[];
  impact: string;
  recommendation: string;
}

interface OrgMetric {
  name: string;
  value: string;
  benchmark: string;
  status: 'good' | 'warning' | 'poor';
  insight: string;
}

interface OrgAnalysis {
  summary: {
    totalHeadcount: number;
    totalDepartments: number;
    avgSpanOfControl: number;
    orgLayers: number;
    healthScore: number;
    topConcern: string;
  };
  units: OrgUnit[];
  metrics: OrgMetric[];
  issues: OrgIssue[];
  strengths: string[];
  recommendations: string[];
}

const CATEGORY_ICONS = {
  span: '↔️',
  layers: '📊',
  silos: '🧱',
  gaps: '🕳️',
  duplication: '👥',
  alignment: '🎯',
};

const SEVERITY_COLORS = {
  critical: { bg: 'bg-red-100', text: 'text-red-700' },
  high: { bg: 'bg-orange-100', text: 'text-orange-700' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  low: { bg: 'bg-blue-100', text: 'text-blue-700' },
};

const STATUS_COLORS = {
  optimal: { bg: 'bg-green-100', text: 'text-green-700' },
  narrow: { bg: 'bg-blue-100', text: 'text-blue-700' },
  wide: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  deep: { bg: 'bg-orange-100', text: 'text-orange-700' },
};

export default function OrgReviewPage() {
  const [orgInfo, setOrgInfo] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<OrgAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'units' | 'metrics' | 'issues'>('units');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const runAnalysis = async () => {
    if (!orgInfo.trim() && files.length === 0) {
      setError('Please provide org structure information or upload files');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));
      formData.append('orgInfo', orgInfo);

      const response = await fetch('/api/skills/chro/org-review', {
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
      setError(err instanceof Error ? err.message : 'Failed to analyze org structure');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearAll = () => {
    setOrgInfo('');
    setFiles([]);
    setResult(null);
    setError(null);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
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
                <span className="text-2xl">🏢</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Org Structure Review</h1>
                <p className="text-gray-500 text-sm">Taylor will analyze your organizational structure</p>
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
              <h3 className="font-semibold text-gray-900 mb-4">Describe Your Organization</h3>
              <textarea
                value={orgInfo}
                onChange={(e) => setOrgInfo(e.target.value)}
                placeholder="Describe your organizational structure:

• Total company headcount
• Main departments/teams and their sizes
• Reporting structure (who reports to whom)
• Number of management layers
• Any known structural issues

Example:
Company: 150 employees
- CEO
  - CTO (Engineering: 45 people)
    - 4 Engineering Managers (8-12 reports each)
    - 1 QA Lead (5 reports)
  - CFO (Finance: 12 people)
    - 3 direct reports
  - CMO (Marketing: 25 people)
    - 5 direct reports, some with 2-3 people under them
  - COO (Operations: 35 people)
    - 4 direct reports
  - CHRO (HR: 8 people)
    - 2 direct reports

Issues: Engineering feels siloed, unclear career paths"
                className="w-full h-64 px-4 py-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-900"
              />
            </div>

            {/* File Upload */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Upload Org Charts (Optional)</h3>
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer hover:border-pink-400 hover:bg-pink-50 transition-colors">
                <span className="text-2xl mb-2">📊</span>
                <p className="text-gray-600 text-sm">Org charts, headcount reports, structure documents</p>
                <input type="file" multiple className="hidden" onChange={handleFileSelect} accept=".csv,.xlsx,.xls,.pdf,.txt,.doc,.docx" />
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
              disabled={isAnalyzing || (!orgInfo.trim() && files.length === 0)}
              className="w-full px-6 py-3 bg-pink-600 text-white font-semibold rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Analyzing Structure...
                </>
              ) : (
                <>🏢 Analyze Org Structure</>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-white rounded-xl border p-6">
              <div className="grid gap-4 md:grid-cols-6">
                <div className="p-4 bg-pink-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-pink-700">{result.summary.totalHeadcount}</p>
                  <p className="text-xs text-pink-600">Headcount</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-gray-700">{result.summary.totalDepartments}</p>
                  <p className="text-xs text-gray-500">Departments</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-gray-700">{result.summary.avgSpanOfControl}</p>
                  <p className="text-xs text-gray-500">Avg Span</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-gray-700">{result.summary.orgLayers}</p>
                  <p className="text-xs text-gray-500">Layers</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <p className={`text-2xl font-bold ${getScoreColor(result.summary.healthScore)}`}>{result.summary.healthScore}</p>
                  <p className="text-xs text-gray-500">Health Score</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="text-sm font-medium text-red-700">{result.summary.topConcern}</p>
                  <p className="text-xs text-red-600">Top Concern</p>
                </div>
              </div>
            </div>

            {/* Strengths */}
            {result.strengths.length > 0 && (
              <div className="bg-green-50 rounded-xl border border-green-200 p-6">
                <h3 className="font-semibold text-green-800 mb-3">✅ Organizational Strengths</h3>
                <ul className="space-y-2">
                  {result.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2 text-green-700">
                      <span>•</span><span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tabs */}
            <div className="bg-white rounded-xl border overflow-hidden">
              <div className="flex border-b">
                <button
                  onClick={() => setActiveTab('units')}
                  className={`flex-1 px-4 py-3 text-sm font-medium ${activeTab === 'units' ? 'bg-pink-50 text-pink-700 border-b-2 border-pink-500' : 'text-gray-500'}`}
                >
                  Org Units ({result.units.length})
                </button>
                <button
                  onClick={() => setActiveTab('metrics')}
                  className={`flex-1 px-4 py-3 text-sm font-medium ${activeTab === 'metrics' ? 'bg-pink-50 text-pink-700 border-b-2 border-pink-500' : 'text-gray-500'}`}
                >
                  Metrics ({result.metrics.length})
                </button>
                <button
                  onClick={() => setActiveTab('issues')}
                  className={`flex-1 px-4 py-3 text-sm font-medium ${activeTab === 'issues' ? 'bg-pink-50 text-pink-700 border-b-2 border-pink-500' : 'text-gray-500'}`}
                >
                  Issues ({result.issues.length})
                </button>
              </div>

              <div className="max-h-[500px] overflow-y-auto">
                {activeTab === 'units' && (
                  <div className="divide-y">
                    {result.units.map((unit, index) => {
                      const status = STATUS_COLORS[unit.status];
                      return (
                        <div key={index} className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="font-medium text-gray-900">{unit.name}</h4>
                              <p className="text-sm text-gray-500">Led by: {unit.head}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm ${status.bg} ${status.text}`}>
                              {unit.status}
                            </span>
                          </div>
                          <div className="grid grid-cols-4 gap-2 mb-3">
                            <div className="text-center p-2 bg-gray-50 rounded">
                              <p className="font-bold text-gray-900">{unit.headcount}</p>
                              <p className="text-xs text-gray-500">Headcount</p>
                            </div>
                            <div className="text-center p-2 bg-gray-50 rounded">
                              <p className="font-bold text-gray-900">{unit.directReports}</p>
                              <p className="text-xs text-gray-500">Direct Reports</p>
                            </div>
                            <div className="text-center p-2 bg-gray-50 rounded">
                              <p className="font-bold text-gray-900">{unit.layers}</p>
                              <p className="text-xs text-gray-500">Layers</p>
                            </div>
                            <div className="text-center p-2 bg-gray-50 rounded">
                              <p className="font-bold text-gray-900">{unit.spanOfControl}</p>
                              <p className="text-xs text-gray-500">Span</p>
                            </div>
                          </div>
                          {unit.issues.length > 0 && (
                            <div className="p-3 bg-yellow-50 rounded-lg">
                              <p className="text-sm text-yellow-800">⚠️ {unit.issues.join(', ')}</p>
                            </div>
                          )}
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
                          <div>
                            <span className="text-2xl font-bold text-gray-900">{metric.value}</span>
                            <span className="text-sm text-gray-500 ml-2">vs benchmark: {metric.benchmark}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">{metric.insight}</p>
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
                            <span className="text-xl">{CATEGORY_ICONS[issue.category]}</span>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-gray-900">{issue.title}</h4>
                                <span className={`px-2 py-0.5 text-xs rounded-full ${colors.bg} ${colors.text}`}>{issue.severity}</span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{issue.description}</p>
                              <p className="text-xs text-gray-500 mb-2">Affected: {issue.affectedAreas.join(', ')}</p>
                              <p className="text-sm text-orange-700 mb-2"><strong>Impact:</strong> {issue.impact}</p>
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
