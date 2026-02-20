'use client';

import { useState, useCallback } from 'react';
import type { DashboardStats } from '@/types';

interface TrendDataPoint {
  date: string;
  stats: DashboardStats;
}

interface RiskTrendChartProps {
  data: TrendDataPoint[];
}

interface Line {
  key: keyof DashboardStats;
  label: string;
  color: string;
}

const LINES: Line[] = [
  { key: 'totalRisks', label: 'Total Risks', color: '#ffffff' },
  { key: 'criticalHighRiskCount', label: 'Critical/High', color: '#ef4444' },
  { key: 'totalThreats', label: 'Threats', color: '#f97316' },
  { key: 'totalVulnerabilities', label: 'Vulnerabilities', color: '#eab308' },
];

const PADDING = { top: 20, right: 12, bottom: 24, left: 36 };
const CHART_HEIGHT = 180;

export default function RiskTrendChart({ data }: RiskTrendChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Compute bounds
  const allValues = data.flatMap((d) => LINES.map((l) => (d.stats[l.key] as number) || 0));
  const maxVal = Math.max(...allValues, 1);
  const minVal = 0;

  const innerWidth = 100; // percentage-based, scaled in viewBox
  const viewBoxWidth = 600;
  const viewBoxHeight = CHART_HEIGHT;
  const plotWidth = viewBoxWidth - PADDING.left - PADDING.right;
  const plotHeight = viewBoxHeight - PADDING.top - PADDING.bottom;

  const xScale = useCallback(
    (i: number) => PADDING.left + (data.length > 1 ? (i / (data.length - 1)) * plotWidth : plotWidth / 2),
    [data.length, plotWidth]
  );

  const yScale = useCallback(
    (val: number) => PADDING.top + plotHeight - ((val - minVal) / (maxVal - minVal)) * plotHeight,
    [plotHeight, minVal, maxVal]
  );

  const buildPath = useCallback(
    (line: Line) => {
      if (data.length === 0) return '';
      return data
        .map((d, i) => {
          const x = xScale(i);
          const y = yScale((d.stats[line.key] as number) || 0);
          return `${i === 0 ? 'M' : 'L'}${x},${y}`;
        })
        .join(' ');
    },
    [data, xScale, yScale]
  );

  // Y-axis ticks
  const tickCount = 4;
  const yTicks = Array.from({ length: tickCount + 1 }, (_, i) =>
    Math.round(minVal + ((maxVal - minVal) * i) / tickCount)
  );

  // Hovered point data
  const hoveredData = hoveredIndex !== null ? data[hoveredIndex] : null;

  return (
    <div className="relative w-full" style={{ minWidth: 0 }}>
      <svg
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        preserveAspectRatio="none"
        className="w-full"
        style={{ height: CHART_HEIGHT }}
      >
        {/* Grid lines */}
        {yTicks.map((tick) => (
          <g key={tick}>
            <line
              x1={PADDING.left}
              y1={yScale(tick)}
              x2={viewBoxWidth - PADDING.right}
              y2={yScale(tick)}
              stroke="#2a2a3a"
              strokeWidth={0.5}
            />
            <text
              x={PADDING.left - 4}
              y={yScale(tick) + 3}
              textAnchor="end"
              fill="#666"
              fontSize={10}
            >
              {tick}
            </text>
          </g>
        ))}

        {/* Data lines */}
        {LINES.map((line) => (
          <path
            key={line.key}
            d={buildPath(line)}
            fill="none"
            stroke={line.color}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}

        {/* Hover column targets */}
        {data.map((_, i) => (
          <rect
            key={i}
            x={xScale(i) - (data.length > 1 ? plotWidth / data.length / 2 : 20)}
            y={PADDING.top}
            width={data.length > 1 ? plotWidth / data.length : 40}
            height={plotHeight}
            fill="transparent"
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
          />
        ))}

        {/* Hover line */}
        {hoveredIndex !== null && (
          <line
            x1={xScale(hoveredIndex)}
            y1={PADDING.top}
            x2={xScale(hoveredIndex)}
            y2={PADDING.top + plotHeight}
            stroke="#555"
            strokeWidth={0.5}
            strokeDasharray="3,3"
            pointerEvents="none"
          />
        )}

        {/* Hover dots */}
        {hoveredIndex !== null &&
          LINES.map((line) => {
            const val = (data[hoveredIndex].stats[line.key] as number) || 0;
            return (
              <circle
                key={line.key}
                cx={xScale(hoveredIndex)}
                cy={yScale(val)}
                r={3}
                fill={line.color}
                pointerEvents="none"
              />
            );
          })}

        {/* X-axis date labels (first, middle, last) */}
        {data.length > 0 && (
          <>
            <text x={PADDING.left} y={viewBoxHeight - 4} fill="#666" fontSize={9}>
              {formatDate(data[0].date)}
            </text>
            {data.length > 2 && (
              <text
                x={xScale(Math.floor(data.length / 2))}
                y={viewBoxHeight - 4}
                fill="#666"
                fontSize={9}
                textAnchor="middle"
              >
                {formatDate(data[Math.floor(data.length / 2)].date)}
              </text>
            )}
            <text
              x={viewBoxWidth - PADDING.right}
              y={viewBoxHeight - 4}
              fill="#666"
              fontSize={9}
              textAnchor="end"
            >
              {formatDate(data[data.length - 1].date)}
            </text>
          </>
        )}
      </svg>

      {/* Tooltip */}
      {hoveredData && hoveredIndex !== null && (
        <div
          className="absolute pointer-events-none bg-[#1a1a2a] border border-[#2a2a3a] rounded-lg px-3 py-2 text-[10px] z-10 shadow-lg"
          style={{
            left: `${((xScale(hoveredIndex) / viewBoxWidth) * 100).toFixed(1)}%`,
            top: 0,
            transform: 'translateX(-50%)',
          }}
        >
          <p className="text-gray-400 mb-1">{formatDate(hoveredData.date)}</p>
          {LINES.map((line) => (
            <p key={line.key} style={{ color: line.color }}>
              {line.label}: {(hoveredData.stats[line.key] as number) || 0}
            </p>
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
        {LINES.map((line) => (
          <div key={line.key} className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 rounded-full" style={{ backgroundColor: line.color }} />
            <span className="text-[10px] text-gray-500">{line.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00Z');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
}
