'use client';

/**
 * CMO Content Review Skill
 * Evaluate content strategy and SEO optimization
 */

import React, { useState } from 'react';
import Link from 'next/link';

interface ContentPiece {
  title: string;
  type: 'blog' | 'landing' | 'email' | 'social' | 'ad' | 'video' | 'other';
  score: number;
  strengths: string[];
  issues: string[];
  seoScore?: number;
  readabilityScore?: number;
}

interface ContentIssue {
  id: string;
  category: 'seo' | 'messaging' | 'cta' | 'structure' | 'tone' | 'engagement';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  location: string;
  fix: string;
}

interface SEOAnalysis {
  overallScore: number;
  titleTag: { score: number; suggestion: string };
  metaDescription: { score: number; suggestion: string };
  headings: { score: number; suggestion: string };
  keywords: { found: string[]; missing: string[]; density: string };
  readability: { score: number; gradeLevel: string; suggestion: string };
}

interface ContentReview {
  summary: {
    piecesAnalyzed: number;
    overallScore: number;
    contentHealth: 'excellent' | 'good' | 'needs-work' | 'poor';
    topStrength: string;
    topPriority: string;
  };
  pieces: ContentPiece[];
  issues: ContentIssue[];
  seoAnalysis: SEOAnalysis;
  recommendations: string[];
}

const CATEGORY_ICONS = {
  seo: '🔍',
  messaging: '💬',
  cta: '🎯',
  structure: '📐',
  tone: '🎨',
  engagement: '❤️',
};

