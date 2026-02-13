'use client';

import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { direction: 'up' | 'down' | 'neutral'; label: string };
  color?: string;
}

export default function StatCard({ label, value, icon: Icon, trend, color = '#f7931a' }: StatCardProps) {
  return (
    <div className="bg-[#111118] border border-[#2a2a3a] rounded-xl p-5 hover:border-[#3a3a4a] transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{label}</p>
          <p className="text-2xl font-bold" style={{ color }}>{value}</p>
          {trend && (
            <p className={`text-xs mt-1 ${
              trend.direction === 'up' ? 'text-red-400' :
              trend.direction === 'down' ? 'text-green-400' : 'text-gray-500'
            }`}>
              {trend.direction === 'up' ? '\u2191' : trend.direction === 'down' ? '\u2193' : '\u2192'} {trend.label}
            </p>
          )}
        </div>
        <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}15` }}>
          <Icon size={20} style={{ color }} />
        </div>
      </div>
    </div>
  );
}
