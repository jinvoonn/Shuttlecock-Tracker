import React from 'react';
import { getCockRank } from '@/lib/analytics/rank';
import clsx from 'clsx';
import RankBadgeIcon from './RankBadgeIcon';

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
        "inline-flex items-center justify-center font-black tracking-wider leading-none border shadow-sm whitespace-nowrap transition-all",
        compact ? "w-8 h-8 p-0 rounded-lg" : "px-3 py-1.5 text-[9px] uppercase gap-1.5 rounded-full",
        className
      )}
      style={{ 
        backgroundColor: `${rank.color}15`, 
        color: rank.color,
        borderColor: `${rank.color}30`
      }}
    >
      <RankBadgeIcon rank={rank.name} size="small" className={compact ? "" : "scale-75 -ml-1"} />
      {!compact && (
        <span className="italic flex items-center gap-1">
          {rank.name}
          {placementMatchesPlayed < 5 && (
            <span className="text-[8px] opacity-70 font-bold tracking-tighter">
              {placementMatchesPlayed}/5
            </span>
          )}
        </span>
      )}
    </div>
  );
}
