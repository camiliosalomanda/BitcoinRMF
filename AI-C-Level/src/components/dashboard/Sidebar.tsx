'use client';

/**
 * Sidebar Navigation Component
 * Professional executive-level design
 */

import React from 'react';
import { useRouter } from 'next/navigation';
import { ExecutiveRole } from '@/types/executives';
import UserMenu from './UserMenu';
import CompanySwitcher from '@/components/CompanySwitcher';

interface SidebarProps {
  activeExecutive: ExecutiveRole | 'group' | null;
  onSelectExecutive: (role: ExecutiveRole | 'group') => void;
  isOpen: boolean;
  onToggle: () => void;
}

// Professional SVG icons for each executive
const ExecutiveIcons: Record<ExecutiveRole | 'group', React.ReactNode> = {
  CFO: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  CMO: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  COO: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  CHRO: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  CTO: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  ),
  CCO: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  group: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
};

// Executive configurations
const EXECUTIVES: Array<{
  role: ExecutiveRole;
  name: string;
  title: string;
  color: string;
  gradient: string;
}> = [
  {
    role: 'CFO',
    name: 'Alex',
    title: 'Chief Financial Officer',
    color: '#10B981',
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    role: 'CMO',
    name: 'Jordan',
    title: 'Chief Marketing Officer',
    color: '#8B5CF6',
    gradient: 'from-violet-500 to-purple-500',
  },
  {
    role: 'COO',
    name: 'Morgan',
    title: 'Chief Operating Officer',
    color: '#F59E0B',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    role: 'CHRO',
    name: 'Taylor',
    title: 'Chief Human Resources Officer',
    color: '#EC4899',
    gradient: 'from-pink-500 to-rose-500',
  },
  {
    role: 'CTO',
    name: 'Riley',
    title: 'Chief Technology Officer',
    color: '#3B82F6',
    gradient: 'from-blue-500 to-indigo-500',
  },
  {
    role: 'CCO',
    name: 'Casey',
    title: 'Chief Compliance Officer',
    color: '#6366F1',
    gradient: 'from-indigo-500 to-violet-500',
  },
];

export default function Sidebar({
  activeExecutive,
  onSelectExecutive,
  isOpen,
  onToggle,
}: SidebarProps) {
  const router = useRouter();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-[#0a0f1a] text-white transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${!isOpen && 'lg:w-20'}`}
      >
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-5 border-b border-white/5">
            <div className={`flex items-center gap-3 ${!isOpen && 'lg:justify-center'}`}>
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-xl flex items-center justify-center font-bold text-lg shadow-lg shadow-emerald-500/20">
                B
              </div>
              {isOpen && (
                <div>
                  <span className="font-semibold text-lg tracking-tight">BizAI</span>
                  <p className="text-[10px] text-gray-500 tracking-wide uppercase">Executive Suite</p>
                </div>
              )}
            </div>
            <button
              onClick={onToggle}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors lg:hidden"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Collapse button (desktop only) */}
          <button
            onClick={onToggle}
            className="hidden lg:flex items-center justify-center p-2 mx-4 mt-4 hover:bg-white/5 rounded-lg transition-colors text-gray-500 hover:text-white"
          >
            <svg
              className={`w-4 h-4 transition-transform ${!isOpen && 'rotate-180'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>

          {/* Company Switcher */}
          <div className="px-4 py-3 border-b border-white/5">
            <CompanySwitcher compact={!isOpen} />
          </div>

          {/* Boardroom - Primary CTA */}
          <div className="px-4 pt-4">
            <button
              onClick={() => onSelectExecutive('group')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeExecutive === 'group'
                  ? 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 shadow-lg shadow-emerald-500/10'
                  : 'bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10'
              } ${isOpen ? '' : 'justify-center'}`}
            >
              <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${
                activeExecutive === 'group' 
                  ? 'bg-gradient-to-br from-emerald-400 to-cyan-500 text-white' 
                  : 'bg-white/10 text-gray-400'
              }`}>
                {ExecutiveIcons.group}
              </div>
              {isOpen && (
                <div className="text-left">
                  <p className={`text-sm font-medium ${activeExecutive === 'group' ? 'text-white' : 'text-gray-300'}`}>
                    Boardroom
                  </p>
                  <p className="text-[10px] text-gray-500">All executives</p>
                </div>
              )}
            </button>
          </div>

          {/* Navigation Links */}
          <div className="px-4 pt-4 pb-2">
            {isOpen && (
              <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-2 px-1">
                Quick Access
              </p>
            )}
            <div className="space-y-1">
              {[
                { href: '/insights', label: 'Insights', icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                )},
                { href: '/documents', label: 'Documents', icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                )},
                { href: '/skills', label: 'Skills', icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                )},
              ].map((item) => (
                <button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-gray-400 hover:text-white hover:bg-white/5 ${
                    isOpen ? '' : 'justify-center'
                  }`}
                >
                  {item.icon}
                  {isOpen && <span className="text-sm">{item.label}</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Executive List */}
          <div className="flex-1 px-4 py-2 overflow-y-auto">
            {isOpen && (
              <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-3 px-1">
                Your Executive Team
              </p>
            )}
            <nav className="space-y-1">
              {EXECUTIVES.map((exec) => {
                const isActive = activeExecutive === exec.role;

                return (
                  <button
                    key={exec.role}
                    onClick={() => onSelectExecutive(exec.role)}
                    className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                      isActive
                        ? 'bg-white/10'
                        : 'hover:bg-white/5'
                    } ${!isOpen && 'lg:justify-center lg:px-2'}`}
                    title={!isOpen ? `${exec.name} - ${exec.role}` : undefined}
                  >
                    {/* Icon */}
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all ${
                        isActive 
                          ? `bg-gradient-to-br ${exec.gradient} text-white shadow-lg` 
                          : 'bg-white/5 text-gray-400 group-hover:text-white group-hover:bg-white/10'
                      }`}
                      style={isActive ? { boxShadow: `0 4px 12px ${exec.color}30` } : {}}
                    >
                      {ExecutiveIcons[exec.role]}
                    </div>
                    
                    {/* Text */}
                    {isOpen && (
                      <div className="flex-1 text-left min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium truncate ${isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                            {exec.name}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                            isActive 
                              ? 'bg-white/20 text-white' 
                              : 'bg-white/5 text-gray-500'
                          }`}>
                            {exec.role}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 truncate mt-0.5">
                          {exec.title}
                        </p>
                      </div>
                    )}

                    {/* Active indicator */}
                    {isActive && isOpen && (
                      <div 
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: exec.color }}
                      />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Footer Links */}
          {isOpen && (
            <div className="px-5 py-3 border-t border-white/5">
              <div className="flex items-center gap-4 text-[10px] text-gray-600">
                <a href="/terms" className="hover:text-gray-400 transition-colors">Terms</a>
                <a href="/privacy" className="hover:text-gray-400 transition-colors">Privacy</a>
                <a href="/ai-disclosure" className="hover:text-gray-400 transition-colors">AI Disclosure</a>
              </div>
            </div>
          )}

          {/* User Menu */}
          <div className="p-4 border-t border-white/5">
            <UserMenu isCollapsed={!isOpen} />
          </div>
        </div>
      </aside>
    </>
  );
}
