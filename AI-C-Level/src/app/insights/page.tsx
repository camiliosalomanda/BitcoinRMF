'use client';

/**
 * Executive Insights Dashboard
 * Professional dark theme
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { ExecutiveRole } from '@/types/executives';
import { useInsightsStore, Insight } from '@/lib/insightsStore';

const EXECUTIVE_INFO: Record<ExecutiveRole, { name: string; color: string; gradient: string }> = {
  CFO: { name: 'Alex', color: '#10B981', gradient: 'from-emerald-500 to-teal-500' },
  CMO: { name: 'Jordan', color: '#8B5CF6', gradient: 'from-violet-500 to-purple-500' },
  COO: { name: 'Morgan', color: '#F59E0B', gradient: 'from-amber-500 to-orange-500' },
  CHRO: { name: 'Taylor', color: '#EC4899', gradient: 'from-pink-500 to-rose-500' },
  CTO: { name: 'Riley', color: '#3B82F6', gradient: 'from-blue-500 to-indigo-500' },
  CCO: { name: 'Casey', color: '#6366F1', gradient: 'from-indigo-500 to-violet-500' },
};

const ExecutiveIcons: Record<ExecutiveRole, React.ReactNode> = {
  CFO: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  CMO: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
  COO: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  CHRO: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  CTO: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>,
  CCO: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
};

const TypeIcons: Record<Insight['type'], React.ReactNode> = {
  opportunity: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  risk: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
  recommendation: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
  alert: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
  trend: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
};

function timeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function InsightsPage() {
  const { data: session, status } = useSession();
  const { insights, updateStatus, dismissInsight } = useInsightsStore();
  const [filter, setFilter] = useState<'all' | ExecutiveRole>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | Insight['type']>('all');
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null);

  const updateInsightStatus = (id: string, newStatus: Insight['status']) => {
    if (newStatus === 'dismissed') {
      dismissInsight(id);
    } else {
      updateStatus(id, newStatus);
    }
  };

  const filteredInsights = insights.filter(i => {
    if (filter !== 'all' && i.executive !== filter) return false;
    if (typeFilter !== 'all' && i.type !== typeFilter) return false;
    return i.status !== 'dismissed';
  });

  const sortedInsights = [...filteredInsights].sort((a, b) => {
    const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    if (a.status === 'new' && b.status !== 'new') return -1;
    if (b.status === 'new' && a.status !== 'new') return 1;
    return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
  });

  const stats = {
    total: insights.filter(i => i.status !== 'dismissed').length,
    new: insights.filter(i => i.status === 'new').length,
    actionRequired: insights.filter(i => i.actionRequired && i.status !== 'actioned' && i.status !== 'dismissed').length,
    critical: insights.filter(i => i.urgency === 'critical' && i.status !== 'dismissed').length,
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400">
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Loading insights...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117]">
      {/* Header */}
      <header className="bg-[#0a0f1a] border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-white">Executive Insights</h1>
                <p className="text-sm text-gray-500">AI-generated strategic intelligence</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Insights', value: stats.total, color: 'white' },
            { label: 'New', value: stats.new, color: 'emerald' },
            { label: 'Action Required', value: stats.actionRequired, color: 'amber' },
            { label: 'Critical', value: stats.critical, color: 'red' },
          ].map((stat) => (
            <div key={stat.label} className="bg-[#1a1f2e] border border-white/5 rounded-xl p-4">
              <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">{stat.label}</p>
              <p className={`text-2xl font-semibold mt-1 ${
                stat.color === 'emerald' ? 'text-emerald-400' :
                stat.color === 'amber' ? 'text-amber-400' :
                stat.color === 'red' ? 'text-red-400' : 'text-white'
              }`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Executive:</span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | ExecutiveRole)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="all">All Executives</option>
              {Object.entries(EXECUTIVE_INFO).map(([role, info]) => (
                <option key={role} value={role}>{info.name} ({role})</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as 'all' | Insight['type'])}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="all">All Types</option>
              <option value="alert">Alerts</option>
              <option value="risk">Risks</option>
              <option value="opportunity">Opportunities</option>
              <option value="recommendation">Recommendations</option>
              <option value="trend">Trends</option>
            </select>
          </div>
        </div>

        {/* Insights List */}
        <div className="space-y-3">
          {sortedInsights.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No insights yet</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                Insights are generated as you interact with your executive team. Start conversations to receive strategic intelligence.
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl font-medium hover:from-emerald-400 hover:to-cyan-400 transition-all shadow-lg shadow-emerald-500/20"
              >
                Go to Dashboard
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          ) : (
            sortedInsights.map((insight) => {
              const execInfo = EXECUTIVE_INFO[insight.executive];
              const isExpanded = expandedInsight === insight.id;

              return (
                <div
                  key={insight.id}
                  className={`bg-[#1a1f2e] rounded-xl border transition-all ${
                    insight.status === 'new' ? 'border-l-2' : 'border-white/5'
                  }`}
                  style={{ borderLeftColor: insight.status === 'new' ? execInfo.color : undefined }}
                >
                  <div
                    className="p-4 cursor-pointer"
                    onClick={() => {
                      setExpandedInsight(isExpanded ? null : insight.id);
                      if (insight.status === 'new') updateInsightStatus(insight.id, 'viewed');
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white bg-gradient-to-br ${execInfo.gradient}`}
                        style={{ boxShadow: `0 4px 12px ${execInfo.color}30` }}
                      >
                        {ExecutiveIcons[insight.executive]}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-gray-400">{TypeIcons[insight.type]}</span>
                          <h3 className="font-medium text-white truncate">{insight.title}</h3>
                          {insight.status === 'new' && (
                            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-medium rounded-full border border-emerald-500/30">
                              New
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-400 line-clamp-2">{insight.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span style={{ color: execInfo.color }}>{execInfo.name} • {insight.executive}</span>
                          <span>{insight.category}</span>
                          <span>{timeAgo(insight.createdAt)}</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-medium border ${
                          insight.urgency === 'critical' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                          insight.urgency === 'high' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                          insight.urgency === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                          'bg-white/5 text-gray-400 border-white/10'
                        }`}>
                          {insight.urgency.toUpperCase()}
                        </span>
                        {insight.actionRequired && insight.status !== 'actioned' && (
                          <span className="px-2 py-1 bg-amber-500/20 text-amber-400 rounded-lg text-[10px] font-medium border border-amber-500/30">
                            Action Required
                          </span>
                        )}
                      </div>

                      <svg className={`w-5 h-5 text-gray-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-white/5">
                      <div className="pt-4 space-y-4">
                        <div>
                          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Details</h4>
                          <p className="text-sm text-gray-300">{insight.description}</p>
                        </div>

                        {insight.suggestedActions.length > 0 && (
                          <div>
                            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Suggested Actions</h4>
                            <ul className="space-y-2">
                              {insight.suggestedActions.map((action, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                                  <svg className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                  {action}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {insight.relatedExecutives.length > 0 && (
                          <div>
                            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Related Executives</h4>
                            <div className="flex gap-2">
                              {insight.relatedExecutives.map((exec) => {
                                const info = EXECUTIVE_INFO[exec];
                                return (
                                  <div key={exec} className="flex items-center gap-1.5 px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-sm">
                                    <div className="w-5 h-5 rounded flex items-center justify-center text-white" style={{ backgroundColor: info.color }}>
                                      {ExecutiveIcons[exec]}
                                    </div>
                                    <span className="text-gray-300">{info.name}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2 pt-2">
                          <Link
                            href="/dashboard"
                            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-sm font-medium rounded-lg hover:from-emerald-400 hover:to-cyan-400 transition-all"
                          >
                            Chat with {execInfo.name}
                          </Link>
                          {insight.status !== 'actioned' && (
                            <button
                              onClick={() => updateInsightStatus(insight.id, 'actioned')}
                              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-medium rounded-lg transition-colors border border-white/10"
                            >
                              Mark as Done
                            </button>
                          )}
                          {insight.status !== 'dismissed' && (
                            <button
                              onClick={() => updateInsightStatus(insight.id, 'dismissed')}
                              className="px-4 py-2 text-gray-500 hover:text-gray-300 text-sm font-medium transition-colors"
                            >
                              Dismiss
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
