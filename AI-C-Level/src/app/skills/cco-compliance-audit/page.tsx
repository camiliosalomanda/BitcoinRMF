'use client';

/**
 * CCO Compliance Audit Skill
 * Evaluate regulatory compliance across the organization
 */

import React, { useState } from 'react';
import Link from 'next/link';

interface ComplianceArea {
  name: string;
  framework: string;
  status: 'compliant' | 'partial' | 'non-compliant' | 'not-assessed';
  score: number;
  gaps: number;
  criticalGaps: number;
  lastAssessed: string;
}

interface ComplianceGap {
  id: string;
  area: string;
  framework: string;
  requirement: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  currentState: string;
  requiredState: string;
  remediation: string;
  deadline: string;
  effort: 'low' | 'medium' | 'high';
}

interface ComplianceMetric {
  name: string;
  value: string;
  target: string;
  status: 'met' | 'at-risk' | 'missed';
  trend: 'improving' | 'stable' | 'declining';
}

interface ComplianceAudit {
  summary: {
    overallScore: number;
    areasAssessed: number;
    totalGaps: number;
    criticalGaps: number;
    complianceStatus: 'compliant' | 'at-risk' | 'non-compliant';
    topRisk: string;
  };
  areas: ComplianceArea[];
  gaps: ComplianceGap[];
  metrics: ComplianceMetric[];
  strengths: string[];
  recommendations: string[];
}

