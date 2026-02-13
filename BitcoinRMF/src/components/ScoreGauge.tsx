'use client';

interface ScoreGaugeProps {
  score: number; // 0-100
  label: string;
  size?: 'sm' | 'md' | 'lg';
}

function getGaugeColor(score: number): string {
  if (score >= 80) return '#22c55e';
  if (score >= 60) return '#eab308';
  if (score >= 40) return '#f97316';
  if (score >= 20) return '#ef4444';
  return '#6b7280';
}

export default function ScoreGauge({ score, label, size = 'md' }: ScoreGaugeProps) {
  const color = getGaugeColor(score);
  const dimensions = { sm: 60, md: 80, lg: 100 };
  const dim = dimensions[size];
  const strokeWidth = size === 'sm' ? 4 : 6;
  const radius = (dim - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const fontSize = size === 'sm' ? 'text-sm' : size === 'md' ? 'text-lg' : 'text-2xl';

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: dim, height: dim }}>
        <svg width={dim} height={dim} className="-rotate-90">
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            fill="none"
            stroke="#1f2937"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            strokeLinecap="round"
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-bold ${fontSize}`} style={{ color }}>{score}</span>
        </div>
      </div>
      <span className="text-[10px] text-gray-500 uppercase tracking-wide">{label}</span>
    </div>
  );
}
