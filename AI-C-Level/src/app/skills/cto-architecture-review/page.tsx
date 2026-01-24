'use client';

/**
 * CTO Architecture Review Skill
 * Evaluate system architecture and provide scalability recommendations
 */

import React, { useState, useCallback } from 'react';
import Link from 'next/link';

interface ArchitectureIssue {
  id: string;
  category: 'scalability' | 'reliability' | 'security' | 'maintainability' | 'performance' | 'cost';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  description: string;
  impact: string;
  recommendation: string;
  effort: 'low' | 'medium' | 'high';
}

interface ArchitecturePattern {
  name: string;
  detected: boolean;
  quality: 'good' | 'needs-improvement' | 'poor' | 'not-applicable';
  notes: string;
}

interface ArchitectureReview {
  summary: {
    projectType: string;
    mainLanguages: string[];
    frameworks: string[];
    estimatedComplexity: 'simple' | 'moderate' | 'complex' | 'very-complex';
  };
  scores: {
    scalability: number;
    reliability: number;
    security: number;
    maintainability: number;
    overall: number;
  };
  patterns: ArchitecturePattern[];
  issues: ArchitectureIssue[];
  strengths: string[];
  recommendations: string[];
  architectureDiagram?: string;
}

const CATEGORY_ICONS = {
  scalability: '📈',
  reliability: '🛡️',
  security: '🔒',
  maintainability: '🔧',
  performance: '⚡',
  cost: '💰',
};

