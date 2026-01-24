'use client';

/**
 * CFO Budget Analysis Skill
 * Review budgets and identify variances and optimization opportunities
 */

import React, { useState } from 'react';
import Link from 'next/link';

interface BudgetLineItem {
  category: string;
  budgeted: number;
  actual: number;
  variance: number;
  variancePercent: number;
  status: 'under' | 'on-track' | 'over' | 'critical';
  notes: string;
}

interface BudgetInsight {
  id: string;
  type: 'overspend' | 'underspend' | 'opportunity' | 'risk' | 'trend';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  description: string;
  amount: string;
  recommendation: string;
}

interface BudgetAnalysis {
  summary: {
    period: string;
    totalBudget: string;
    totalActual: string;
    totalVariance: string;
    variancePercent: number;
    overallStatus: 'excellent' | 'good' | 'warning' | 'critical';
  };
  lineItems: BudgetLineItem[];
  insights: BudgetInsight[];
  recommendations: string[];
}

const STATUS_COLORS = {
  under: { bg: 'bg-green-100', text: 'text-green-700' },
  'on-track': { bg: 'bg-blue-100', text: 'text-blue-700' },
  over: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  critical: { bg: 'bg-red-100', text: 'text-red-700' },
};

const SEVERITY_COLORS = {
  critical: { bg: 'bg-red-100', text: 'text-red-700' },
  high: { bg: 'bg-orange-100', text: 'text-orange-700' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  low: { bg: 'bg-blue-100', text: 'text-blue-700' },
  info: { bg: 'bg-gray-100', text: 'text-gray-700' },
};

const TYPE_ICONS = {
  overspend: '🔴',
  underspend: '🟢',
  opportunity: '💡',
  risk: '⚠️',
  trend: '📊',
};

export default function BudgetAnalysisPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [budgetData, setBudgetData] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<BudgetAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const runAnalysis = async () => {
    if (files.length === 0 && !budgetData.trim()) {
      setError('Please upload budget files or enter budget data');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));
      formData.append('budgetData', budgetData);

      const response = await fetch('/api/skills/cfo/budget-analysis', {
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
      setError(err instanceof Error ? err.message : 'Failed to analyze budget');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearAll = () => {
    setFiles([]);
    setBudgetData('');
    setResult(null);
    setError(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
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
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">💵</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Budget Analysis</h1>
                <p className="text-gray-500 text-sm">Alex will review your budget and identify variances</p>
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
              <h3 className="font-semibold text-gray-900 mb-4">Upload Budget Documents</h3>
              <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl cursor-pointer hover:border-emerald-400 hover:bg-emerald-50 transition-colors">
                <span className="text-3xl mb-2">📊</span>
                <p className="text-gray-600">Drop budget files here or click to browse</p>
                <p className="text-gray-400 text-sm mt-1">CSV, Excel, PDF with budget vs actual data</p>
                <input type="file" multiple className="hidden" onChange={handleFileSelect} accept=".csv,.xlsx,.xls,.pdf,.txt" />
              </label>
              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  {files.map((file, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-900">📄 {file.name}</span>
                      <button onClick={() => setFiles(files.filter((_, idx) => idx !== i))} className="text-gray-400 hover:text-red-500">✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Manual Entry */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Or Enter Budget Data</h3>
              <textarea
                value={budgetData}
                onChange={(e) => setBudgetData(e.target.value)}
                placeholder="Enter or paste your budget data:

Category, Budgeted, Actual
Marketing, 50000, 62000
Payroll, 150000, 148000
Software, 20000, 25000
Office, 10000, 8500
...

Or describe your budget situation in detail."
                className="w-full h-48 px-4 py-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900"
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
            )}

            <button
              onClick={runAnalysis}
              disabled={isAnalyzing || (files.length === 0 && !budgetData.trim())}
              className="w-full px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Analyzing Budget...
                </>
              ) : (
                <>💵 Run Budget Analysis</>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-white rounded-xl border p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-semibold text-gray-900">Budget Summary</h3>
                  <p className="text-sm text-gray-500">{result.summary.period}</p>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                  result.summary.overallStatus === 'excellent' ? 'bg-green-100 text-green-700' :
                  result.summary.overallStatus === 'good' ? 'bg-blue-100 text-blue-700' :
                  result.summary.overallStatus === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {result.summary.overallStatus.charAt(0).toUpperCase() + result.summary.overallStatus.slice(1)}
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Total Budget</p>
                  <p className="text-xl font-bold text-gray-900">{result.summary.totalBudget}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Total Actual</p>
                  <p className="text-xl font-bold text-gray-900">{result.summary.totalActual}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Variance</p>
                  <p className={`text-xl font-bold ${result.summary.variancePercent > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {result.summary.totalVariance}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Variance %</p>
                  <p className={`text-xl font-bold ${result.summary.variancePercent > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {result.summary.variancePercent > 0 ? '+' : ''}{result.summary.variancePercent.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="bg-white rounded-xl border overflow-hidden">
              <div className="px-6 py-4 border-b bg-gray-50">
                <h3 className="font-semibold text-gray-900">Budget Line Items</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Budgeted</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actual</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Variance</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {result.lineItems.map((item, index) => {
                      const colors = STATUS_COLORS[item.status];
                      return (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.category}</td>
                          <td className="px-4 py-3 text-sm text-right text-gray-600">{formatCurrency(item.budgeted)}</td>
                          <td className="px-4 py-3 text-sm text-right text-gray-600">{formatCurrency(item.actual)}</td>
                          <td className={`px-4 py-3 text-sm text-right font-medium ${item.variance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {item.variance > 0 ? '+' : ''}{formatCurrency(item.variance)} ({item.variancePercent > 0 ? '+' : ''}{item.variancePercent.toFixed(1)}%)
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-1 text-xs rounded-full ${colors.bg} ${colors.text}`}>
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Insights */}
            <div className="bg-white rounded-xl border overflow-hidden">
              <div className="px-6 py-4 border-b bg-gray-50">
                <h3 className="font-semibold text-gray-900">Key Insights</h3>
              </div>
              <div className="divide-y">
                {result.insights.map((insight) => {
                  const colors = SEVERITY_COLORS[insight.severity];
                  return (
                    <div key={insight.id} className="p-4">
                      <div className="flex items-start gap-3">
                        <span className="text-xl">{TYPE_ICONS[insight.type]}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-gray-900">{insight.title}</h4>
                            <span className={`px-2 py-0.5 text-xs rounded-full ${colors.bg} ${colors.text}`}>
                              {insight.severity}
                            </span>
                            <span className="text-sm text-gray-500">{insight.amount}</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                          <div className="p-3 bg-emerald-50 rounded-lg">
                            <p className="text-sm text-emerald-800">💡 {insight.recommendation}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">🎯 Recommended Actions</h3>
              <ol className="space-y-3">
                {result.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-sm font-bold">{index + 1}</span>
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
              <Link href="/dashboard" className="px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors">
                Discuss with Alex
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
