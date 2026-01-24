'use client';

/**
 * COO SOP Analysis Skill
 * Review standard operating procedures for completeness and efficiency
 */

import React, { useState } from 'react';
import Link from 'next/link';

interface SOPDocument {
  name: string;
  department: string;
  lastUpdated: string;
  completenessScore: number;
  clarityScore: number;
  complianceScore: number;
  status: 'current' | 'needs-update' | 'outdated' | 'missing-sections';
  issues: string[];
}

interface SOPIssue {
  id: string;
  sopName: string;
  category: 'completeness' | 'clarity' | 'compliance' | 'efficiency' | 'safety' | 'training';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  section: string;
  recommendation: string;
}

interface SOPGap {
  area: string;
  description: string;
  risk: 'high' | 'medium' | 'low';
  suggestedSOP: string;
}

interface SOPAnalysis {
  summary: {
    totalSOPs: number;
    averageScore: number;
    needsUpdate: number;
    complianceStatus: 'compliant' | 'at-risk' | 'non-compliant';
    topPriority: string;
  };
  documents: SOPDocument[];
  issues: SOPIssue[];
  gaps: SOPGap[];
  bestPractices: string[];
  recommendations: string[];
}

const CATEGORY_ICONS = {
  completeness: '📋',
  clarity: '👁️',
  compliance: '⚖️',
  efficiency: '⚡',
  safety: '🛡️',
  training: '📚',
};

