import React from 'react';
import RankBadge from '../ui/RankBadge';
import clsx from 'clsx';

interface PlayerNameProps {
  name: string;
  elo: number;
  placementMatchesPlayed?: number;
  showRankName?: boolean;
  className?: string;
  nameClassName?: string;
  hideName?: boolean;
}

/**
 * Standardized component for displaying player names with their CockRating rank.
 * Format: "Name | ⚔️ [RankName]"
 */
export default function PlayerName({ 
  name, 
  elo, 
  placementMatchesPlayed = 5,
  showRankName = false, 
  className,
  nameClassName,
  hideName = false
}: PlayerNameProps) {
  return (
    <div className={clsx("inline-flex items-center gap-2", className)}>
      {!hideName && (
        <>
          <span className={clsx("font-black uppercase tracking-tight italic leading-none", nameClassName)}>
            {name}
          </span>
          <span className="text-slate-700 font-light leading-none opacity-40">|</span>
        </>
      )}
      <RankBadge elo={elo} placementMatchesPlayed={placementMatchesPlayed} compact={!showRankName} />
    </div>
  );
}
