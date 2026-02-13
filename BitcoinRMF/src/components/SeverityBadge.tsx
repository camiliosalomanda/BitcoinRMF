'use client';

import { RiskRating } from '@/types';
import { getSeverityColor } from '@/lib/scoring';

interface SeverityBadgeProps {
  rating: RiskRating;
  size?: 'sm' | 'md';
}

export default function SeverityBadge({ rating, size = 'md' }: SeverityBadgeProps) {
  const colorClass = getSeverityColor(rating);
  const sizeClass = size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-1';

  return (
    <span className={`inline-flex items-center font-semibold rounded-full border ${colorClass} ${sizeClass}`}>
      {rating}
    </span>
  );
}
