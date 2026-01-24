'use client';

/**
 * CMO Competitor Analysis Skill
 * Analyze competitor positioning, messaging, and market strategies
 */

import React, { useState } from 'react';
import Link from 'next/link';

interface Competitor {
  name: string;
  website: string;
  positioning: string;
  targetAudience: string;
  strengths: string[];
  weaknesses: string[];
  pricingModel: string;
  marketShare: string;
  threatLevel: 'high' | 'medium' | 'low';
}

interface CompetitiveInsight {
  id: string;
  type: 'opportunity' | 'threat' | 'gap' | 'trend' | 'differentiator';
  title: string;
  description: string;
  competitors: string[];
  actionability: 'immediate' | 'short-term' | 'long-term';
  recommendation: string;
}

interface MarketPosition {
  dimension: string;
  yourPosition: number;
  competitorAverage: number;
  leader: string;
  gap: string;
}

interface CompetitorAnalysis {
  summary: {
    totalCompetitors: number;
    marketPosition: 'leader' | 'challenger' | 'follower' | 'niche';
    competitiveAdvantage: string;
    biggestThreat: string;
  };
  competitors: Competitor[];
  insights: CompetitiveInsight[];
  marketPositioning: MarketPosition[];
  strategies: string[];
  recommendations: string[];
}

