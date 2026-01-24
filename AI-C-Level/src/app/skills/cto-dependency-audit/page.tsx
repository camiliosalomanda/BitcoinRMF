'use client';

/**
 * CTO Dependency Audit Skill
 * Scan package dependencies for vulnerabilities and outdated packages
 */

import React, { useState, useCallback } from 'react';
import Link from 'next/link';

interface Dependency {
  name: string;
  currentVersion: string;
  latestVersion: string;
  type: 'production' | 'development';
  status: 'up-to-date' | 'outdated' | 'major-update' | 'vulnerable';
  vulnerabilities: Vulnerability[];
}

interface Vulnerability {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  recommendation: string;
  cve?: string;
}

interface AuditResult {
  summary: {
    totalDependencies: number;
    productionDeps: number;
    devDeps: number;
    upToDate: number;
    outdated: number;
    vulnerable: number;
  };
  securityScore: number;
  dependencies: Dependency[];
  recommendations: string[];
}

const SEVERITY_COLORS = {
  critical: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
  high: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' },
  low: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
};

const STATUS_BADGES = {
  'up-to-date': { bg: 'bg-green-100', text: 'text-green-700', label: 'Up to date' },
  'outdated': { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Outdated' },
  'major-update': { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Major update' },
  'vulnerable': { bg: 'bg-red-100', text: 'text-red-700', label: 'Vulnerable' },
};

export default function DependencyAuditPage() {
  const [file, setFile] = useState<File | null>(null);
  const [lockFile, setLockFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'package' | 'lock') => {
    if (e.target.files && e.target.files[0]) {
      if (type === 'package') {
        setFile(e.target.files[0]);
      } else {
        setLockFile(e.target.files[0]);
      }
    }
  };

  const runAudit = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('packageFile', file);
      if (lockFile) {
        formData.append('lockFile', lockFile);
      }

      const response = await fetch('/api/skills/cto/dependency-audit', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Audit failed');
      }

      const data = await response.json();
      setResult(data.audit);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to audit dependencies');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearAll = () => {
    setFile(null);
    setLockFile(null);
    setResult(null);
    setError(null);
  };

  const filteredDependencies = result?.dependencies.filter(dep => {
    if (filterStatus !== 'all' && dep.status !== filterStatus) return false;
    if (filterType !== 'all' && dep.type !== filterType) return false;
    return true;
  }) || [];

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
                <span className="text-2xl">📦</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dependency Audit</h1>
                <p className="text-gray-500 text-sm">Riley will scan your dependencies for vulnerabilities and updates</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {!result ? (
          <div className="space-y-6">
            {/* Upload Section */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Upload Package Files</h3>
              
              {/* Package.json */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  package.json / requirements.txt / Gemfile / go.mod <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex-1 flex items-center justify-center px-4 py-8 border-2 border-dashed rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                    <div className="text-center">
                      {file ? (
                        <>
                          <span className="text-2xl">📄</span>
                          <p className="text-sm font-medium text-gray-900 mt-2">{file.name}</p>
                          <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                        </>
                      ) : (
                        <>
                          <span className="text-2xl">📁</span>
                          <p className="text-sm text-gray-500 mt-2">Click to select package file</p>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept=".json,.txt,.toml,.mod"
                      onChange={(e) => handleFileSelect(e, 'package')}
                    />
                  </label>
                  {file && (
                    <button
                      onClick={() => setFile(null)}
                      className="p-2 text-gray-400 hover:text-red-500"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Lock file (optional) */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lock file (optional) - package-lock.json / yarn.lock / Pipfile.lock
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex-1 flex items-center justify-center px-4 py-6 border-2 border-dashed rounded-xl cursor-pointer hover:border-gray-400 transition-colors">
                    <div className="text-center">
                      {lockFile ? (
                        <>
                          <span className="text-xl">🔒</span>
                          <p className="text-sm font-medium text-gray-900 mt-1">{lockFile.name}</p>
                        </>
                      ) : (
                        <p className="text-sm text-gray-400">Click to add lock file for more accurate analysis</p>
                      )}
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept=".json,.lock"
                      onChange={(e) => handleFileSelect(e, 'lock')}
                    />
                  </label>
                  {lockFile && (
                    <button
                      onClick={() => setLockFile(null)}
                      className="p-2 text-gray-400 hover:text-red-500"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              <button
                onClick={runAudit}
                disabled={!file || isAnalyzing}
                className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Scanning Dependencies...
                  </>
                ) : (
                  <>
                    <span>🔍</span>
                    Run Dependency Audit
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            {/* Supported Package Managers */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Supported Package Managers</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-2xl">📦</span>
                  <div>
                    <p className="font-medium text-gray-900">npm / yarn</p>
                    <p className="text-xs text-gray-500">package.json</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-2xl">🐍</span>
                  <div>
                    <p className="font-medium text-gray-900">pip / pipenv</p>
                    <p className="text-xs text-gray-500">requirements.txt</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-2xl">💎</span>
                  <div>
                    <p className="font-medium text-gray-900">Bundler</p>
                    <p className="text-xs text-gray-500">Gemfile</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-2xl">🐹</span>
                  <div>
                    <p className="font-medium text-gray-900">Go Modules</p>
                    <p className="text-xs text-gray-500">go.mod</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <div className="bg-white rounded-xl border p-4">
                <p className="text-sm text-gray-500 mb-1">Security Score</p>
                <p className={`text-3xl font-bold ${getScoreColor(result.securityScore)}`}>
                  {result.securityScore}/100
                </p>
              </div>
              <div className="bg-white rounded-xl border p-4">
                <p className="text-sm text-gray-500 mb-1">Total Dependencies</p>
                <p className="text-3xl font-bold text-gray-900">{result.summary.totalDependencies}</p>
                <p className="text-xs text-gray-500">{result.summary.productionDeps} prod / {result.summary.devDeps} dev</p>
              </div>
              <div className="bg-white rounded-xl border p-4">
                <p className="text-sm text-gray-500 mb-1">Outdated</p>
                <p className={`text-3xl font-bold ${result.summary.outdated > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
                  {result.summary.outdated}
                </p>
              </div>
              <div className="bg-white rounded-xl border p-4">
                <p className="text-sm text-gray-500 mb-1">Vulnerable</p>
                <p className={`text-3xl font-bold ${result.summary.vulnerable > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {result.summary.vulnerable}
                </p>
              </div>
            </div>

            {/* Recommendations */}
            {result.recommendations.length > 0 && (
              <div className="bg-white rounded-xl border p-6">
                <h3 className="font-semibold text-gray-900 mb-4">🎯 Priority Actions</h3>
                <ul className="space-y-3">
                  {result.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-red-500 font-bold">{index + 1}.</span>
                      <p className="text-gray-700">{rec}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Dependencies List */}
            <div className="bg-white rounded-xl border overflow-hidden">
              <div className="px-6 py-4 border-b bg-gray-50">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Dependencies</h3>
                  <div className="flex gap-2">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="text-sm border rounded-lg px-3 py-1.5"
                    >
                      <option value="all">All Status</option>
                      <option value="vulnerable">Vulnerable</option>
                      <option value="major-update">Major Update</option>
                      <option value="outdated">Outdated</option>
                      <option value="up-to-date">Up to Date</option>
                    </select>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="text-sm border rounded-lg px-3 py-1.5"
                    >
                      <option value="all">All Types</option>
                      <option value="production">Production</option>
                      <option value="development">Development</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="divide-y max-h-[500px] overflow-y-auto">
                {filteredDependencies.map((dep, index) => {
                  const statusBadge = STATUS_BADGES[dep.status];
                  return (
                    <div key={index} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-gray-900">{dep.name}</h4>
                            <span className={`px-2 py-0.5 text-xs rounded-full ${statusBadge.bg} ${statusBadge.text}`}>
                              {statusBadge.label}
                            </span>
                            <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                              {dep.type}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">
                            {dep.currentVersion} → {dep.latestVersion}
                          </p>
                        </div>
                      </div>

                      {dep.vulnerabilities.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {dep.vulnerabilities.map((vuln, vIndex) => {
                            const colors = SEVERITY_COLORS[vuln.severity];
                            return (
                              <div key={vIndex} className={`p-3 rounded-lg border ${colors.border} ${colors.bg}`}>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`px-2 py-0.5 text-xs font-medium rounded ${colors.text} bg-white`}>
                                    {vuln.severity.toUpperCase()}
                                  </span>
                                  <span className="font-medium text-gray-900">{vuln.title}</span>
                                  {vuln.cve && <span className="text-xs text-gray-500">{vuln.cve}</span>}
                                </div>
                                <p className="text-sm text-gray-700 mb-2">{vuln.description}</p>
                                <p className="text-sm text-blue-700">💡 {vuln.recommendation}</p>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={clearAll}
                className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Audit Another Project
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
