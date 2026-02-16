'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Shield,
  Bug,
  Grid3X3,
  Wrench,
  FileCode,
  MessageSquareWarning,
  ChevronLeft,
  ChevronRight,
  X,
  Bitcoin,
  ShieldCheck,
  Plus,
  BookOpen,
  ClipboardList,
  Vote,
} from 'lucide-react';
import SignInButton from '@/components/auth/SignInButton';
import { useUserRole } from '@/hooks/useUserRole';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/threats', label: 'Threat Register', icon: Shield },
  { href: '/vulnerabilities', label: 'Vulnerabilities', icon: Bug },
  { href: '/risk-matrix', label: 'Risk Matrix', icon: Grid3X3 },
  { href: '/remediations', label: 'Remediations', icon: Wrench },
  { href: '/bips', label: 'BIP Evaluator', icon: FileCode },
  { href: '/fud', label: 'FUD Tracker', icon: MessageSquareWarning },
  { href: '/methodology', label: 'Methodology', icon: BookOpen },
];

const SUBMIT_ITEMS = [
  { href: '/threats/submit', label: 'Submit Threat' },
  { href: '/vulnerabilities/submit', label: 'Submit Vulnerability' },
  { href: '/fud/submit', label: 'Submit FUD' },
];

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { isAuthenticated, isAdmin } = useUserRole();

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
        className={`fixed lg:static inset-y-0 left-0 z-50 bg-[#0a0f1a] text-white transform transition-all duration-300 ease-in-out ${
          isOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0 lg:w-20'
        }`}
      >
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#f7931a]/5 via-transparent to-transparent pointer-events-none" />

        <div className="relative flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-5 border-b border-white/5">
            <div className={`flex items-center gap-3 ${!isOpen && 'lg:justify-center'}`}>
              <div className="w-10 h-10 bg-gradient-to-br from-[#f7931a] to-amber-600 rounded-xl flex items-center justify-center font-bold text-lg shadow-lg shadow-[#f7931a]/20">
                <Bitcoin size={22} />
              </div>
              {isOpen && (
                <div>
                  <span className="font-semibold text-lg tracking-tight">Bitcoin RMF</span>
                  <p className="text-[10px] text-gray-500 tracking-wide uppercase">Risk Framework</p>
                </div>
              )}
            </div>
            <button
              onClick={onToggle}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors lg:hidden"
            >
              <X size={18} />
            </button>
          </div>

          {/* Collapse button (desktop) */}
          <button
            onClick={onToggle}
            className="hidden lg:flex items-center justify-center p-2 mx-4 mt-4 hover:bg-white/5 rounded-lg transition-colors text-gray-500 hover:text-white"
          >
            {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {isOpen && (
              <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-3 px-3">
                Navigation
              </p>
            )}
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                    isActive
                      ? 'bg-[#f7931a]/10 text-[#f7931a] border border-[#f7931a]/20'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  } ${!isOpen && 'lg:justify-center'}`}
                  title={!isOpen ? item.label : undefined}
                >
                  <Icon size={20} />
                  {isOpen && <span className="text-sm font-medium">{item.label}</span>}
                </Link>
              );
            })}

            {/* Submit Links (authenticated users) */}
            {isAuthenticated && isOpen && (
              <>
                <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mt-6 mb-3 px-3">
                  Community
                </p>
                {SUBMIT_ITEMS.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                        isActive
                          ? 'bg-[#f7931a]/10 text-[#f7931a] border border-[#f7931a]/20'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Plus size={16} />
                      <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                  );
                })}
                <Link
                  href="/review"
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                    pathname === '/review'
                      ? 'bg-[#f7931a]/10 text-[#f7931a] border border-[#f7931a]/20'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Vote size={16} />
                  <span className="text-sm font-medium">Review Queue</span>
                </Link>
                <Link
                  href="/submissions"
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                    pathname === '/submissions'
                      ? 'bg-[#f7931a]/10 text-[#f7931a] border border-[#f7931a]/20'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <ClipboardList size={16} />
                  <span className="text-sm font-medium">My Submissions</span>
                </Link>
              </>
            )}

            {/* Admin Link */}
            {isAdmin && (
              <>
                {isOpen && (
                  <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mt-6 mb-3 px-3">
                    Admin
                  </p>
                )}
                <Link
                  href="/admin"
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                    pathname?.startsWith('/admin')
                      ? 'bg-[#f7931a]/10 text-[#f7931a] border border-[#f7931a]/20'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  } ${!isOpen && 'lg:justify-center'}`}
                  title={!isOpen ? 'Admin' : undefined}
                >
                  <ShieldCheck size={20} />
                  {isOpen && <span className="text-sm font-medium">Admin</span>}
                </Link>
              </>
            )}
          </nav>

          {/* Auth */}
          <div className="px-3 py-3 border-t border-white/5">
            <SignInButton collapsed={!isOpen} />
          </div>

          {/* Footer */}
          {isOpen && (
            <div className="px-5 py-4 border-t border-white/5">
              <div className="text-[10px] text-gray-600">
                <p>NIST RMF + FAIR + STRIDE</p>
                <p className="mt-1">Institutional-grade analysis</p>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
