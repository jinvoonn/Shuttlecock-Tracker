import React from 'react';
import { getCockRank } from '@/lib/analytics/rank';
import clsx from 'clsx';

interface RankBadgeProps {
  elo: number;
  className?: string;
  hideIcon?: boolean;
}

export default function RankBadge({ elo, className, hideIcon = false }: RankBadgeProps) {
  const rank = getCockRank(elo);

  return (
    <div 
      className={clsx(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase font-black tracking-wider leading-none border shadow-sm whitespace-nowrap",
        className
      )}
      style={{ 
        backgroundColor: `${rank.color}15`, // ~15% opacity hex tint
        color: rank.color,
        borderColor: `${rank.color}30` // ~30% opacity hex border
      }}
    >
      {!hideIcon && <span className="text-xs">{rank.icon}</span>}
      <span className="italic">{rank.name}</span>
    </div>
  );
}
