'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Swords, Dumbbell, Trophy, Shield, User, X } from 'lucide-react';
import { useAppStore } from '@/lib/store';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/quests', label: 'Quests', icon: Swords },
  { href: '/workouts', label: 'Workouts', icon: Dumbbell },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/guilds', label: 'Guild', icon: Shield },
  { href: '/profile', label: 'Profile', icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useAppStore();

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 z-30 h-[calc(100vh-4rem)] w-60 bg-dark-surface border-r border-card-border transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 lg:hidden">
          <span className="font-heading text-sm text-text-secondary">Navigation</span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded hover:bg-card-bg text-text-muted"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-neon-blue/10 text-neon-blue border border-neon-blue/20'
                    : 'text-text-secondary hover:text-text-primary hover:bg-card-bg'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