const SEVERITY_COLORS = {
  critical: { bg: 'bg-red-100', text: 'text-red-700' },
  high: { bg: 'bg-orange-100', text: 'text-orange-700' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  low: { bg: 'bg-blue-100', text: 'text-blue-700' },
  info: { bg: 'bg-gray-100', text: 'text-gray-700' },
};

const EFFORT_LABELS = {
  low: { text: 'Quick win', color: 'text-green-600' },
  medium: { text: 'Moderate effort', color: 'text-yellow-600' },
  high: { text: 'Significant effort', color: 'text-red-600' },
};

export default function ArchitectureReviewPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [description, setDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ArchitectureReview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [activeTab, setActiveTab] = useState<'issues' | 'patterns' | 'diagram'>('issues');

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (newFiles: File[]) => {
    // Accept architecture-related files
    const validExtensions = ['.md', '.txt', '.json', '.yaml', '.yml', '.puml', '.drawio', '.xml', '.tf', '.hcl', '.dockerfile', 'dockerfile', '.js', '.ts', '.py', '.go', '.java'];
    
    const validFiles = newFiles.filter(file => {
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      const nameOnly = file.name.toLowerCase();
      return validExtensions.includes(ext) || validExtensions.includes(nameOnly);
    });

    setFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const runReview = async () => {
    if (files.length === 0 && !description.trim()) {
      setError('Please upload architecture files or provide a description');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });
      formData.append('description', description);

      const response = await fetch('/api/skills/cto/architecture-review', {
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
      setError(err instanceof Error ? err.message : 'Failed to review architecture');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearAll = () => {
    setFiles([]);
    setDescription('');
    setResult(null);
    setError(null);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getPatternColor = (quality: string) => {
    switch (quality) {
      case 'good': return 'text-green-600 bg-green-50';
      case 'needs-improvement': return 'text-yellow-600 bg-yellow-50';
      case 'poor': return 'text-red-600 bg-red-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link
              href="/skills"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🏗️</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Architecture Review</h1>
                <p className="text-gray-500 text-sm">Riley will evaluate your system architecture and provide recommendations</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {!result ? (
          <div className="space-y-6">
            {/* Description Input */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Describe Your Architecture</h3>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your system architecture, tech stack, and any specific concerns you have. For example:

- What type of application is it? (Web app, API, microservices, etc.)
- What technologies are you using? (Frontend, backend, database, cloud)
- What's the current scale? (Users, requests, data volume)
- What are your scalability goals?
- Any specific pain points or concerns?"
                className="w-full h-40 px-4 py-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>

            {/* File Upload */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Upload Architecture Files (Optional)</h3>
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                }`}
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
              >
                <span className="text-3xl">📄</span>
                <p className="text-gray-600 mt-2">
                  Drop architecture docs, diagrams, config files, or code structure
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  README.md, docker-compose.yml, terraform files, architecture diagrams, etc.
                </p>
                <label className="inline-flex items-center gap-2 px-4 py-2 mt-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors">
                  Browse Files
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </label>
              </div>

              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span>📄</span>
                        <span className="text-sm font-medium text-gray-900">{file.name}</span>
                        <span className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</span>
                      </div>
                      <button onClick={() => removeFile(index)} className="text-gray-400 hover:text-red-500">✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            <button
              onClick={runReview}
              disabled={isAnalyzing || (files.length === 0 && !description.trim())}
              className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Analyzing Architecture...
                </>
              ) : (
                <>
                  <span>🏗️</span>
                  Run Architecture Review
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-white rounded-xl border p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{result.summary.projectType}</h3>
                  <p className="text-sm text-gray-500">
                    {result.summary.mainLanguages.join(', ')} • {result.summary.frameworks.join(', ')}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  result.summary.estimatedComplexity === 'simple' ? 'bg-green-100 text-green-700' :
                  result.summary.estimatedComplexity === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                  result.summary.estimatedComplexity === 'complex' ? 'bg-orange-100 text-orange-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {result.summary.estimatedComplexity} complexity
                </span>
              </div>

              {/* Scores */}
              <div className="grid gap-4 md:grid-cols-5">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className={`text-2xl font-bold ${getScoreColor(result.scores.overall)}`}>
                    {result.scores.overall}
                  </p>
                  <p className="text-xs text-gray-500">Overall</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className={`text-2xl font-bold ${getScoreColor(result.scores.scalability)}`}>
                    {result.scores.scalability}
                  </p>
                  <p className="text-xs text-gray-500">📈 Scalability</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className={`text-2xl font-bold ${getScoreColor(result.scores.reliability)}`}>
                    {result.scores.reliability}
                  </p>
                  <p className="text-xs text-gray-500">🛡️ Reliability</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className={`text-2xl font-bold ${getScoreColor(result.scores.security)}`}>
                    {result.scores.security}
                  </p>
                  <p className="text-xs text-gray-500">🔒 Security</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className={`text-2xl font-bold ${getScoreColor(result.scores.maintainability)}`}>
                    {result.scores.maintainability}
                  </p>
                  <p className="text-xs text-gray-500">🔧 Maintainability</p>
                </div>
              </div>
            </div>

            {/* Strengths */}
            {result.strengths.length > 0 && (
              <div className="bg-green-50 rounded-xl border border-green-200 p-6">
                <h3 className="font-semibold text-green-800 mb-3">✅ Architecture Strengths</h3>
                <ul className="space-y-2">
                  {result.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2 text-green-700">
                      <span>•</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tabs */}
            <div className="bg-white rounded-xl border overflow-hidden">
              <div className="flex border-b">
                <button
                  onClick={() => setActiveTab('issues')}
                  className={`flex-1 px-4 py-3 text-sm font-medium ${
                    activeTab === 'issues' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500' : 'text-gray-500'
                  }`}
                >
                  Issues ({result.issues.length})
                </button>
                <button
                  onClick={() => setActiveTab('patterns')}
                  className={`flex-1 px-4 py-3 text-sm font-medium ${
                    activeTab === 'patterns' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500' : 'text-gray-500'
                  }`}
                >
                  Patterns ({result.patterns.length})
                </button>
              </div>

              <div className="max-h-[500px] overflow-y-auto">
                {activeTab === 'issues' && (
                  <div className="divide-y">
                    {result.issues.map((issue) => {
                      const colors = SEVERITY_COLORS[issue.severity];
                      const effort = EFFORT_LABELS[issue.effort];
                      return (
                        <div key={issue.id} className="p-4">
                          <div className="flex items-start gap-3">
                            <span className="text-xl">{CATEGORY_ICONS[issue.category]}</span>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-gray-900">{issue.title}</h4>
                                <span className={`px-2 py-0.5 text-xs rounded-full ${colors.bg} ${colors.text}`}>
                                  {issue.severity}
                                </span>
                                <span className={`text-xs ${effort.color}`}>
                                  {effort.text}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{issue.description}</p>
                              <p className="text-sm text-orange-700 mb-2">
                                <strong>Impact:</strong> {issue.impact}
                              </p>
                              <div className="p-3 bg-blue-50 rounded-lg">
                                <p className="text-sm text-blue-800">
                                  <strong>💡 Recommendation:</strong> {issue.recommendation}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {activeTab === 'patterns' && (
                  <div className="divide-y">
                    {result.patterns.map((pattern, index) => (
                      <div key={index} className="p-4 flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{pattern.name}</h4>
                          <p className="text-sm text-gray-500">{pattern.notes}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPatternColor(pattern.quality)}`}>
                          {pattern.detected ? (pattern.quality === 'not-applicable' ? 'N/A' : pattern.quality.replace('-', ' ')) : 'Not detected'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Top Recommendations */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">🎯 Priority Recommendations</h3>
              <ol className="space-y-3">
                {result.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                    <p className="text-gray-700">{rec}</p>
                  </li>
                ))}
              </ol>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={clearAll}
                className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                New Review
              </button>
              <Link
                href="/dashboard"
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Discuss with Riley
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
