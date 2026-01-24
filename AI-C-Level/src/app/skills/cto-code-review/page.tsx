'use client';

/**
 * CTO Code Review Skill
 * Upload and analyze codebase for security, architecture, and technical debt
 */

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';

interface AnalysisResult {
  id: string;
  category: 'security' | 'architecture' | 'performance' | 'maintainability' | 'best-practices';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  description: string;
  file?: string;
  line?: number;
  suggestion: string;
}

interface CodeAnalysis {
  summary: {
    totalFiles: number;
    totalLines: number;
    languages: string[];
    frameworks: string[];
  };
  scores: {
    security: number;
    architecture: number;
    maintainability: number;
    overall: number;
  };
  findings: AnalysisResult[];
  recommendations: string[];
}

const SEVERITY_COLORS = {
  critical: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
  high: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' },
  low: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
  info: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' },
};

const CATEGORY_ICONS = {
  security: '🔒',
  architecture: '🏗️',
  performance: '⚡',
  maintainability: '🔧',
  'best-practices': '✨',
};

export default function CTOCodeReviewPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<CodeAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  
  const { companyContext } = useAppStore();

  // Handle file drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  }, []);

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  // Process files
  const handleFiles = (newFiles: File[]) => {
    // Filter for code files and zip
    const validExtensions = ['.js', '.ts', '.tsx', '.jsx', '.py', '.java', '.go', '.rb', '.php', '.cs', '.cpp', '.c', '.h', '.json', '.yaml', '.yml', '.md', '.txt', '.html', '.css', '.scss', '.sql', '.sh', '.zip'];
    
    const validFiles = newFiles.filter(file => {
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      return validExtensions.includes(ext) || file.type === 'application/zip';
    });

    if (validFiles.length !== newFiles.length) {
      setError('Some files were skipped. Only code files and zip archives are supported.');
    }

    setFiles(prev => [...prev, ...validFiles]);
  };

  // Remove file
  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Clear all
  const clearAll = () => {
    setFiles([]);
    setAnalysis(null);
    setError(null);
  };

  // Run analysis
  const runAnalysis = async () => {
    if (files.length === 0) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });
      
      if (companyContext) {
        formData.append('companyContext', JSON.stringify(companyContext));
      }

      const response = await fetch('/api/skills/cto/code-review', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Analysis failed');
      }

      const result = await response.json();
      setAnalysis(result.analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze code');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Filter findings
  const filteredFindings = analysis?.findings.filter(f => {
    if (filterSeverity !== 'all' && f.severity !== filterSeverity) return false;
    if (filterCategory !== 'all' && f.category !== filterCategory) return false;
    return true;
  }) || [];

  // Score color
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
                <span className="text-2xl">💻</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">CTO Code Review</h1>
                <p className="text-gray-500 text-sm">Riley will analyze your code for security, architecture, and best practices</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {!analysis ? (
          /* Upload Section */
          <div className="space-y-6">
            {/* Drop Zone */}
            <div
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                dragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
            >
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📁</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Drop your code files or folder here
              </h3>
              <p className="text-gray-500 mb-4">
                Supports .js, .ts, .py, .java, .go, .rb, .php, and more. You can also upload a .zip file.
              </p>
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Browse Files
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                  accept=".js,.ts,.tsx,.jsx,.py,.java,.go,.rb,.php,.cs,.cpp,.c,.h,.json,.yaml,.yml,.md,.txt,.html,.css,.scss,.sql,.sh,.zip"
                />
              </label>
            </div>

            {/* Selected Files */}
            {files.length > 0 && (
              <div className="bg-white rounded-xl border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">
                    Selected Files ({files.length})
                  </h3>
                  <button
                    onClick={clearAll}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Clear All
                  </button>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">
                          {file.name.endsWith('.zip') ? '📦' : '📄'}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{file.name}</p>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                      >
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Analyze Button */}
                <button
                  onClick={runAnalysis}
                  disabled={isAnalyzing}
                  className="w-full mt-4 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Analyzing Code...
                    </>
                  ) : (
                    <>
                      <span>🔍</span>
                      Run Code Review
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            {/* What We Analyze */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">What Riley Analyzes</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-start gap-3">
                  <span className="text-xl">🔒</span>
                  <div>
                    <h4 className="font-medium text-gray-900">Security</h4>
                    <p className="text-sm text-gray-500">Vulnerabilities, hardcoded secrets, injection risks, auth issues</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl">🏗️</span>
                  <div>
                    <h4 className="font-medium text-gray-900">Architecture</h4>
                    <p className="text-sm text-gray-500">Code structure, patterns, coupling, separation of concerns</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl">⚡</span>
                  <div>
                    <h4 className="font-medium text-gray-900">Performance</h4>
                    <p className="text-sm text-gray-500">Inefficiencies, memory leaks, N+1 queries, optimization opportunities</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl">🔧</span>
                  <div>
                    <h4 className="font-medium text-gray-900">Maintainability</h4>
                    <p className="text-sm text-gray-500">Code complexity, documentation, naming, technical debt</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Analysis Results */
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <div className="bg-white rounded-xl border p-4">
                <p className="text-sm text-gray-500 mb-1">Overall Score</p>
                <p className={`text-3xl font-bold ${getScoreColor(analysis.scores.overall)}`}>
                  {analysis.scores.overall}/100
                </p>
              </div>
              <div className="bg-white rounded-xl border p-4">
                <p className="text-sm text-gray-500 mb-1">🔒 Security</p>
                <p className={`text-3xl font-bold ${getScoreColor(analysis.scores.security)}`}>
                  {analysis.scores.security}/100
                </p>
              </div>
              <div className="bg-white rounded-xl border p-4">
                <p className="text-sm text-gray-500 mb-1">🏗️ Architecture</p>
                <p className={`text-3xl font-bold ${getScoreColor(analysis.scores.architecture)}`}>
                  {analysis.scores.architecture}/100
                </p>
              </div>
              <div className="bg-white rounded-xl border p-4">
                <p className="text-sm text-gray-500 mb-1">🔧 Maintainability</p>
                <p className={`text-3xl font-bold ${getScoreColor(analysis.scores.maintainability)}`}>
                  {analysis.scores.maintainability}/100
                </p>
              </div>
            </div>

            {/* Project Summary */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Project Summary</h3>
              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <p className="text-sm text-gray-500">Files Analyzed</p>
                  <p className="text-xl font-semibold text-gray-900">{analysis.summary.totalFiles}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Lines of Code</p>
                  <p className="text-xl font-semibold text-gray-900">{analysis.summary.totalLines.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Languages</p>
                  <p className="text-sm font-medium text-gray-900">{analysis.summary.languages.join(', ') || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Frameworks</p>
                  <p className="text-sm font-medium text-gray-900">{analysis.summary.frameworks.join(', ') || 'None detected'}</p>
                </div>
              </div>
            </div>

            {/* Findings */}
            <div className="bg-white rounded-xl border overflow-hidden">
              <div className="px-6 py-4 border-b bg-gray-50">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">
                    Findings ({analysis.findings.length})
                  </h3>
                  <div className="flex gap-2">
                    <select
                      value={filterSeverity}
                      onChange={(e) => setFilterSeverity(e.target.value)}
                      className="text-sm border rounded-lg px-3 py-1.5"
                    >
                      <option value="all">All Severities</option>
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                      <option value="info">Info</option>
                    </select>
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="text-sm border rounded-lg px-3 py-1.5"
                    >
                      <option value="all">All Categories</option>
                      <option value="security">Security</option>
                      <option value="architecture">Architecture</option>
                      <option value="performance">Performance</option>
                      <option value="maintainability">Maintainability</option>
                      <option value="best-practices">Best Practices</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="divide-y max-h-[600px] overflow-y-auto">
                {filteredFindings.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    No findings match your filters
                  </div>
                ) : (
                  filteredFindings.map((finding) => {
                    const colors = SEVERITY_COLORS[finding.severity];
                    return (
                      <div key={finding.id} className="p-4">
                        <div className="flex items-start gap-4">
                          <span className="text-xl">{CATEGORY_ICONS[finding.category]}</span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-gray-900">{finding.title}</h4>
                              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${colors.bg} ${colors.text}`}>
                                {finding.severity}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{finding.description}</p>
                            {finding.file && (
                              <p className="text-xs text-gray-400 mb-2">
                                📄 {finding.file}{finding.line ? `:${finding.line}` : ''}
                              </p>
                            )}
                            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                              <p className="text-sm text-blue-800">
                                <strong>💡 Suggestion:</strong> {finding.suggestion}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Recommendations */}
            {analysis.recommendations.length > 0 && (
              <div className="bg-white rounded-xl border p-6">
                <h3 className="font-semibold text-gray-900 mb-4">🎯 Top Recommendations</h3>
                <ul className="space-y-3">
                  {analysis.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-emerald-500 font-bold">{index + 1}.</span>
                      <p className="text-gray-700">{rec}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={clearAll}
                className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Analyze New Code
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
