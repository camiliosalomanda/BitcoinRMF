'use client';

/**
 * CHRO Job Description Review Skill
 * Review and optimize job descriptions for clarity and compliance
 */

import React, { useState } from 'react';
import Link from 'next/link';

interface JDScore {
  category: string;
  score: number;
  maxScore: number;
  feedback: string;
}

interface JDIssue {
  id: string;
  category: 'clarity' | 'compliance' | 'bias' | 'requirements' | 'compensation' | 'culture';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  location: string;
  description: string;
  suggestion: string;
}

interface JDAnalysis {
  summary: {
    overallScore: number;
    roleClarity: number;
    inclusivity: number;
    compliance: number;
    attractiveness: number;
    topIssue: string;
  };
  scores: JDScore[];
  issues: JDIssue[];
  biasFlags: string[];
  missingElements: string[];
  strengths: string[];
  rewriteSuggestions: { original: string; suggested: string; reason: string }[];
  recommendations: string[];
}

const CATEGORY_ICONS = {
  clarity: '👁️',
  compliance: '⚖️',
  bias: '⚠️',
  requirements: '📋',
  compensation: '💰',
  culture: '🏢',
};

const SEVERITY_COLORS = {
  critical: { bg: 'bg-red-100', text: 'text-red-700' },
  high: { bg: 'bg-orange-100', text: 'text-orange-700' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  low: { bg: 'bg-blue-100', text: 'text-blue-700' },
};

export default function JobDescriptionReviewPage() {
  const [jobDescription, setJobDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<JDAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'scores' | 'issues' | 'rewrites'>('scores');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const runAnalysis = async () => {
    if (!jobDescription.trim() && files.length === 0) {
      setError('Please provide a job description or upload files');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));
      formData.append('jobDescription', jobDescription);

      const response = await fetch('/api/skills/chro/job-description-review', {
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
      setError(err instanceof Error ? err.message : 'Failed to review job description');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearAll = () => {
    setJobDescription('');
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
                <span className="text-2xl">📄</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Job Description Review</h1>
                <p className="text-gray-500 text-sm">Taylor will review and optimize your job descriptions</p>
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
              <h3 className="font-semibold text-gray-900 mb-4">Paste Your Job Description</h3>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the full job description here, including:

• Job title
• Department/team
• Responsibilities
• Requirements (must-have and nice-to-have)
• Qualifications
• Benefits
• Company description
• Any other relevant information"
                className="w-full h-64 px-4 py-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-900"
              />
            </div>

            {/* File Upload */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Or Upload JD Files (Optional)</h3>
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer hover:border-pink-400 hover:bg-pink-50 transition-colors">
                <span className="text-2xl mb-2">📄</span>
                <p className="text-gray-600 text-sm">Word docs, PDFs, or text files</p>
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

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
            )}

            <button
              onClick={runAnalysis}
              disabled={isAnalyzing || (!jobDescription.trim() && files.length === 0)}
              className="w-full px-6 py-3 bg-pink-600 text-white font-semibold rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Reviewing JD...
                </>
              ) : (
                <>📄 Review Job Description</>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-white rounded-xl border p-6">
              <div className="grid gap-4 md:grid-cols-5">
                <div className="p-4 bg-pink-50 rounded-lg text-center">
                  <p className={`text-3xl font-bold ${getScoreColor(result.summary.overallScore)}`}>{result.summary.overallScore}</p>
                  <p className="text-sm text-pink-600">Overall Score</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <p className={`text-2xl font-bold ${getScoreColor(result.summary.roleClarity)}`}>{result.summary.roleClarity}</p>
                  <p className="text-xs text-gray-500">Role Clarity</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <p className={`text-2xl font-bold ${getScoreColor(result.summary.inclusivity)}`}>{result.summary.inclusivity}</p>
                  <p className="text-xs text-gray-500">Inclusivity</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <p className={`text-2xl font-bold ${getScoreColor(result.summary.compliance)}`}>{result.summary.compliance}</p>
                  <p className="text-xs text-gray-500">Compliance</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <p className={`text-2xl font-bold ${getScoreColor(result.summary.attractiveness)}`}>{result.summary.attractiveness}</p>
                  <p className="text-xs text-gray-500">Attractiveness</p>
                </div>
              </div>
            </div>

            {/* Bias Flags */}
            {result.biasFlags.length > 0 && (
              <div className="bg-red-50 rounded-xl border border-red-200 p-6">
                <h3 className="font-semibold text-red-800 mb-3">⚠️ Potential Bias Detected</h3>
                <ul className="space-y-2">
                  {result.biasFlags.map((flag, index) => (
                    <li key={index} className="flex items-start gap-2 text-red-700">
                      <span>•</span><span>{flag}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Missing Elements */}
            {result.missingElements.length > 0 && (
              <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-6">
                <h3 className="font-semibold text-yellow-800 mb-3">📋 Missing Elements</h3>
                <ul className="space-y-2">
                  {result.missingElements.map((element, index) => (
                    <li key={index} className="flex items-start gap-2 text-yellow-700">
                      <span>•</span><span>{element}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tabs */}
            <div className="bg-white rounded-xl border overflow-hidden">
              <div className="flex border-b">
                <button
                  onClick={() => setActiveTab('scores')}
                  className={`flex-1 px-4 py-3 text-sm font-medium ${activeTab === 'scores' ? 'bg-pink-50 text-pink-700 border-b-2 border-pink-500' : 'text-gray-500'}`}
                >
                  Detailed Scores
                </button>
                <button
                  onClick={() => setActiveTab('issues')}
                  className={`flex-1 px-4 py-3 text-sm font-medium ${activeTab === 'issues' ? 'bg-pink-50 text-pink-700 border-b-2 border-pink-500' : 'text-gray-500'}`}
                >
                  Issues ({result.issues.length})
                </button>
                <button
                  onClick={() => setActiveTab('rewrites')}
                  className={`flex-1 px-4 py-3 text-sm font-medium ${activeTab === 'rewrites' ? 'bg-pink-50 text-pink-700 border-b-2 border-pink-500' : 'text-gray-500'}`}
                >
                  Suggested Rewrites
                </button>
              </div>

              <div className="max-h-[500px] overflow-y-auto">
                {activeTab === 'scores' && (
                  <div className="divide-y">
                    {result.scores.map((score, index) => (
                      <div key={index} className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{score.category}</h4>
                          <span className={`text-lg font-bold ${getScoreColor((score.score / score.maxScore) * 100)}`}>
                            {score.score}/{score.maxScore}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                          <div
                            className={`h-full rounded-full ${
                              (score.score / score.maxScore) >= 0.8 ? 'bg-green-500' :
                              (score.score / score.maxScore) >= 0.6 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${(score.score / score.maxScore) * 100}%` }}
                          />
                        </div>
                        <p className="text-sm text-gray-600">{score.feedback}</p>
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
                              <p className="text-xs text-gray-500 mb-2">Location: {issue.location}</p>
                              <p className="text-sm text-gray-600 mb-2">{issue.description}</p>
                              <div className="p-3 bg-pink-50 rounded-lg">
                                <p className="text-sm text-pink-800">💡 {issue.suggestion}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {activeTab === 'rewrites' && (
                  <div className="divide-y">
                    {result.rewriteSuggestions.map((rewrite, index) => (
                      <div key={index} className="p-4">
                        <div className="grid gap-4 md:grid-cols-2 mb-2">
                          <div className="p-3 bg-red-50 rounded-lg">
                            <p className="text-xs text-red-600 font-medium mb-1">Original</p>
                            <p className="text-sm text-red-800">{rewrite.original}</p>
                          </div>
                          <div className="p-3 bg-green-50 rounded-lg">
                            <p className="text-xs text-green-600 font-medium mb-1">Suggested</p>
                            <p className="text-sm text-green-800">{rewrite.suggested}</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">💡 {rewrite.reason}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">🎯 Priority Improvements</h3>
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
                Review Another JD
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
