import React from 'react';
import { getCockRank } from '@/lib/analytics/rank';
import clsx from 'clsx';

interface RankBadgeProps {
  elo: number;
  className?: string;
  compact?: boolean;
}

export default function RankBadge({ elo, className, compact = false }: RankBadgeProps) {
  const rank = getCockRank(elo);

  return (
    <div 
      className={clsx(
        "inline-flex items-center justify-center rounded-lg font-black tracking-wider leading-none border shadow-sm whitespace-nowrap transition-all",
        compact ? "w-7 h-7 text-[14px]" : "px-2.5 py-1 text-[10px] uppercase gap-1.5 rounded-full",
        className
      )}
      style={{ 
        backgroundColor: `${rank.color}15`, 
        color: rank.color,
        borderColor: `${rank.color}30`
      }}
    >
      <span className={clsx(compact ? "drop-shadow-sm" : "text-xs")}>{rank.icon}</span>
      {!compact && <span className="italic">{rank.name}</span>}
    </div>
  );
}
