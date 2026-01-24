'use client';

/**
 * Group Chat Component (Boardroom)
 * Professional dark theme - chat with all executives
 */

import React, { useState, useRef, useEffect } from 'react';
import { ExecutiveRole } from '@/types/executives';
import { useAppStore } from '@/lib/store';
import Link from 'next/link';

interface ExecutiveResponse {
  executive: ExecutiveRole;
  name: string;
  response: string;
  tokens: number;
}

interface GroupMessage {
  id: string;
  type: 'user' | 'responses';
  content?: string;
  responses?: ExecutiveResponse[];
  timestamp: Date;
}

const EXECUTIVE_INFO: Record<ExecutiveRole, { name: string; color: string; title: string; gradient: string }> = {
  CFO: { name: 'Alex', color: '#10B981', title: 'Chief Financial Officer', gradient: 'from-emerald-500 to-teal-500' },
  CMO: { name: 'Jordan', color: '#8B5CF6', title: 'Chief Marketing Officer', gradient: 'from-violet-500 to-purple-500' },
  COO: { name: 'Morgan', color: '#F59E0B', title: 'Chief Operating Officer', gradient: 'from-amber-500 to-orange-500' },
  CHRO: { name: 'Taylor', color: '#EC4899', title: 'Chief HR Officer', gradient: 'from-pink-500 to-rose-500' },
  CTO: { name: 'Riley', color: '#3B82F6', title: 'Chief Technology Officer', gradient: 'from-blue-500 to-indigo-500' },
  CCO: { name: 'Casey', color: '#6366F1', title: 'Chief Compliance Officer', gradient: 'from-indigo-500 to-violet-500' },
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

export default function GroupChat() {
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  const { companyContext } = useAppStore();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: GroupMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }

    try {
      const response = await fetch('/api/chat/group', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          companyContext,
        }),
      });

      if (!response.ok) throw new Error('Failed to get responses');

      const data = await response.json();

      const responsesMessage: GroupMessage = {
        id: `responses-${Date.now()}`,
        type: 'responses',
        responses: data.responses,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, responsesMessage]);
    } catch (error) {
      console.error('Group chat error:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          type: 'responses',
          responses: [{
            executive: 'CFO',
            name: 'System',
            response: 'Unable to connect to executive team. Please try again.',
            tokens: 0,
          }],
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0d1117]">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/5 bg-[#0a0f1a]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Executive Boardroom</h2>
            <p className="text-sm text-gray-500">Strategic consultation with your full executive team</p>
          </div>
        </div>
        {/* Executive indicators */}
        <div className="flex gap-2 mt-4">
          {(Object.entries(EXECUTIVE_INFO) as [ExecutiveRole, typeof EXECUTIVE_INFO[ExecutiveRole]][]).map(([role, info]) => (
            <div
              key={role}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 border border-white/5"
              title={`${info.name} - ${info.title}`}
            >
              <div 
                className="w-5 h-5 rounded flex items-center justify-center text-white"
                style={{ backgroundColor: info.color }}
              >
                {ExecutiveIcons[role]}
              </div>
              <span className="text-[10px] text-gray-400">{info.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-lg">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Consult Your Executive Team
              </h3>
              <p className="text-gray-500 mb-6">
                Present a strategic question or challenge, and receive coordinated insights from all six executives.
              </p>
              
              {/* Suggested topics */}
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 text-left">
                <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-3">Strategic Topics</p>
                <div className="space-y-2">
                  {[
                    'Market expansion opportunities and risks',
                    'Cost optimization strategies',
                    'Quarterly priority alignment',
                  ].map((topic, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(topic)}
                      className="w-full text-left text-sm text-gray-400 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                      </svg>
                      {topic}
                    </button>
                  ))}
                </div>
              </div>

              {/* Disclaimer */}
              <div className="mt-6 bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3">
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div className="text-left">
                    <p className="text-xs text-amber-200/80">
                      AI-generated strategic insights for informational purposes only.
                    </p>
                    <Link href="/ai-disclosure" className="text-[10px] text-amber-500/70 hover:text-amber-400 mt-1 inline-block">
                      Learn more →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Inline disclaimer */}
            <div className="mb-4 bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2 flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-[10px] text-gray-500">
                AI-generated content • Not professional advice • <Link href="/ai-disclosure" className="text-gray-400 hover:text-white">Disclaimer</Link>
              </p>
            </div>
            
            {messages.map((msg) => (
              <div key={msg.id} className="mb-6">
                {msg.type === 'user' ? (
                  <div className="flex justify-end">
                    <div className="flex items-start gap-3 max-w-[80%]">
                      <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-2xl rounded-br-sm px-4 py-3">
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        <p className="text-[10px] text-emerald-100 mt-2">
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-white/10 border border-white/10">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-[10px] text-gray-600 text-center uppercase tracking-wider">
                      Executive Responses • {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <div className="grid gap-3 md:grid-cols-2">
                      {msg.responses?.map((resp) => {
                        const info = EXECUTIVE_INFO[resp.executive];
                        return (
                          <div
                            key={resp.executive}
                            className="bg-[#1a1f2e] rounded-xl p-4 border border-white/5"
                          >
                            <div className="flex items-center gap-3 mb-3 pb-3 border-b border-white/5">
                              <div 
                                className={`w-8 h-8 rounded-lg flex items-center justify-center text-white bg-gradient-to-br ${info.gradient}`}
                                style={{ boxShadow: `0 4px 12px ${info.color}30` }}
                              >
                                {ExecutiveIcons[resp.executive]}
                              </div>
                              <div>
                                <span className="font-medium text-white text-sm">{info.name}</span>
                                <span className="text-gray-500 text-xs ml-2">{resp.executive}</span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-300 leading-relaxed">
                              {resp.response}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-center py-6">
                <div className="flex items-center gap-4 bg-white/[0.02] border border-white/5 rounded-xl px-6 py-4">
                  <div className="flex gap-1.5">
                    {(Object.entries(EXECUTIVE_INFO) as [ExecutiveRole, typeof EXECUTIVE_INFO[ExecutiveRole]][]).map(([role, info], i) => (
                      <div
                        key={role}
                        className="w-6 h-6 rounded-lg flex items-center justify-center text-white animate-pulse"
                        style={{ 
                          backgroundColor: info.color,
                          animationDelay: `${i * 0.1}s`
                        }}
                      >
                        {ExecutiveIcons[role]}
                      </div>
                    ))}
                  </div>
                  <span className="text-sm text-gray-400">Executives deliberating...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="px-6 py-4 border-t border-white/5 bg-[#0a0f1a]">
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Present a strategic question to your executive team..."
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 text-sm text-white placeholder-gray-500 transition-all"
              rows={1}
              style={{ minHeight: '48px', maxHeight: '150px' }}
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className={`px-5 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
              !input.trim() || isLoading
                ? 'bg-white/5 text-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-400 hover:to-cyan-400 shadow-lg shadow-emerald-500/20'
            }`}
          >
            {isLoading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Consulting...</span>
              </>
            ) : (
              <>
                <span>Consult Team</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </>
            )}
          </button>
        </div>
        <p className="text-[10px] text-gray-600 mt-2">
          Press Enter to send • All six executives will provide their perspective
        </p>
      </form>
    </div>
  );
}
