'use client';

/**
 * CCO Contract Review Skill
 * Review contracts for risks, terms, and compliance issues
 */

import React, { useState } from 'react';
import Link from 'next/link';

interface ContractClause {
  name: string;
  section: string;
  status: 'favorable' | 'standard' | 'unfavorable' | 'missing' | 'risky';
  summary: string;
  concern: string;
  suggestion: string;
}

interface ContractRisk {
  id: string;
  category: 'liability' | 'termination' | 'ip' | 'payment' | 'compliance' | 'confidentiality' | 'indemnity';
  severity: 'critical' | 'high' | 'medium' | 'low';
  clause: string;
  issue: string;
  potentialImpact: string;
  recommendation: string;
  negotiationLeverage: 'high' | 'medium' | 'low';
}

interface ContractReview {
  summary: {
    contractType: string;
    parties: string;
    overallRisk: 'low' | 'medium' | 'high' | 'critical';
    favorability: number;
    criticalIssues: number;
    missingClauses: number;
    recommendation: 'sign' | 'negotiate' | 'reject' | 'legal-review';
  };
  keyTerms: {
    term: string;
    value: string;
    assessment: string;
  }[];
  clauses: ContractClause[];
  risks: ContractRisk[];
  missingClauses: string[];
  negotiationPoints: string[];
  recommendations: string[];
}

const STATUS_COLORS = {
  favorable: { bg: 'bg-green-100', text: 'text-green-700' },
  standard: { bg: 'bg-blue-100', text: 'text-blue-700' },
  unfavorable: { bg: 'bg-orange-100', text: 'text-orange-700' },
  missing: { bg: 'bg-gray-100', text: 'text-gray-700' },
  risky: { bg: 'bg-red-100', text: 'text-red-700' },
};

const CATEGORY_ICONS = {
  liability: '⚠️',
  termination: '🚪',
  ip: '💡',
  payment: '💰',
  compliance: '📋',
  confidentiality: '🔒',
  indemnity: '🛡️',
};

