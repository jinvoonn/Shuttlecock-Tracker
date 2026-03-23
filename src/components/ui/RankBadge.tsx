import React from 'react';
import { getCockRank } from '@/lib/analytics/rank';
import clsx from 'clsx';
import RankIcon from './RankIcon';

interface RankBadgeProps {
  elo: number;
  placementMatchesPlayed?: number;
  className?: string;
  compact?: boolean;
}

export default function RankBadge({ elo, placementMatchesPlayed = 5, className, compact = false }: RankBadgeProps) {
  const rank = getCockRank(elo, placementMatchesPlayed);

  if (compact) {
    return <RankIcon rank={rank.name} size="normal" className={clsx("shadow-md", className)} />;
  }

  return (
    <div 
      className={clsx(
        "inline-flex items-center justify-center rounded-full font-black tracking-wider leading-none border shadow-sm whitespace-nowrap transition-all",
        "px-2 py-1 text-[10px] uppercase gap-2",
        className
      )}
      style={{ 
        backgroundColor: `${rank.color}15`, 
        color: rank.color,
        borderColor: `${rank.color}30`
      }}
    >
      <RankIcon rank={rank.name} size="small" />
      <span className="italic flex items-center gap-1.5 pr-1">
        {rank.name}
        {placementMatchesPlayed < 5 && (
          <span className="text-[8px] opacity-70 font-mono tracking-tighter">
            {placementMatchesPlayed}/5
          </span>
        )}
      </span>
    </div>
  );
}
