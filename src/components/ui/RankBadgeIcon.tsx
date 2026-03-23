import Image from "next/image";
import { getRankBadge } from "@/lib/analytics/rank";
import clsx from "clsx";

interface RankBadgeIconProps {
  rank: string;
  size?: "small" | "default" | "large";
  className?: string;
}

export default function RankBadgeIcon({ rank, size = "default", className }: RankBadgeIconProps) {
  const badgePath = getRankBadge(rank);
  
  const sizeMap = {
    small: 24,
    default: 32,
    large: 40,
  };
  
  const dimension = sizeMap[size];

  const isUnranked = rank === "Unranked";
  const hasGlow = ["Big Cock", "Battle Cock", "Alpha Cock", "CockMaster"].includes(rank);
  const isCockMaster = rank === "CockMaster";

  return (
    <div 
      className={clsx(
        "relative inline-flex items-center justify-center shrink-0 rounded-full",
        !isUnranked && "animate-badge-pulse",
        hasGlow && "animate-badge-glow",
        isCockMaster && "animate-badge-shine",
        className
      )} 
      style={{ width: dimension, height: dimension }}
    >
      <Image
        src={badgePath}
        alt={`${rank} Badge`}
        width={dimension}
        height={dimension}
        className="object-contain relative z-10"
        priority={size === "large"}
      />
    </div>
  );
}