const STATUS_COLORS = {
  compliant: { bg: 'bg-green-100', text: 'text-green-700', label: 'Compliant' },
  partial: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Partial' },
  'non-compliant': { bg: 'bg-red-100', text: 'text-red-700', label: 'Non-Compliant' },
  'not-assessed': { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Not Assessed' },
};

const SEVERITY_COLORS = {
  critical: { bg: 'bg-red-100', text: 'text-red-700' },
  high: { bg: 'bg-orange-100', text: 'text-orange-700' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  low: { bg: 'bg-blue-100', text: 'text-blue-700' },
};

export default function ComplianceAuditPage() {
  const [complianceInfo, setComplianceInfo] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ComplianceAudit | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'areas' | 'gaps' | 'metrics'>('areas');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const runAudit = async () => {
    if (!complianceInfo.trim() && files.length === 0) {
      setError('Please provide compliance information or upload documents');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));
      formData.append('complianceInfo', complianceInfo);

      const response = await fetch('/api/skills/cco/compliance-audit', {
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
      setError(err instanceof Error ? err.message : 'Failed to run compliance audit');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearAll = () => {
    setComplianceInfo('');
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
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Compliance Audit</h1>
                <p className="text-gray-500 text-sm">Casey will evaluate your regulatory compliance</p>
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
              <h3 className="font-semibold text-gray-900 mb-4">Describe Your Compliance Landscape</h3>
              <textarea
                value={complianceInfo}
                onChange={(e) => setComplianceInfo(e.target.value)}
                placeholder="Describe your compliance requirements and current state:

• Industry and applicable regulations (GDPR, HIPAA, SOC 2, PCI-DSS, etc.)
• Current compliance certifications
• Recent audit findings or concerns
• Data handling practices
• Security controls in place

Example:
B2B SaaS company handling customer data
Applicable frameworks: SOC 2 Type II, GDPR, CCPA

Current state:
- SOC 2 Type II certified (last audit 6 months ago)
- GDPR: Privacy policy updated, DPA templates in place
- CCPA: Not yet addressed
- Data encryption at rest and in transit
- No formal incident response plan documented"
                className="w-full h-64 px-4 py-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-slate-500 text-gray-900"
              />
            </div>

            {/* File Upload */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Upload Compliance Documents (Optional)</h3>
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer hover:border-slate-400 hover:bg-slate-50 transition-colors">
                <span className="text-2xl mb-2">📋</span>
                <p className="text-gray-600 text-sm">Policies, audit reports, certifications, assessments</p>
                <input type="file" multiple className="hidden" onChange={handleFileSelect} accept=".pdf,.doc,.docx,.txt,.csv,.xlsx" />
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
              onClick={runAudit}
              disabled={isAnalyzing || (!complianceInfo.trim() && files.length === 0)}
              className="w-full px-6 py-3 bg-slate-700 text-white font-semibold rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Running Audit...
                </>
              ) : (
                <>✅ Run Compliance Audit</>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-white rounded-xl border p-6">
              <div className="grid gap-4 md:grid-cols-5">
                <div className="p-4 bg-slate-50 rounded-lg text-center">
                  <p className={`text-3xl font-bold ${getScoreColor(result.summary.overallScore)}`}>{result.summary.overallScore}</p>
                  <p className="text-sm text-slate-600">Compliance Score</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-gray-700">{result.summary.areasAssessed}</p>
                  <p className="text-xs text-gray-500">Areas Assessed</p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-yellow-700">{result.summary.totalGaps}</p>
                  <p className="text-xs text-yellow-600">Total Gaps</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-red-700">{result.summary.criticalGaps}</p>
                  <p className="text-xs text-red-600">Critical Gaps</p>
                </div>
                <div className={`p-4 rounded-lg ${
                  result.summary.complianceStatus === 'compliant' ? 'bg-green-50' :
                  result.summary.complianceStatus === 'at-risk' ? 'bg-yellow-50' : 'bg-red-50'
                }`}>
                  <p className={`text-lg font-bold capitalize ${
                    result.summary.complianceStatus === 'compliant' ? 'text-green-700' :
                    result.summary.complianceStatus === 'at-risk' ? 'text-yellow-700' : 'text-red-700'
                  }`}>{result.summary.complianceStatus.replace('-', ' ')}</p>
                  <p className="text-xs text-gray-600">Status</p>
                </div>
              </div>
              {result.summary.topRisk && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800"><strong>⚠️ Top Risk:</strong> {result.summary.topRisk}</p>
                </div>
              )}
            </div>

            {/* Strengths */}
            {result.strengths.length > 0 && (
              <div className="bg-green-50 rounded-xl border border-green-200 p-6">
                <h3 className="font-semibold text-green-800 mb-3">✅ Compliance Strengths</h3>
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
                  onClick={() => setActiveTab('areas')}
                  className={`flex-1 px-4 py-3 text-sm font-medium ${activeTab === 'areas' ? 'bg-slate-50 text-slate-700 border-b-2 border-slate-500' : 'text-gray-500'}`}
                >
                  Compliance Areas ({result.areas.length})
                </button>
                <button
                  onClick={() => setActiveTab('gaps')}
                  className={`flex-1 px-4 py-3 text-sm font-medium ${activeTab === 'gaps' ? 'bg-slate-50 text-slate-700 border-b-2 border-slate-500' : 'text-gray-500'}`}
                >
                  Gaps ({result.gaps.length})
                </button>
                <button
                  onClick={() => setActiveTab('metrics')}
                  className={`flex-1 px-4 py-3 text-sm font-medium ${activeTab === 'metrics' ? 'bg-slate-50 text-slate-700 border-b-2 border-slate-500' : 'text-gray-500'}`}
                >
                  Metrics
                </button>
              </div>

              <div className="max-h-[500px] overflow-y-auto">
                {activeTab === 'areas' && (
                  <div className="divide-y">
                    {result.areas.map((area, index) => {
                      const status = STATUS_COLORS[area.status];
                      return (
                        <div key={index} className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="font-medium text-gray-900">{area.name}</h4>
                              <p className="text-sm text-gray-500">{area.framework}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm ${status.bg} ${status.text}`}>
                              {status.label}
                            </span>
                          </div>
                          <div className="grid grid-cols-4 gap-2">
                            <div className="text-center p-2 bg-gray-50 rounded">
                              <p className={`font-bold ${getScoreColor(area.score)}`}>{area.score}%</p>
                              <p className="text-xs text-gray-500">Score</p>
                            </div>
                            <div className="text-center p-2 bg-gray-50 rounded">
                              <p className="font-bold text-yellow-600">{area.gaps}</p>
                              <p className="text-xs text-gray-500">Gaps</p>
                            </div>
                            <div className="text-center p-2 bg-gray-50 rounded">
                              <p className="font-bold text-red-600">{area.criticalGaps}</p>
                              <p className="text-xs text-gray-500">Critical</p>
                            </div>
                            <div className="text-center p-2 bg-gray-50 rounded">
                              <p className="text-sm font-medium text-gray-700">{area.lastAssessed}</p>
                              <p className="text-xs text-gray-500">Last Assessed</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {activeTab === 'gaps' && (
                  <div className="divide-y">
                    {result.gaps.map((gap) => {
                      const colors = SEVERITY_COLORS[gap.severity];
                      return (
                        <div key={gap.id} className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-gray-900">{gap.requirement}</h4>
                                <span className={`px-2 py-0.5 text-xs rounded-full ${colors.bg} ${colors.text}`}>{gap.severity}</span>
                              </div>
                              <p className="text-sm text-gray-500">{gap.area} • {gap.framework}</p>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded ${
                              gap.effort === 'low' ? 'bg-green-100 text-green-700' :
                              gap.effort === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {gap.effort} effort
                            </span>
                          </div>
                          <div className="grid gap-2 md:grid-cols-2 mb-2">
                            <div className="p-2 bg-red-50 rounded">
                              <p className="text-xs text-red-600 font-medium">Current State</p>
                              <p className="text-sm text-red-800">{gap.currentState}</p>
                            </div>
                            <div className="p-2 bg-green-50 rounded">
                              <p className="text-xs text-green-600 font-medium">Required State</p>
                              <p className="text-sm text-green-800">{gap.requiredState}</p>
                            </div>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-lg">
                            <p className="text-sm text-slate-800">💡 <strong>Remediation:</strong> {gap.remediation}</p>
                            {gap.deadline && <p className="text-xs text-slate-600 mt-1">📅 Deadline: {gap.deadline}</p>}
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
                          <div className="flex items-center gap-2">
                            <span className={`text-sm ${
                              metric.trend === 'improving' ? 'text-green-600' :
                              metric.trend === 'declining' ? 'text-red-600' : 'text-gray-600'
                            }`}>
                              {metric.trend === 'improving' ? '↑' : metric.trend === 'declining' ? '↓' : '→'}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              metric.status === 'met' ? 'bg-green-100 text-green-700' :
                              metric.status === 'at-risk' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {metric.status}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-2xl font-bold text-gray-900">{metric.value}</span>
                          <span className="text-sm text-gray-500">Target: {metric.target}</span>
                        </div>
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
                    <span className="flex-shrink-0 w-6 h-6 bg-slate-100 text-slate-700 rounded-full flex items-center justify-center text-sm font-bold">{index + 1}</span>
                    <p className="text-gray-700">{rec}</p>
                  </li>
                ))}
              </ol>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button onClick={clearAll} className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
                New Audit
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