const THREAT_COLORS = {
  high: { bg: 'bg-red-100', text: 'text-red-700' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  low: { bg: 'bg-green-100', text: 'text-green-700' },
};

const INSIGHT_ICONS = {
  opportunity: '💡',
  threat: '⚠️',
  gap: '🎯',
  trend: '📈',
  differentiator: '⭐',
};

export default function CompetitorAnalysisPage() {
  const [competitorInfo, setCompetitorInfo] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<CompetitorAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'competitors' | 'insights' | 'positioning'>('competitors');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const runAnalysis = async () => {
    if (!competitorInfo.trim() && files.length === 0) {
      setError('Please provide competitor information or upload files');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));
      formData.append('competitorInfo', competitorInfo);

      const response = await fetch('/api/skills/cmo/competitor-analysis', {
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
      setError(err instanceof Error ? err.message : 'Failed to analyze competitors');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearAll = () => {
    setCompetitorInfo('');
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
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🔎</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Competitor Analysis</h1>
                <p className="text-gray-500 text-sm">Jordan will analyze your competitive landscape</p>
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
              <h3 className="font-semibold text-gray-900 mb-4">Describe Your Competitors</h3>
              <textarea
                value={competitorInfo}
                onChange={(e) => setCompetitorInfo(e.target.value)}
                placeholder="Tell me about your competitive landscape:

• What industry/market are you in?
• Who are your main competitors? (names, websites)
• What products/services do they offer?
• How do they position themselves?
• What are their pricing strategies?
• Where do you think you're winning or losing?

Example:
We're a project management SaaS competing with:
- Asana (asana.com) - Enterprise focused, $10-25/user
- Monday.com - SMB focused, visual workflows
- Basecamp - Simple, flat pricing
Our differentiator is AI-powered task prioritization."
                className="w-full h-56 px-4 py-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
              />
            </div>

            {/* File Upload */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Upload Competitor Research (Optional)</h3>
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-colors">
                <span className="text-2xl mb-2">📄</span>
                <p className="text-gray-600 text-sm">Competitor reports, market research, feature comparisons</p>
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
              disabled={isAnalyzing || (!competitorInfo.trim() && files.length === 0)}
              className="w-full px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Analyzing Competitors...
                </>
              ) : (
                <>🔎 Run Competitor Analysis</>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-white rounded-xl border p-6">
              <div className="grid gap-4 md:grid-cols-4">
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-purple-600">Competitors Analyzed</p>
                  <p className="text-2xl font-bold text-purple-700">{result.summary.totalCompetitors}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Your Market Position</p>
                  <p className="text-xl font-bold text-gray-900 capitalize">{result.summary.marketPosition}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-600">Competitive Advantage</p>
                  <p className="text-sm font-medium text-green-700">{result.summary.competitiveAdvantage}</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-600">Biggest Threat</p>
                  <p className="text-sm font-medium text-red-700">{result.summary.biggestThreat}</p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl border overflow-hidden">
              <div className="flex border-b">
                <button
                  onClick={() => setActiveTab('competitors')}
                  className={`flex-1 px-4 py-3 text-sm font-medium ${activeTab === 'competitors' ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-500' : 'text-gray-500'}`}
                >
                  Competitors ({result.competitors.length})
                </button>
                <button
                  onClick={() => setActiveTab('insights')}
                  className={`flex-1 px-4 py-3 text-sm font-medium ${activeTab === 'insights' ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-500' : 'text-gray-500'}`}
                >
                  Insights ({result.insights.length})
                </button>
                <button
                  onClick={() => setActiveTab('positioning')}
                  className={`flex-1 px-4 py-3 text-sm font-medium ${activeTab === 'positioning' ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-500' : 'text-gray-500'}`}
                >
                  Positioning
                </button>
              </div>

              <div className="max-h-[500px] overflow-y-auto">
                {activeTab === 'competitors' && (
                  <div className="divide-y">
                    {result.competitors.map((comp, index) => {
                      const threat = THREAT_COLORS[comp.threatLevel];
                      return (
                        <div key={index} className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-gray-900">{comp.name}</h4>
                              <p className="text-sm text-purple-600">{comp.website}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm ${threat.bg} ${threat.text}`}>
                              {comp.threatLevel} threat
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3"><strong>Positioning:</strong> {comp.positioning}</p>
                          <p className="text-sm text-gray-600 mb-3"><strong>Target:</strong> {comp.targetAudience}</p>
                          <p className="text-sm text-gray-600 mb-3"><strong>Pricing:</strong> {comp.pricingModel}</p>
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="p-3 bg-green-50 rounded-lg">
                              <p className="text-xs font-medium text-green-700 mb-2">Their Strengths</p>
                              <ul className="text-sm text-green-600 space-y-1">
                                {comp.strengths.map((s, i) => <li key={i}>• {s}</li>)}
                              </ul>
                            </div>
                            <div className="p-3 bg-red-50 rounded-lg">
                              <p className="text-xs font-medium text-red-700 mb-2">Their Weaknesses</p>
                              <ul className="text-sm text-red-600 space-y-1">
                                {comp.weaknesses.map((w, i) => <li key={i}>• {w}</li>)}
                              </ul>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {activeTab === 'insights' && (
                  <div className="divide-y">
                    {result.insights.map((insight) => (
                      <div key={insight.id} className="p-4">
                        <div className="flex items-start gap-3">
                          <span className="text-xl">{INSIGHT_ICONS[insight.type]}</span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-gray-900">{insight.title}</h4>
                              <span className={`px-2 py-0.5 text-xs rounded-full ${
                                insight.actionability === 'immediate' ? 'bg-red-100 text-red-700' :
                                insight.actionability === 'short-term' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>
                                {insight.actionability}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                            {insight.competitors.length > 0 && (
                              <p className="text-xs text-gray-500 mb-2">Related: {insight.competitors.join(', ')}</p>
                            )}
                            <div className="p-3 bg-purple-50 rounded-lg">
                              <p className="text-sm text-purple-800">💡 {insight.recommendation}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'positioning' && (
                  <div className="p-4">
                    <div className="space-y-4">
                      {result.marketPositioning.map((pos, index) => (
                        <div key={index} className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900">{pos.dimension}</span>
                            <span className="text-sm text-gray-500">Leader: {pos.leader}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>You: {pos.yourPosition}/10</span>
                                <span>Avg: {pos.competitorAverage}/10</span>
                              </div>
                              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-purple-500 rounded-full"
                                  style={{ width: `${pos.yourPosition * 10}%` }}
                                />
                              </div>
                            </div>
                            <span className={`text-sm font-medium ${pos.yourPosition >= pos.competitorAverage ? 'text-green-600' : 'text-red-600'}`}>
                              {pos.gap}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Strategies */}
            <div className="bg-purple-50 rounded-xl border border-purple-200 p-6">
              <h3 className="font-semibold text-purple-800 mb-3">🎯 Competitive Strategies</h3>
              <ul className="space-y-2">
                {result.strategies.map((strategy, index) => (
                  <li key={index} className="flex items-start gap-2 text-purple-700">
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
                    <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-sm font-bold">{index + 1}</span>
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
