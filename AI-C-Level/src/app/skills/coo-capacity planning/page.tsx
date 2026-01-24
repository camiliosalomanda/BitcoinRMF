'use client';

/**
 * COO Capacity Planning Skill
 * Analyze resource utilization and forecast capacity needs
 */

import React, { useState } from 'react';
import Link from 'next/link';

interface ResourceUtilization {
  resource: string;
  type: 'team' | 'equipment' | 'facility' | 'software' | 'budget';
  currentCapacity: number;
  currentUtilization: number;
  utilizationStatus: 'under' | 'optimal' | 'high' | 'critical';
  trend: 'increasing' | 'stable' | 'decreasing';
  forecast3Month: number;
  forecast6Month: number;
}

interface CapacityIssue {
  id: string;
  resource: string;
  type: 'bottleneck' | 'overutilization' | 'underutilization' | 'scaling' | 'cost';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  recommendation: string;
  estimatedCost: string;
}

interface Forecast {
  period: string;
  demandGrowth: string;
  capacityNeeded: string;
  gap: string;
  action: string;
}

interface CapacityAnalysis {
  summary: {
    overallUtilization: number;
    capacityHealth: 'healthy' | 'strained' | 'critical';
    biggestBottleneck: string;
    scalingUrgency: 'none' | 'low' | 'medium' | 'high' | 'critical';
  };
  resources: ResourceUtilization[];
  issues: CapacityIssue[];
  forecasts: Forecast[];
  scalingOptions: string[];
  recommendations: string[];
}

const TYPE_ICONS = {
  team: '👥',
  equipment: '🔧',
  facility: '🏢',
  software: '💻',
  budget: '💰',
};

const UTILIZATION_COLORS = {
  under: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Under-utilized' },
  optimal: { bg: 'bg-green-100', text: 'text-green-700', label: 'Optimal' },
  high: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'High' },
  critical: { bg: 'bg-red-100', text: 'text-red-700', label: 'Critical' },
};