const SEVERITY_COLORS = {
  critical: { bg: 'bg-red-100', text: 'text-red-700' },
  high: { bg: 'bg-orange-100', text: 'text-orange-700' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  low: { bg: 'bg-blue-100', text: 'text-blue-700' },
};

const STATUS_BADGES = {
  current: { bg: 'bg-green-100', text: 'text-green-700', label: 'Current' },
  'needs-update': { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Needs Update' },
  outdated: { bg: 'bg-red-100', text: 'text-red-700', label: 'Outdated' },
  'missing-sections': { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Incomplete' },
};

export default function SOPAnalysisPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [sopDescription, setSOPDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<SOPAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'documents' | 'issues' | 'gaps'>('documents');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const runAnalysis = async () => {
    if (files.length === 0 && !sopDescription.trim()) {
      setError('Please upload SOP documents or describe your procedures');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));
      formData.append('sopDescription', sopDescription);

      const response = await fetch('/api/skills/coo/sop-analysis', {
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
      setError(err instanceof Error ? err.message : 'Failed to analyze SOPs');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearAll = () => {
    setFiles([]);
    setSOPDescription('');
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
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📋</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">SOP Analysis</h1>
                <p className="text-gray-500 text-sm">Morgan will review your standard operating procedures</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {!result ? (
          <div className="space-y-6">
            {/* File Upload */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Upload SOP Documents</h3>
              <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl cursor-pointer hover:border-amber-400 hover:bg-amber-50 transition-colors">
                <span className="text-3xl mb-2">📄</span>
                <p className="text-gray-600">Drop your SOP documents here</p>
                <p className="text-gray-400 text-sm mt-1">PDF, Word, Markdown, or text files</p>
                <input type="file" multiple className="hidden" onChange={handleFileSelect} accept=".pdf,.doc,.docx,.txt,.md" />
              </label>
              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  {files.map((file, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm">📄 {file.name}</span>
                      <button onClick={() => setFiles(files.filter((_, idx) => idx !== i))} className="text-gray-400 hover:text-red-500">✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Or Describe Your Procedures</h3>
              <textarea
                value={sopDescription}
                onChange={(e) => setSOPDescription(e.target.value)}
                placeholder="Describe your standard operating procedures:

• What processes do you have documented?
• Which departments/functions do they cover?
• When were they last updated?
• Are there any known gaps or issues?

Example:
We have SOPs for:
- Customer onboarding (last updated 6 months ago)
- Order fulfillment process
- Employee onboarding (needs updating)
- IT incident response

We're missing SOPs for refund handling and vendor management."
                className="w-full h-48 px-4 py-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-900"
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
            )}

            <button
              onClick={runAnalysis}
              disabled={isAnalyzing || (files.length === 0 && !sopDescription.trim())}
              className="w-full px-6 py-3 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Analyzing SOPs...
                </>
              ) : (
                <>📋 Analyze SOPs</>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-white rounded-xl border p-6">
              <div className="grid gap-4 md:grid-cols-5">
                <div className="p-4 bg-amber-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-amber-700">{result.summary.totalSOPs}</p>
                  <p className="text-sm text-amber-600">SOPs Analyzed</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <p className={`text-2xl font-bold ${getScoreColor(result.summary.averageScore)}`}>{result.summary.averageScore}</p>
                  <p className="text-sm text-gray-500">Average Score</p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-yellow-700">{result.summary.needsUpdate}</p>
                  <p className="text-sm text-yellow-600">Need Updates</p>
                </div>
                <div className="p-4 rounded-lg text-center" style={{
                  backgroundColor: result.summary.complianceStatus === 'compliant' ? '#dcfce7' : 
                    result.summary.complianceStatus === 'at-risk' ? '#fef9c3' : '#fee2e2'
                }}>
                  <p className={`text-lg font-bold capitalize ${
                    result.summary.complianceStatus === 'compliant' ? 'text-green-700' :
                    result.summary.complianceStatus === 'at-risk' ? 'text-yellow-700' : 'text-red-700'
                  }`}>{result.summary.complianceStatus.replace('-', ' ')}</p>
                  <p className="text-sm text-gray-600">Compliance</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="text-sm font-medium text-red-700">{result.summary.topPriority}</p>
                  <p className="text-xs text-red-600">Top Priority</p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl border overflow-hidden">
              <div className="flex border-b">
                <button
                  onClick={() => setActiveTab('documents')}
                  className={`flex-1 px-4 py-3 text-sm font-medium ${activeTab === 'documents' ? 'bg-amber-50 text-amber-700 border-b-2 border-amber-500' : 'text-gray-500'}`}
                >
                  Documents ({result.documents.length})
                </button>
                <button
                  onClick={() => setActiveTab('issues')}
                  className={`flex-1 px-4 py-3 text-sm font-medium ${activeTab === 'issues' ? 'bg-amber-50 text-amber-700 border-b-2 border-amber-500' : 'text-gray-500'}`}
                >
                  Issues ({result.issues.length})
                </button>
                <button
                  onClick={() => setActiveTab('gaps')}
                  className={`flex-1 px-4 py-3 text-sm font-medium ${activeTab === 'gaps' ? 'bg-amber-50 text-amber-700 border-b-2 border-amber-500' : 'text-gray-500'}`}
                >
                  Gaps ({result.gaps.length})
                </button>
              </div>

              <div className="max-h-[500px] overflow-y-auto">
                {activeTab === 'documents' && (
                  <div className="divide-y">
                    {result.documents.map((doc, index) => {
                      const status = STATUS_BADGES[doc.status];
                      return (
                        <div key={index} className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-medium text-gray-900">{doc.name}</h4>
                              <p className="text-sm text-gray-500">{doc.department} • Updated: {doc.lastUpdated}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm ${status.bg} ${status.text}`}>
                              {status.label}
                            </span>
                          </div>
                          <div className="grid gap-3 md:grid-cols-3 mb-3">
                            <div className="text-center p-2 bg-gray-50 rounded">
                              <p className={`font-bold ${getScoreColor(doc.completenessScore)}`}>{doc.completenessScore}</p>
                              <p className="text-xs text-gray-500">Completeness</p>
                            </div>
                            <div className="text-center p-2 bg-gray-50 rounded">
                              <p className={`font-bold ${getScoreColor(doc.clarityScore)}`}>{doc.clarityScore}</p>
                              <p className="text-xs text-gray-500">Clarity</p>
                            </div>
                            <div className="text-center p-2 bg-gray-50 rounded">
                              <p className={`font-bold ${getScoreColor(doc.complianceScore)}`}>{doc.complianceScore}</p>
                              <p className="text-xs text-gray-500">Compliance</p>
                            </div>
                          </div>
                          {doc.issues.length > 0 && (
                            <div className="p-3 bg-yellow-50 rounded-lg">
                              <p className="text-sm text-yellow-800">
                                <strong>Issues:</strong> {doc.issues.join(', ')}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
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
                              <p className="text-sm text-gray-500 mb-2">SOP: {issue.sopName} • Section: {issue.section}</p>
                              <p className="text-sm text-gray-600 mb-2">{issue.description}</p>
                              <div className="p-3 bg-amber-50 rounded-lg">
                                <p className="text-sm text-amber-800">💡 {issue.recommendation}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {activeTab === 'gaps' && (
                  <div className="divide-y">
                    {result.gaps.map((gap, index) => (
                      <div key={index} className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{gap.area}</h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            gap.risk === 'high' ? 'bg-red-100 text-red-700' :
                            gap.risk === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {gap.risk} risk
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{gap.description}</p>
                        <div className="p-3 bg-green-50 rounded-lg">
                          <p className="text-sm text-green-800">📝 <strong>Suggested SOP:</strong> {gap.suggestedSOP}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Best Practices */}
            <div className="bg-green-50 rounded-xl border border-green-200 p-6">
              <h3 className="font-semibold text-green-800 mb-3">✅ Best Practices Identified</h3>
              <ul className="space-y-2">
                {result.bestPractices.map((practice, index) => (
                  <li key={index} className="flex items-start gap-2 text-green-700">
                    <span>•</span><span>{practice}</span>
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
                    <span className="flex-shrink-0 w-6 h-6 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-sm font-bold">{index + 1}</span>
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
              <Link href="/dashboard" className="px-6 py-3 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition-colors">
                Discuss with Morgan
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
