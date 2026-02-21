'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import ErrorBoundary from './ErrorBoundary';
import { useHydration } from '@/lib/useHydration';
import { Menu, Loader2 } from 'lucide-react';

const MOBILE_BREAKPOINT = 1024; // matches lg: breakpoint

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return isMobile;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();

  // Close sidebar on mobile when navigating
  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [pathname, isMobile]);

  // Start closed on mobile
  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [isMobile]);

  const handleToggle = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);
  const hydrated = useHydration();

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0a0a0f]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={24} className="text-[#f7931a] animate-spin" />
          <p className="text-sm text-gray-500">Loading Bitcoin RMF...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onToggle={handleToggle} />
      <main className="flex-1 overflow-y-auto">
        {/* Mobile header */}
        <div className="lg:hidden sticky top-0 z-30 flex items-center gap-3 px-4 py-3 bg-[#0a0a0f]/90 backdrop-blur border-b border-[#2a2a3a]">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-white/5 rounded-lg"
          >
            <Menu size={20} />
          </button>
          <span className="text-sm font-semibold text-[#f7931a]">Bitcoin RMF</span>
        </div>
        <div className="p-6 lg:p-8">
          <ErrorBoundary>{children}</ErrorBoundary>
        </div>
      </main>
    </div>
  );
}
