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

  return (
    <div className={clsx("relative inline-flex items-center justify-center shrink-0", className)} style={{ width: dimension, height: dimension }}>
      <Image
        src={badgePath}
        alt={`${rank} Badge`}
        width={dimension}
        height={dimension}
        className="object-contain"
        priority={size === "large"}
      />
    </div>
  );
}
