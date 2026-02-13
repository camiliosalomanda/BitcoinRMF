'use client';

import DashboardLayout from '@/components/DashboardLayout';
import StatCard from '@/components/StatCard';
import SeverityBadge from '@/components/SeverityBadge';
import { useRMFStore } from '@/lib/store';
import { getMatrixCellColor } from '@/lib/scoring';
import {
  Shield,
  AlertTriangle,
  Activity,
  Wrench,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { threats, fudAnalyses, bips, getDashboardStats, getRiskMatrix } = useRMFStore();

  const stats = getDashboardStats();
  const matrix = getRiskMatrix();
  const topThreats = [...threats]
    .sort((a, b) => b.severityScore - a.severityScore)
    .slice(0, 5);
  const recentFUD = fudAnalyses.filter((f) => f.status !== 'DEBUNKED').slice(0, 3);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Risk Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Bitcoin threat landscape overview</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Threats"
            value={stats.totalThreats}
            icon={Shield}
            color="#f7931a"
          />
          <StatCard
            label="Critical / High"
            value={stats.criticalHighCount}
            icon={AlertTriangle}
            color="#ef4444"
            trend={stats.criticalHighCount > 0 ? { direction: 'neutral', label: 'Active monitoring' } : undefined}
          />
          <StatCard
            label="Avg Severity"
            value={stats.averageSeverity}
            icon={Activity}
            color="#eab308"
          />
          <StatCard
            label="Active Remediations"
            value={stats.activeRemediations}
            icon={Wrench}
            color="#22c55e"
          />
        </div>

        {/* Middle Row: Risk Matrix + Top Threats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Mini Risk Matrix */}
          <div className="bg-[#111118] border border-[#2a2a3a] rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white">Risk Heatmap</h2>
              <Link href="/risk-matrix" className="text-xs text-[#f7931a] hover:underline">
                View full matrix
              </Link>
            </div>
            <div className="flex gap-2">
              {/* Y-axis label */}
              <div className="flex flex-col justify-between text-[9px] text-gray-500 py-1 pr-1">
                {[5, 4, 3, 2, 1].map((l) => (
                  <div key={l} className="h-8 flex items-center">{l}</div>
                ))}
              </div>
              {/* Grid */}
              <div className="flex-1">
                <div className="grid grid-rows-5 gap-1">
                  {matrix.map((row, ri) => (
                    <div key={ri} className="grid grid-cols-5 gap-1">
                      {row.map((cell) => (
                        <div
                          key={`${cell.likelihood}-${cell.impact}`}
                          className={`h-8 rounded flex items-center justify-center text-[10px] font-bold ${getMatrixCellColor(
                            cell.likelihood,
                            cell.impact
                          )} ${cell.count > 0 ? 'text-white' : 'text-transparent'}`}
                          title={`L${cell.likelihood} × I${cell.impact}: ${cell.count} threats`}
                        >
                          {cell.count || ''}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                {/* X-axis labels */}
                <div className="grid grid-cols-5 gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="text-center text-[9px] text-gray-500">{i}</div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-between mt-2 text-[9px] text-gray-600">
              <span>Likelihood (Y) / Impact (X)</span>
            </div>
          </div>

          {/* Top Threats */}
          <div className="bg-[#111118] border border-[#2a2a3a] rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white">Top Threats by Severity</h2>
              <Link href="/threats" className="text-xs text-[#f7931a] hover:underline">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {topThreats.map((threat, idx) => (
                <Link
                  key={threat.id}
                  href={`/threats/${threat.id}`}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <span className="text-xs text-gray-600 w-4">{idx + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-200 truncate">{threat.name}</p>
                    <p className="text-[10px] text-gray-500">Score: {threat.severityScore}/25</p>
                  </div>
                  <SeverityBadge rating={threat.riskRating} size="sm" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Row: FUD + BIPs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent FUD */}
          <div className="bg-[#111118] border border-[#2a2a3a] rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white">FUD Narratives</h2>
              <Link href="/fud" className="text-xs text-[#f7931a] hover:underline">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {recentFUD.length === 0 && (
                <p className="text-xs text-gray-600">No active FUD narratives</p>
              )}
              {recentFUD.map((fud) => (
                <Link
                  key={fud.id}
                  href={`/fud/${fud.id}`}
                  className="block p-3 rounded-lg hover:bg-white/5 transition-colors border border-[#2a2a3a]"
                >
                  <p className="text-sm text-gray-200 line-clamp-1">{fud.narrative}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] text-gray-500">{fud.category}</span>
                    <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${fud.validityScore}%`,
                          backgroundColor: fud.validityScore > 50 ? '#ef4444' : fud.validityScore > 25 ? '#eab308' : '#22c55e',
                        }}
                      />
                    </div>
                    <span className="text-[10px] text-gray-500">{fud.validityScore}% valid</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* BIP Summary */}
          <div className="bg-[#111118] border border-[#2a2a3a] rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white">BIP Evaluations</h2>
              <Link href="/bips" className="text-xs text-[#f7931a] hover:underline">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {bips.slice(0, 4).map((bip) => (
                <Link
                  key={bip.id}
                  href={`/bips/${bip.id}`}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-200 truncate">
                      {bip.bipNumber}: {bip.title}
                    </p>
                    <p className="text-[10px] text-gray-500">Necessity: {bip.necessityScore}/100</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    bip.recommendation === 'ESSENTIAL' ? 'text-green-400 bg-green-400/10' :
                    bip.recommendation === 'RECOMMENDED' ? 'text-blue-400 bg-blue-400/10' :
                    bip.recommendation === 'OPTIONAL' ? 'text-yellow-400 bg-yellow-400/10' :
                    'text-gray-400 bg-gray-400/10'
                  }`}>
                    {bip.recommendation}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
