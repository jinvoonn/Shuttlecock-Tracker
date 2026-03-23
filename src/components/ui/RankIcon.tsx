import React from 'react';
import { Egg, CircleDot, TrendingUp, Activity, Flame, Swords, Crown } from 'lucide-react';
import clsx from 'clsx';

const rankConfig: Record<string, { icon: React.ElementType, className: string }> = {
  "Unranked": {
    icon: Egg,
    className: "bg-slate-700 text-slate-400"
  },
  "Soft Chick": {
    icon: CircleDot,
    className: "bg-yellow-200 text-yellow-800"
  },
  "Rising Chick": {
    icon: TrendingUp,
    className: "bg-gradient-to-br from-yellow-400 to-orange-400 text-white"
  },
  "Hard Hitter": {
    icon: Activity,
    className: "bg-blue-500 text-white"
  },
  "Big Cock": {
    icon: Flame,
    className: "bg-gradient-to-br from-orange-500 to-red-500 text-white"
  },
  "Battle Cock": {
    icon: Swords,
    className: "bg-red-600 text-white"
  },
  "Alpha Cock": {
    icon: Crown,
    className: "bg-gradient-to-br from-purple-500 to-pink-500 text-white"
  },
  "CockMaster": {
    icon: Crown,
    className: "bg-gradient-to-br from-yellow-400 to-yellow-600 text-black shadow-[0_0_12px_rgba(255,215,0,0.8)]"
  }
};

type RankIconProps = {
  rank: string;
  size?: 'small' | 'normal' | 'large';
  className?: string;
};

export default function RankIcon({ rank, size = 'normal', className }: RankIconProps) {
  const config = rankConfig[rank] || rankConfig["Unranked"];
  const Icon = config.icon;

  const sizeClasses = {
    small: "w-5 h-5",
    normal: "w-8 h-8",
    large: "w-10 h-10"
  };

  const iconSizes = {
    small: 12,
    normal: 16,
    large: 20
  };

  return (
    <div className={clsx(`rounded-full flex items-center justify-center flex-shrink-0 transition-transform`, config.className, sizeClasses[size], className)}>
      <Icon size={iconSizes[size]} strokeWidth={2.5} />
    </div>
  );
}