const SEVERITY_COLORS = {
  critical: { bg: 'bg-red-100', text: 'text-red-700' },
  high: { bg: 'bg-orange-100', text: 'text-orange-700' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  low: { bg: 'bg-blue-100', text: 'text-blue-700' },
};

export default function CapacityPlanningPage() {
  const [capacityInfo, setCapacityInfo] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<CapacityAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'resources' | 'issues' | 'forecast'>('resources');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const runAnalysis = async () => {
    if (!capacityInfo.trim() && files.length === 0) {
      setError('Please provide capacity information or upload data');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));
      formData.append('capacityInfo', capacityInfo);

      const response = await fetch('/api/skills/coo/capacity-planning', {
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
      setError(err instanceof Error ? err.message : 'Failed to analyze capacity');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearAll = () => {
    setCapacityInfo('');
    setFiles([]);
    setResult(null);
    setError(null);
  };

  const getUtilizationBarColor = (util: number) => {
    if (util < 50) return 'bg-blue-500';
    if (util < 75) return 'bg-green-500';
    if (util < 90) return 'bg-yellow-500';
    return 'bg-red-500';
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
                <span className="text-2xl">📈</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Capacity Planning</h1>
                <p className="text-gray-500 text-sm">Morgan will analyze resource utilization and forecast needs</p>
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
              <h3 className="font-semibold text-gray-900 mb-4">Describe Your Resources & Capacity</h3>
              <textarea
                value={capacityInfo}
                onChange={(e) => setCapacityInfo(e.target.value)}
                placeholder="Tell me about your current capacity situation:

• Team size and current workload
• Equipment/infrastructure utilization
• Current bottlenecks or constraints
• Expected growth or changes
• Seasonal patterns

Example:
We have a team of 12 developers working on 3 products.
Current sprint velocity: 85 story points/sprint (target: 100)
Our AWS infrastructure is at 70% capacity.
Customer support handles 500 tickets/week with 4 agents (target: 400/week).
We expect 30% growth in the next 6 months.
Biggest bottleneck: QA testing - only 2 QA engineers for all products."
                className="w-full h-56 px-4 py-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-900"
              />
            </div>

            {/* File Upload */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Upload Capacity Data (Optional)</h3>
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer hover:border-amber-400 hover:bg-amber-50 transition-colors">
                <span className="text-2xl mb-2">📊</span>
                <p className="text-gray-600 text-sm">Resource reports, utilization data, forecasts</p>
                <input type="file" multiple className="hidden" onChange={handleFileSelect} accept=".csv,.xlsx,.xls,.pdf,.txt" />
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
              disabled={isAnalyzing || (!capacityInfo.trim() && files.length === 0)}
              className="w-full px-6 py-3 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Analyzing Capacity...
                </>
              ) : (
                <>📈 Run Capacity Analysis</>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-white rounded-xl border p-6">
              <div className="grid gap-4 md:grid-cols-4">
                <div className="p-4 bg-amber-50 rounded-lg text-center">
                  <p className="text-3xl font-bold text-amber-700">{result.summary.overallUtilization}%</p>
                  <p className="text-sm text-amber-600">Overall Utilization</p>
                </div>
                <div className="p-4 rounded-lg text-center" style={{
                  backgroundColor: result.summary.capacityHealth === 'healthy' ? '#dcfce7' :
                    result.summary.capacityHealth === 'strained' ? '#fef9c3' : '#fee2e2'
                }}>
                  <p className={`text-xl font-bold capitalize ${
                    result.summary.capacityHealth === 'healthy' ? 'text-green-700' :
                    result.summary.capacityHealth === 'strained' ? 'text-yellow-700' : 'text-red-700'
                  }`}>{result.summary.capacityHealth}</p>
                  <p className="text-sm text-gray-600">Capacity Health</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="text-sm font-medium text-red-700">{result.summary.biggestBottleneck}</p>
                  <p className="text-xs text-red-600">Biggest Bottleneck</p>
                </div>
                <div className="p-4 rounded-lg" style={{
                  backgroundColor: result.summary.scalingUrgency === 'none' ? '#f3f4f6' :
                    result.summary.scalingUrgency === 'low' ? '#dbeafe' :
                    result.summary.scalingUrgency === 'medium' ? '#fef9c3' :
                    result.summary.scalingUrgency === 'high' ? '#fed7aa' : '#fee2e2'
                }}>
                  <p className={`text-lg font-bold capitalize ${
                    result.summary.scalingUrgency === 'critical' ? 'text-red-700' :
                    result.summary.scalingUrgency === 'high' ? 'text-orange-700' :
                    result.summary.scalingUrgency === 'medium' ? 'text-yellow-700' : 'text-gray-700'
                  }`}>{result.summary.scalingUrgency}</p>
                  <p className="text-sm text-gray-600">Scaling Urgency</p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl border overflow-hidden">
              <div className="flex border-b">
                <button
                  onClick={() => setActiveTab('resources')}
                  className={`flex-1 px-4 py-3 text-sm font-medium ${activeTab === 'resources' ? 'bg-amber-50 text-amber-700 border-b-2 border-amber-500' : 'text-gray-500'}`}
                >
                  Resources ({result.resources.length})
                </button>
                <button
                  onClick={() => setActiveTab('issues')}
                  className={`flex-1 px-4 py-3 text-sm font-medium ${activeTab === 'issues' ? 'bg-amber-50 text-amber-700 border-b-2 border-amber-500' : 'text-gray-500'}`}
                >
                  Issues ({result.issues.length})
                </button>
                <button
                  onClick={() => setActiveTab('forecast')}
                  className={`flex-1 px-4 py-3 text-sm font-medium ${activeTab === 'forecast' ? 'bg-amber-50 text-amber-700 border-b-2 border-amber-500' : 'text-gray-500'}`}
                >
                  Forecast
                </button>
              </div>

              <div className="max-h-[500px] overflow-y-auto">
                {activeTab === 'resources' && (
                  <div className="divide-y">
                    {result.resources.map((resource, index) => {
                      const status = UTILIZATION_COLORS[resource.utilizationStatus];
                      return (
                        <div key={index} className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <span className="text-xl">{TYPE_ICONS[resource.type]}</span>
                              <div>
                                <h4 className="font-medium text-gray-900">{resource.resource}</h4>
                                <p className="text-sm text-gray-500 capitalize">{resource.type}</p>
                              </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm ${status.bg} ${status.text}`}>
                              {status.label}
                            </span>
                          </div>
                          <div className="mb-3">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Utilization: {resource.currentUtilization}%</span>
                              <span className="text-gray-500">Capacity: {resource.currentCapacity}</span>
                            </div>
                            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${getUtilizationBarColor(resource.currentUtilization)}`}
                                style={{ width: `${Math.min(resource.currentUtilization, 100)}%` }}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="p-2 bg-gray-50 rounded">
                              <p className="text-xs text-gray-500">Trend</p>
                              <p className="text-sm font-medium capitalize">{resource.trend}</p>
                            </div>
                            <div className="p-2 bg-gray-50 rounded">
                              <p className="text-xs text-gray-500">3 Month</p>
                              <p className={`text-sm font-medium ${resource.forecast3Month > 90 ? 'text-red-600' : 'text-gray-900'}`}>
                                {resource.forecast3Month}%
                              </p>
                            </div>
                            <div className="p-2 bg-gray-50 rounded">
                              <p className="text-xs text-gray-500">6 Month</p>
                              <p className={`text-sm font-medium ${resource.forecast6Month > 90 ? 'text-red-600' : 'text-gray-900'}`}>
                                {resource.forecast6Month}%
                              </p>
                            </div>
                          </div>
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
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-gray-900">{issue.title}</h4>
                                <span className={`px-2 py-0.5 text-xs rounded-full ${colors.bg} ${colors.text}`}>{issue.severity}</span>
                              </div>
                              <p className="text-sm text-gray-500 mb-2">Resource: {issue.resource}</p>
                              <p className="text-sm text-gray-600 mb-2">{issue.description}</p>
                              <p className="text-sm text-orange-700 mb-2"><strong>Impact:</strong> {issue.impact}</p>
                              <p className="text-sm text-gray-500 mb-2"><strong>Est. Cost:</strong> {issue.estimatedCost}</p>
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

                {activeTab === 'forecast' && (
                  <div className="p-4">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Demand Growth</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacity Needed</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gap</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {result.forecasts.map((forecast, index) => (
                            <tr key={index}>
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">{forecast.period}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{forecast.demandGrowth}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{forecast.capacityNeeded}</td>
                              <td className={`px-4 py-3 text-sm font-medium ${forecast.gap.startsWith('-') || forecast.gap === 'None' ? 'text-green-600' : 'text-red-600'}`}>
                                {forecast.gap}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">{forecast.action}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Scaling Options */}
            <div className="bg-amber-50 rounded-xl border border-amber-200 p-6">
              <h3 className="font-semibold text-amber-800 mb-3">📈 Scaling Options</h3>
              <ul className="space-y-2">
                {result.scalingOptions.map((option, index) => (
                  <li key={index} className="flex items-start gap-2 text-amber-700">
                    <span>•</span><span>{option}</span>
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
