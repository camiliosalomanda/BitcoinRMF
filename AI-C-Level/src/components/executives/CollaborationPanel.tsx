'use client';

/**
 * Collaboration Panel Component
 * Professional design showing executive activity and quick access
 */

import React, { useState } from 'react';
import { ExecutiveRole } from '@/types/executives';
import ExecutiveMessages, { type ExecutiveMessage } from './ExecutiveMessages';

const EXECUTIVE_INFO: Record<ExecutiveRole, { name: string; color: string; title: string }> = {
  CFO: { name: 'Alex', color: '#10B981', title: 'Chief Financial Officer' },
  CMO: { name: 'Jordan', color: '#8B5CF6', title: 'Chief Marketing Officer' },
  COO: { name: 'Morgan', color: '#F59E0B', title: 'Chief Operating Officer' },
  CHRO: { name: 'Taylor', color: '#EC4899', title: 'Chief HR Officer' },
  CTO: { name: 'Riley', color: '#3B82F6', title: 'Chief Technology Officer' },
  CCO: { name: 'Casey', color: '#6366F1', title: 'Chief Compliance Officer' },
};

// Professional SVG icons
const ExecutiveIcons: Record<ExecutiveRole, React.ReactNode> = {
  CFO: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  CMO: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  COO: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  CHRO: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  CTO: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  ),
  CCO: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
};

const EXECUTIVES: ExecutiveRole[] = ['CFO', 'CMO', 'COO', 'CHRO', 'CTO', 'CCO'];

interface CollaborationPanelProps {
  messages: ExecutiveMessage[];
  onMessageAction?: (messageId: string, action: 'read' | 'action') => void;
  activeExecutive?: ExecutiveRole;
  onSelectExecutive?: (role: ExecutiveRole | 'group') => void;
}