const SEVERITY_COLORS = {
  critical: { bg: 'bg-red-100', text: 'text-red-700' },
  high: { bg: 'bg-orange-100', text: 'text-orange-700' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  low: { bg: 'bg-blue-100', text: 'text-blue-700' },
};

export default function ContractReviewPage() {
  const [contractText, setContractText] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [context, setContext] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ContractReview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'clauses' | 'risks' | 'negotiate'>('clauses');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const runReview = async () => {
    if (!contractText.trim() && files.length === 0) {
      setError('Please provide contract text or upload a document');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));
      formData.append('contractText', contractText);
      formData.append('context', context);

      const response = await fetch('/api/skills/cco/contract-review', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Review failed');
      }

      const data = await response.json();
      setResult(data.review);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to review contract');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearAll = () => {
    setContractText('');
    setFiles([]);
    setContext('');
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
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📜</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Contract Review</h1>
                <p className="text-gray-500 text-sm">Casey will review contracts for risks and compliance</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {!result ? (
          <div className="space-y-6">
            {/* Contract Input */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Paste Contract Text</h3>
              <textarea
                value={contractText}
                onChange={(e) => setContractText(e.target.value)}
                placeholder="Paste the full contract or key sections here for review..."
                className="w-full h-64 px-4 py-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-slate-500 text-gray-900 font-mono text-sm"
              />
            </div>

            {/* File Upload */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Or Upload Contract Document</h3>
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer hover:border-slate-400 hover:bg-slate-50 transition-colors">
                <span className="text-2xl mb-2">📄</span>
                <p className="text-gray-600 text-sm">PDF, Word, or text files</p>
                <input type="file" multiple className="hidden" onChange={handleFileSelect} accept=".pdf,.doc,.docx,.txt" />
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

            {/* Context */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Additional Context (Optional)</h3>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Provide context about this contract:
• What type of contract is this? (vendor, customer, employment, NDA, etc.)
• What are your main concerns?
• Any specific terms you want analyzed?
• Your bargaining position"
                className="w-full h-24 px-4 py-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-slate-500 text-gray-900"
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
            )}

            <button
              onClick={runReview}
              disabled={isAnalyzing || (!contractText.trim() && files.length === 0)}
              className="w-full px-6 py-3 bg-slate-700 text-white font-semibold rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Reviewing Contract...
                </>
              ) : (
                <>📜 Review Contract</>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-white rounded-xl border p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{result.summary.contractType}</h3>
                  <p className="text-sm text-gray-500">{result.summary.parties}</p>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                  result.summary.recommendation === 'sign' ? 'bg-green-100 text-green-700' :
                  result.summary.recommendation === 'negotiate' ? 'bg-yellow-100 text-yellow-700' :
                  result.summary.recommendation === 'legal-review' ? 'bg-blue-100 text-blue-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {result.summary.recommendation === 'sign' ? '✅ OK to Sign' :
                   result.summary.recommendation === 'negotiate' ? '⚠️ Negotiate First' :
                   result.summary.recommendation === 'legal-review' ? '📋 Legal Review Needed' :
                   '❌ Recommend Reject'}
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-4">
                <div className={`p-4 rounded-lg ${
                  result.summary.overallRisk === 'low' ? 'bg-green-50' :
                  result.summary.overallRisk === 'medium' ? 'bg-yellow-50' :
                  result.summary.overallRisk === 'high' ? 'bg-orange-50' : 'bg-red-50'
                }`}>
                  <p className={`text-lg font-bold capitalize ${
                    result.summary.overallRisk === 'low' ? 'text-green-700' :
                    result.summary.overallRisk === 'medium' ? 'text-yellow-700' :
                    result.summary.overallRisk === 'high' ? 'text-orange-700' : 'text-red-700'
                  }`}>{result.summary.overallRisk}</p>
                  <p className="text-xs text-gray-600">Overall Risk</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <p className={`text-2xl font-bold ${
                    result.summary.favorability >= 70 ? 'text-green-600' :
                    result.summary.favorability >= 50 ? 'text-yellow-600' : 'text-red-600'
                  }`}>{result.summary.favorability}%</p>
                  <p className="text-xs text-gray-500">Favorability</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-red-700">{result.summary.criticalIssues}</p>
                  <p className="text-xs text-red-600">Critical Issues</p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-yellow-700">{result.summary.missingClauses}</p>
                  <p className="text-xs text-yellow-600">Missing Clauses</p>
                </div>
              </div>
            </div>

            {/* Key Terms */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Key Terms</h3>
              <div className="grid gap-3 md:grid-cols-2">
                {result.keyTerms.map((term, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">{term.term}</p>
                    <p className="font-medium text-gray-900">{term.value}</p>
                    <p className="text-xs text-gray-600 mt-1">{term.assessment}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Missing Clauses Warning */}
            {result.missingClauses.length > 0 && (
              <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-6">
                <h3 className="font-semibold text-yellow-800 mb-3">⚠️ Missing Clauses</h3>
                <ul className="space-y-2">
                  {result.missingClauses.map((clause, index) => (
                    <li key={index} className="flex items-start gap-2 text-yellow-700">
                      <span>•</span><span>{clause}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tabs */}
            <div className="bg-white rounded-xl border overflow-hidden">
              <div className="flex border-b">
                <button
                  onClick={() => setActiveTab('clauses')}
                  className={`flex-1 px-4 py-3 text-sm font-medium ${activeTab === 'clauses' ? 'bg-slate-50 text-slate-700 border-b-2 border-slate-500' : 'text-gray-500'}`}
                >
                  Clauses ({result.clauses.length})
                </button>
                <button
                  onClick={() => setActiveTab('risks')}
                  className={`flex-1 px-4 py-3 text-sm font-medium ${activeTab === 'risks' ? 'bg-slate-50 text-slate-700 border-b-2 border-slate-500' : 'text-gray-500'}`}
                >
                  Risks ({result.risks.length})
                </button>
                <button
                  onClick={() => setActiveTab('negotiate')}
                  className={`flex-1 px-4 py-3 text-sm font-medium ${activeTab === 'negotiate' ? 'bg-slate-50 text-slate-700 border-b-2 border-slate-500' : 'text-gray-500'}`}
                >
                  Negotiation Points
                </button>
              </div>

              <div className="max-h-[500px] overflow-y-auto">
                {activeTab === 'clauses' && (
                  <div className="divide-y">
                    {result.clauses.map((clause, index) => {
                      const status = STATUS_COLORS[clause.status];
                      return (
                        <div key={index} className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-medium text-gray-900">{clause.name}</h4>
                              <p className="text-xs text-gray-500">Section: {clause.section}</p>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full ${status.bg} ${status.text}`}>
                              {clause.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{clause.summary}</p>
                          {clause.concern && (
                            <p className="text-sm text-orange-700 mb-2">⚠️ {clause.concern}</p>
                          )}
                          {clause.suggestion && (
                            <div className="p-2 bg-slate-50 rounded">
                              <p className="text-sm text-slate-700">💡 {clause.suggestion}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {activeTab === 'risks' && (
                  <div className="divide-y">
                    {result.risks.map((risk) => {
                      const colors = SEVERITY_COLORS[risk.severity];
                      return (
                        <div key={risk.id} className="p-4">
                          <div className="flex items-start gap-3">
                            <span className="text-xl">{CATEGORY_ICONS[risk.category]}</span>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`px-2 py-0.5 text-xs rounded-full ${colors.bg} ${colors.text}`}>{risk.severity}</span>
                                <span className="text-xs text-gray-500">Leverage: {risk.negotiationLeverage}</span>
                              </div>
                              <p className="text-sm text-gray-500 mb-1">Clause: {risk.clause}</p>
                              <p className="text-sm text-gray-900 font-medium mb-2">{risk.issue}</p>
                              <p className="text-sm text-red-700 mb-2"><strong>Impact:</strong> {risk.potentialImpact}</p>
                              <div className="p-3 bg-slate-50 rounded-lg">
                                <p className="text-sm text-slate-800">💡 {risk.recommendation}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {activeTab === 'negotiate' && (
                  <div className="p-4">
                    <ol className="space-y-4">
                      {result.negotiationPoints.map((point, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-slate-100 text-slate-700 rounded-full flex items-center justify-center text-sm font-bold">{index + 1}</span>
                          <p className="text-gray-700">{point}</p>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">🎯 Recommended Actions</h3>
              <ol className="space-y-3">
                {result.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-slate-100 text-slate-700 rounded-full flex items-center justify-center text-sm font-bold">{index + 1}</span>
                    <p className="text-gray-700">{rec}</p>
                  </li>
                ))}
              </ol>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button onClick={clearAll} className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
                Review Another Contract
              </button>
              <Link href="/dashboard" className="px-6 py-3 bg-slate-700 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors">
                Discuss with Casey
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
