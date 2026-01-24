'use client';

/**
 * Dashboard Page
 * Main interface for interacting with AI executives
 */

import React, { useState } from 'react';
import { ExecutiveRole } from '@/types/executives';
import Sidebar from '@/components/dashboard/Sidebar';
import ExecutiveChat from '@/components/executives/ExecutiveChat';
import GroupChat from '@/components/executives/GroupChat';
import CollaborationPanel from '@/components/executives/CollaborationPanel';
import { useMessagesStore } from '@/lib/messagesStore';

export default function DashboardPage() {
  const [activeExecutive, setActiveExecutive] = useState<ExecutiveRole | 'group' | null>('CFO');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showCollaboration, setShowCollaboration] = useState(true);

  const { messages, markAsRead, markAsActioned } = useMessagesStore();
  const pendingCount = messages.filter((m) => m.status === 'pending').length;

  const handleMessageAction = (messageId: string, action: 'read' | 'action') => {
    if (action === 'read') {
      markAsRead(messageId);
    } else {
      markAsActioned(messageId);
    }
  };

  const handleSelectExecutive = (role: ExecutiveRole | 'group') => {
    setActiveExecutive(role);
  };

  return (
    <div className="flex h-screen bg-[#0d1117]">
      {/* Sidebar */}
      <Sidebar
        activeExecutive={activeExecutive}
        onSelectExecutive={handleSelectExecutive}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#0a0f1a] border-b border-white/10">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-lg flex items-center justify-center font-bold text-white text-sm shadow-lg shadow-emerald-500/25">
              B
            </div>
            <span className="font-semibold text-white">BizAI</span>
          </div>
          <button
            onClick={() => setShowCollaboration(!showCollaboration)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors relative text-white"
          >
            <span className="text-lg">🔗</span>
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-white text-xs rounded-full flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </button>
        </header>

        {/* Desktop collaboration toggle */}
        <div className="hidden lg:flex items-center justify-end px-4 py-2 bg-[#0a0f1a] border-b border-white/10">
          <button
            onClick={() => setShowCollaboration(!showCollaboration)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              showCollaboration
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
            }`}
          >
            <span>🔗</span>
            <span>Collaboration</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.5 bg-emerald-500 text-white text-xs rounded-full">
                {pendingCount}
              </span>
            )}
          </button>
        </div>

        {/* Content area with optional collaboration panel */}
        <div className="flex-1 flex overflow-hidden">
          {/* Chat area */}
          <div className={`flex-1 overflow-hidden ${showCollaboration ? 'lg:mr-96' : ''}`}>
            {activeExecutive === 'group' ? (
              <GroupChat />
            ) : activeExecutive ? (
              <ExecutiveChat executive={activeExecutive} />
            ) : (
              <div className="h-full flex items-center justify-center bg-[#0d1117]">
                <div className="text-center max-w-md px-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/25">
                    <span className="text-4xl">🏢</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-3">
                    Welcome to BizAI
                  </h2>
                  <p className="text-gray-400 mb-6">
                    Your AI-powered executive team is ready to help. Select an
                    executive from the sidebar to start a conversation.
                  </p>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                      <span className="text-2xl">💰</span>
                      <p className="mt-2 font-medium text-white">CFO</p>
                      <p className="text-gray-500 text-xs">Finance</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                      <span className="text-2xl">📈</span>
                      <p className="mt-2 font-medium text-white">CMO</p>
                      <p className="text-gray-500 text-xs">Marketing</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                      <span className="text-2xl">⚙️</span>
                      <p className="mt-2 font-medium text-white">COO</p>
                      <p className="text-gray-500 text-xs">Operations</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                      <span className="text-2xl">💻</span>
                      <p className="mt-2 font-medium text-white">CTO</p>
                      <p className="text-gray-500 text-xs">Technology</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                      <span className="text-2xl">👥</span>
                      <p className="mt-2 font-medium text-white">CHRO</p>
                      <p className="text-gray-500 text-xs">People</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                      <span className="text-2xl">⚖️</span>
                      <p className="mt-2 font-medium text-white">CCO</p>
                      <p className="text-gray-500 text-xs">Compliance</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Collaboration Panel - Fixed right sidebar on desktop */}
          {showCollaboration && (
            <div className="hidden lg:block fixed right-0 top-0 bottom-0 w-96 bg-[#0a0f1a] border-l border-white/10 overflow-y-auto">
              <div className="p-4 pt-20">
                <CollaborationPanel
                  messages={messages}
                  onMessageAction={handleMessageAction}
                  activeExecutive={activeExecutive !== 'group' ? activeExecutive || undefined : undefined}
                  onSelectExecutive={handleSelectExecutive}
                />
              </div>
            </div>
          )}

          {/* Mobile collaboration panel */}
          {showCollaboration && (
            <div className="lg:hidden fixed inset-0 z-50 bg-black/70" onClick={() => setShowCollaboration(false)}>
              <div
                className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-[#0a0f1a] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="sticky top-0 bg-[#0a0f1a] border-b border-white/10 px-4 py-3 flex items-center justify-between">
                  <h3 className="font-semibold text-white">Executive Collaboration</h3>
                  <button
                    onClick={() => setShowCollaboration(false)}
                    className="p-2 hover:bg-white/10 rounded-lg text-white"
                  >
                    ✕
                  </button>
                </div>
                <div className="p-4">
                  <CollaborationPanel
                    messages={messages}
                    onMessageAction={handleMessageAction}
                    activeExecutive={activeExecutive !== 'group' ? activeExecutive || undefined : undefined}
                    onSelectExecutive={(role) => {
                      handleSelectExecutive(role);
                      setShowCollaboration(false);
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
