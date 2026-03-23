"use client";

import { useRouter, useParams } from 'next/navigation';
import { Info } from 'lucide-react';
import { getCockRank } from '@/lib/analytics/rank';
import RankIcon from '@/components/ui/RankIcon';

interface EloRatingCardProps {
    playerElo: number;
    placementMatchesPlayed?: number;
    eloLabel: string;
    eloColor: string;
    eloBg: string;
}

export default function EloRatingCard({ playerElo, placementMatchesPlayed = 5, eloLabel, eloColor, eloBg }: EloRatingCardProps) {
    const router = useRouter();
    const { mode } = useParams();
    
    const rank = getCockRank(playerElo, placementMatchesPlayed);
    const isUnranked = placementMatchesPlayed < 5;
    
    let progress = 100;
    if (isUnranked) {
      progress = (placementMatchesPlayed / 5) * 100;
    } else if (rank.maxElo !== null) {
      progress = Math.max(0, Math.min(100, ((playerElo - rank.minElo) / (rank.maxElo - rank.minElo)) * 100));
    }

    return (
        <div 
            onClick={() => router.push(`/${mode}/cockrating`)}
            className="p-5 rounded-2xl border bg-slate-900 border-slate-700 shadow-lg relative overflow-hidden flex flex-col justify-between text-left cursor-pointer group hover:brightness-110 hover:-translate-y-1 transition-all duration-300 h-full" 
            style={{ borderColor: rank.color, boxShadow: `0 10px 30px -10px ${rank.color}40` }}
        >
            <div className="absolute -top-6 -right-6 opacity-[0.03] transform group-hover:scale-110 transition-transform pointer-events-none grayscale">
                <RankIcon rank={rank.name} size="large" className="scale-[4]" />
            </div>
            
            <div className="flex flex-col gap-1 w-full mb-4">
                <div className="flex items-center justify-between relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 leading-none shadow-sm" style={{ color: rank.color }}>
                        <RankIcon rank={rank.name} size="small" /> {rank.name}
                    </p>
                    <Info className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" style={{ color: rank.color }} />
                </div>
            </div>

            <div className="flex flex-col gap-3 relative z-10 w-full mt-auto">
                <div className="flex items-baseline gap-2">
                    <p className="text-[2.5rem] font-black font-mono leading-none tracking-tighter italic shadow-sm" style={{ color: rank.color }}>
                        {playerElo}
                    </p>
                    <p className="text-[10px] uppercase font-black tracking-widest mb-1" style={{ color: rank.color }}>
                        CR
                    </p>
                </div>

                <div className="flex flex-col gap-1.5 w-full mt-2">
                    <div className="w-full h-1.5 rounded-full bg-slate-950 border border-slate-800 overflow-hidden shadow-inner">
                        <div 
                            className="h-full rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${progress}%`, backgroundColor: rank.color, boxShadow: `0 0 10px ${rank.color}` }}
                        />
                    </div>
                    <div className="flex justify-between items-center px-0.5">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-400 transition-colors">
                            {isUnranked ? 'Start' : rank.minElo}
                        </span>
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-400 transition-colors">
                            {isUnranked ? 'Ranked' : (rank.nextRank ? rank.maxElo : 'MAX')}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