const SEVERITY_COLORS = {
  critical: { bg: 'bg-red-100', text: 'text-red-700' },
  high: { bg: 'bg-orange-100', text: 'text-orange-700' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  low: { bg: 'bg-blue-100', text: 'text-blue-700' },
};

const TYPE_LABELS = {
  blog: '📝 Blog Post',
  landing: '🏠 Landing Page',
  email: '📧 Email',
  social: '📱 Social',
  ad: '📢 Ad Copy',
  video: '🎬 Video Script',
  other: '📄 Other',
};

export default function ContentReviewPage() {
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [contentUrl, setContentUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ContentReview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pieces' | 'issues' | 'seo'>('pieces');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const runReview = async () => {
    if (!content.trim() && files.length === 0 && !contentUrl.trim()) {
      setError('Please provide content, upload files, or enter a URL');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));
      formData.append('content', content);
      formData.append('contentUrl', contentUrl);

      const response = await fetch('/api/skills/cmo/content-review', {
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
      setError(err instanceof Error ? err.message : 'Failed to review content');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearAll = () => {
    setContent('');
    setFiles([]);
    setContentUrl('');
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
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📝</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Content Review</h1>
                <p className="text-gray-500 text-sm">Jordan will evaluate your content and SEO</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {!result ? (
          <div className="space-y-6">
            {/* Content Input */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Paste Your Content</h3>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste your marketing content here:

• Blog posts
• Landing page copy
• Email campaigns
• Ad copy
• Social media posts
• Product descriptions

Include any headlines, body copy, CTAs, and meta descriptions you want reviewed."
                className="w-full h-48 px-4 py-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
              />
            </div>

            {/* URL Input */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Or Enter a URL (Optional)</h3>
              <input
                type="url"
                value={contentUrl}
                onChange={(e) => setContentUrl(e.target.value)}
                placeholder="https://yoursite.com/blog/article"
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
              />
              <p className="text-xs text-gray-500 mt-2">We'll analyze the content from this page</p>
            </div>

            {/* File Upload */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Or Upload Content Files (Optional)</h3>
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-colors">
                <span className="text-2xl mb-2">📄</span>
                <p className="text-gray-600 text-sm">Documents, spreadsheets with content</p>
                <input type="file" multiple className="hidden" onChange={handleFileSelect} accept=".txt,.doc,.docx,.md,.html,.csv" />
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
              onClick={runReview}
              disabled={isAnalyzing || (!content.trim() && files.length === 0 && !contentUrl.trim())}
              className="w-full px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Reviewing Content...
                </>
              ) : (
                <>📝 Review Content</>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-white rounded-xl border p-6">
              <div className="grid gap-4 md:grid-cols-4">
                <div className="p-4 bg-purple-50 rounded-lg text-center">
                  <p className={`text-3xl font-bold ${getScoreColor(result.summary.overallScore)}`}>
                    {result.summary.overallScore}
                  </p>
                  <p className="text-sm text-purple-600">Overall Score</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className={`text-lg font-bold capitalize ${
                    result.summary.contentHealth === 'excellent' ? 'text-green-600' :
                    result.summary.contentHealth === 'good' ? 'text-blue-600' :
                    result.summary.contentHealth === 'needs-work' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {result.summary.contentHealth.replace('-', ' ')}
                  </p>
                  <p className="text-sm text-gray-500">Content Health</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm font-medium text-green-700">{result.summary.topStrength}</p>
                  <p className="text-xs text-green-600">Top Strength</p>
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
                  onClick={() => setActiveTab('pieces')}
                  className={`flex-1 px-4 py-3 text-sm font-medium ${activeTab === 'pieces' ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-500' : 'text-gray-500'}`}
                >
                  Content ({result.pieces.length})
                </button>
                <button
                  onClick={() => setActiveTab('issues')}
                  className={`flex-1 px-4 py-3 text-sm font-medium ${activeTab === 'issues' ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-500' : 'text-gray-500'}`}
                >
                  Issues ({result.issues.length})
                </button>
                <button
                  onClick={() => setActiveTab('seo')}
                  className={`flex-1 px-4 py-3 text-sm font-medium ${activeTab === 'seo' ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-500' : 'text-gray-500'}`}
                >
                  SEO Analysis
                </button>
              </div>

              <div className="max-h-[500px] overflow-y-auto">
                {activeTab === 'pieces' && (
                  <div className="divide-y">
                    {result.pieces.map((piece, index) => (
                      <div key={index} className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span>{TYPE_LABELS[piece.type]}</span>
                            <h4 className="font-medium text-gray-900">{piece.title}</h4>
                          </div>
                          <span className={`text-lg font-bold ${getScoreColor(piece.score)}`}>{piece.score}/100</span>
                        </div>
                        <div className="grid gap-3 md:grid-cols-2">
                          <div className="p-3 bg-green-50 rounded-lg">
                            <p className="text-xs font-medium text-green-700 mb-2">✓ Strengths</p>
                            <ul className="text-sm text-green-600 space-y-1">
                              {piece.strengths.map((s, i) => <li key={i}>• {s}</li>)}
                            </ul>
                          </div>
                          <div className="p-3 bg-yellow-50 rounded-lg">
                            <p className="text-xs font-medium text-yellow-700 mb-2">⚠ To Improve</p>
                            <ul className="text-sm text-yellow-600 space-y-1">
                              {piece.issues.map((issue, i) => <li key={i}>• {issue}</li>)}
                            </ul>
                          </div>
                        </div>
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
                              <p className="text-xs text-gray-500 mb-2">📍 {issue.location}</p>
                              <div className="p-3 bg-purple-50 rounded-lg">
                                <p className="text-sm text-purple-800">💡 <strong>Fix:</strong> {issue.fix}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {activeTab === 'seo' && (
                  <div className="p-4 space-y-4">
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className={`text-4xl font-bold ${getScoreColor(result.seoAnalysis.overallScore)}`}>
                        {result.seoAnalysis.overallScore}/100
                      </p>
                      <p className="text-purple-600">SEO Score</p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="p-4 border rounded-lg">
                        <div className="flex justify-between mb-2">
                          <span className="font-medium">Title Tag</span>
                          <span className={getScoreColor(result.seoAnalysis.titleTag.score)}>{result.seoAnalysis.titleTag.score}/100</span>
                        </div>
                        <p className="text-sm text-gray-600">{result.seoAnalysis.titleTag.suggestion}</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <div className="flex justify-between mb-2">
                          <span className="font-medium">Meta Description</span>
                          <span className={getScoreColor(result.seoAnalysis.metaDescription.score)}>{result.seoAnalysis.metaDescription.score}/100</span>
                        </div>
                        <p className="text-sm text-gray-600">{result.seoAnalysis.metaDescription.suggestion}</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <div className="flex justify-between mb-2">
                          <span className="font-medium">Headings</span>
                          <span className={getScoreColor(result.seoAnalysis.headings.score)}>{result.seoAnalysis.headings.score}/100</span>
                        </div>
                        <p className="text-sm text-gray-600">{result.seoAnalysis.headings.suggestion}</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <div className="flex justify-between mb-2">
                          <span className="font-medium">Readability</span>
                          <span className={getScoreColor(result.seoAnalysis.readability.score)}>{result.seoAnalysis.readability.score}/100</span>
                        </div>
                        <p className="text-sm text-gray-600">Grade Level: {result.seoAnalysis.readability.gradeLevel}</p>
                        <p className="text-sm text-gray-600">{result.seoAnalysis.readability.suggestion}</p>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Keywords</h4>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {result.seoAnalysis.keywords.found.map((kw, i) => (
                          <span key={i} className="px-2 py-1 bg-green-100 text-green-700 text-sm rounded">{kw}</span>
                        ))}
                      </div>
                      {result.seoAnalysis.keywords.missing.length > 0 && (
                        <>
                          <p className="text-sm text-gray-500 mb-1">Consider adding:</p>
                          <div className="flex flex-wrap gap-2">
                            {result.seoAnalysis.keywords.missing.map((kw, i) => (
                              <span key={i} className="px-2 py-1 bg-yellow-100 text-yellow-700 text-sm rounded">{kw}</span>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">🎯 Content Recommendations</h3>
              <ol className="space-y-3">
                {result.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-sm font-bold">{index + 1}</span>
                    <p className="text-gray-700">{rec}</p>
                  </li>
                ))}
              </ol>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button onClick={clearAll} className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
                Review More Content
              </button>
              <Link href="/dashboard" className="px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors">
                Discuss with Jordan
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
