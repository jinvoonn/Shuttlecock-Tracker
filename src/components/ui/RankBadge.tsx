import React from 'react';
import { getCockRank, getRankEmoji } from '@/lib/analytics/rank';
import clsx from 'clsx';

interface RankBadgeProps {
  elo: number;
  placementMatchesPlayed?: number;
  className?: string;
  compact?: boolean;
}

export default function RankBadge({ elo, placementMatchesPlayed = 5, className, compact = false }: RankBadgeProps) {
  const rank = getCockRank(elo, placementMatchesPlayed);

  return (
    <div 
      className={clsx(
        "inline-flex items-center justify-center rounded-lg font-black tracking-wider leading-none border shadow-sm whitespace-nowrap transition-all",
        compact ? "w-7 h-7 text-[14px]" : "px-3 py-1.5 text-[10px] uppercase gap-2 rounded-full",
        className
      )}
      style={{ 
        backgroundColor: `${rank.color}15`, 
        color: rank.color,
        borderColor: `${rank.color}30`
      }}
    >
      <span className={clsx(compact ? "drop-shadow-sm" : "text-xs")}>{getRankEmoji(rank.name)}</span>
      {!compact && (
        <span className="italic flex items-center gap-1.5">
          {rank.name}
          {placementMatchesPlayed < 5 && (
            <span className="text-[8px] opacity-70 font-mono tracking-tighter">
              {placementMatchesPlayed}/5
            </span>
          )}
        </span>
      )}
    </div>
  );
}