export default function CollaborationPanel({
  messages,
  onMessageAction,
  activeExecutive,
  onSelectExecutive,
}: CollaborationPanelProps) {
  const [view, setView] = useState<'executives' | 'messages'>('executives');

  const getMessageCount = (role: ExecutiveRole) => {
    return messages.filter(
      (m) => m.fromExecutive === role || m.toExecutive === role
    ).length;
  };

  const pendingCount = messages.filter((m) => m.status === 'pending').length;
  const urgentCount = messages.filter((m) => m.priority === 'urgent').length;

  return (
    <div className="bg-[#0d1420] rounded-xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <h3 className="font-medium text-white text-sm">Collaboration</h3>
          </div>

          {/* Tab Toggle */}
          <div className="flex bg-white/5 rounded-lg p-0.5">
            <button
              onClick={() => setView('executives')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                view === 'executives'
                  ? 'bg-white/10 text-white'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              Team
            </button>
            <button
              onClick={() => setView('messages')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all relative ${
                view === 'messages'
                  ? 'bg-white/10 text-white'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              Activity
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-white text-[9px] rounded-full flex items-center justify-center font-medium">
                  {pendingCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {view === 'executives' ? (
        <div className="p-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-white/[0.03] rounded-lg p-3 text-center border border-white/5">
              <p className="text-xl font-semibold text-white">{messages.length}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wide mt-0.5">Total</p>
            </div>
            <div className={`rounded-lg p-3 text-center border ${
              pendingCount > 0 
                ? 'bg-emerald-500/10 border-emerald-500/20' 
                : 'bg-white/[0.03] border-white/5'
            }`}>
              <p className={`text-xl font-semibold ${pendingCount > 0 ? 'text-emerald-400' : 'text-white'}`}>
                {pendingCount}
              </p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wide mt-0.5">Pending</p>
            </div>
            <div className={`rounded-lg p-3 text-center border ${
              urgentCount > 0 
                ? 'bg-red-500/10 border-red-500/20' 
                : 'bg-white/[0.03] border-white/5'
            }`}>
              <p className={`text-xl font-semibold ${urgentCount > 0 ? 'text-red-400' : 'text-white'}`}>
                {urgentCount}
              </p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wide mt-0.5">Urgent</p>
            </div>
          </div>

          {/* Boardroom CTA */}
          <button
            onClick={() => onSelectExecutive?.('group')}
            className="w-full mb-5 p-4 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-xl hover:from-emerald-500/20 hover:to-cyan-500/20 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="text-left">
                <p className="font-medium text-white text-sm group-hover:text-emerald-400 transition-colors">
                  Executive Boardroom
                </p>
                <p className="text-xs text-gray-500">Consult all executives together</p>
              </div>
              <svg className="w-4 h-4 text-gray-600 group-hover:text-emerald-400 ml-auto transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>

          {/* Executive Grid */}
          <div className="mb-4">
            <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-3">
              Quick Access
            </p>
            <div className="grid grid-cols-2 gap-2">
              {EXECUTIVES.map((role) => {
                const info = EXECUTIVE_INFO[role];
                const isActive = activeExecutive === role;
                const msgCount = getMessageCount(role);

                return (
                  <button
                    key={role}
                    onClick={() => onSelectExecutive?.(role)}
                    className={`group p-3 rounded-xl text-left transition-all border ${
                      isActive
                        ? 'bg-white/10 border-white/20'
                        : 'bg-white/[0.02] border-white/5 hover:bg-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                          isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
                        }`}
                        style={{ 
                          backgroundColor: isActive ? info.color : `${info.color}20`,
                        }}
                      >
                        {ExecutiveIcons[role]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className={`text-sm font-medium ${isActive ? 'text-white' : 'text-gray-300'}`}>
                            {info.name}
                          </p>
                          <span className="text-[9px] text-gray-600">{role}</span>
                        </div>
                      </div>
                      {msgCount > 0 && (
                        <span 
                          className="px-1.5 py-0.5 text-[9px] rounded-full text-white font-medium"
                          style={{ backgroundColor: info.color }}
                        >
                          {msgCount}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recent Activity */}
          {messages.length > 0 && (
            <div>
              <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-3">
                Recent Activity
              </p>
              <div className="space-y-2">
                {messages.slice(0, 3).map((msg) => {
                  const fromInfo = EXECUTIVE_INFO[msg.fromExecutive];
                  const toInfo = msg.toExecutive !== 'all' ? EXECUTIVE_INFO[msg.toExecutive as ExecutiveRole] : null;
                  
                  return (
                    <button
                      key={msg.id}
                      onClick={() => onSelectExecutive?.(msg.fromExecutive)}
                      className="w-full flex items-center gap-2.5 text-sm bg-white/[0.02] hover:bg-white/5 rounded-lg px-3 py-2.5 transition-colors text-left border border-white/5 hover:border-white/10"
                    >
                      <div 
                        className="w-6 h-6 rounded flex items-center justify-center text-white"
                        style={{ backgroundColor: fromInfo.color }}
                      >
                        {ExecutiveIcons[msg.fromExecutive]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-300 truncate">{msg.subject}</p>
                        <p className="text-[10px] text-gray-600">
                          {fromInfo.name} → {toInfo?.name || 'All'}
                        </p>
                      </div>
                      {msg.priority === 'urgent' && (
                        <span className="px-1.5 py-0.5 text-[9px] bg-red-500/20 text-red-400 rounded border border-red-500/20 font-medium">
                          Urgent
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              {messages.length > 3 && (
                <button
                  onClick={() => setView('messages')}
                  className="w-full mt-3 text-xs text-gray-500 hover:text-emerald-400 transition-colors flex items-center justify-center gap-1"
                >
                  View all {messages.length} messages
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* Empty State */}
          {messages.length === 0 && (
            <div className="text-center py-6">
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-sm text-gray-400">No activity yet</p>
              <p className="text-xs text-gray-600 mt-1">
                Executive communications will appear here
              </p>
            </div>
          )}
        </div>
      ) : (
        <ExecutiveMessages messages={messages} onMessageAction={onMessageAction} />
      )}
    </div>
  );
}
