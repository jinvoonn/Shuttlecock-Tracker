"use client";

import React from 'react';
import { Feather, Trophy, TrendingUp, Target, User } from 'lucide-react';
import clsx from 'clsx';

interface PlayerCardProps {
    player: {
        id: string;
        name: string;
        avatar_url?: string;
    };
    stats: {
        elo: number;
        winRate: number;
        wins: number;
        streak: number;
        placementMatchesPlayed: number;
    };
}

export default function PlayerCard({ player, stats }: PlayerCardProps) {
    const elo = Math.round(stats.elo);
    const winRate = Math.round(stats.winRate);
    
    // Tier Logic
    const isUnranked = stats.placementMatchesPlayed < 5;
    const isElite = elo >= 1800 && !isUnranked;
    const isGold = elo >= 1400 && elo < 1800 && !isUnranked;
    const isSilver = elo >= 1000 && elo < 1400 && !isUnranked;
    const isBronze = elo < 1000 && !isUnranked;

    // Rank Name Mapping (Align with rank.ts)
    const getRankName = () => {
        if (isUnranked) return "PLACEMENT";
        if (elo >= 2000) return "COCKMASTER";
        if (elo >= 1800) return "ALPHA COCK";
        if (elo >= 1600) return "BATTLE COCK";
        if (elo >= 1400) return "BIG COCK";
        if (elo >= 1200) return "HARD HITTER";
        if (elo >= 1000) return "RISING CHICK";
        return "SOFT CHICK";
    };

    return (
        <div className={clsx(
            "w-full max-w-[340px] aspect-[1/1.5] rounded-[2.5rem] p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden group hover:scale-[1.02] transition-all duration-500 font-['Lexend'] border-4",
            isUnranked && "bg-slate-900 border-slate-700 opacity-80",
            isBronze && "bg-[#2d2d2d] border-slate-600 shadow-slate-900/50",
            isSilver && "bg-[#1e293b] border-sky-400/50 silver-glow",
            isGold && "bg-[#1a1c1e] border-amber-400 gold-glow",
            isElite && "bg-[#020617] border-emerald-400 elite-glow"
        )}>
            {/* Holographic Overlays */}
            {(isElite || isGold) && <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-white/5 pointer-events-none animate-shine-slow"></div>}
            {isElite && <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-[80px] -mr-20 -mt-20"></div>}
            {isGold && <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-[80px] -mr-20 -mt-20"></div>}

            {/* Header: Name & Rank */}
            <div className="relative z-10 w-full text-left">
                <div className="flex items-center gap-2 mb-1">
                    <p className={clsx(
                        "text-[10px] font-black uppercase tracking-[0.3em] font-['Lexend']",
                        isUnranked ? "text-slate-500" : isBronze ? "text-slate-400" : isSilver ? "text-sky-400" : isGold ? "text-amber-500" : "text-emerald-400"
                    )}>{getRankName()}</p>
                    {isElite && <Trophy className="size-3 text-emerald-400 animate-pulse" />}
                </div>
                <h2 className={clsx(
                    "text-3xl font-black italic uppercase italic tracking-tighter leading-none pr-12 truncate drop-shadow-sm",
                    isElite || isGold ? "text-white" : "text-slate-100"
                )}>{player.name}</h2>
            </div>

            {/* Hero Image Section (Future Proof) */}
            <div className="absolute top-8 right-8 z-10">
                <div className={clsx(
                    "size-20 rounded-[1.5rem] flex items-center justify-center border-2 overflow-hidden shadow-lg transform rotate-3 transition-transform group-hover:rotate-0 duration-500",
                    isElite ? "bg-emerald-500/10 border-emerald-400/30" : isGold ? "bg-amber-500/10 border-amber-400/30" : "bg-slate-800 border-slate-700"
                )}>
                    {player.avatar_url ? (
                        <img src={player.avatar_url} alt={player.name} className="size-full object-cover" />
                    ) : (
                        <User className={clsx(
                            "size-10",
                            isElite ? "text-emerald-400/50" : isGold ? "text-amber-400/50" : "text-slate-600"
                        )} />
                    )}
                </div>
            </div>

            {/* Core Score: CR */}
            <div className="relative z-10 flex flex-col items-center">
                <div className="flex items-baseline">
                    <span className={clsx(
                        "text-7xl font-black italic tracking-tighter relative drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]",
                        isElite ? "text-white drop-shadow-[0_0_30px_rgba(52,211,153,0.8)]" : isGold ? "text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.6)]" : "text-slate-100"
                    )}>{elo}</span>
                </div>
                <div className="flex items-center gap-2 -mt-1 opacity-60">
                    <TrendingUp className="size-3" />
                    <span className="text-[10px] uppercase font-black tracking-[0.4em]">Cockrating</span>
                </div>
            </div>

            {/* Bottom Stats Grid */}
            <div className="relative z-10 w-full space-y-4">
                <div className={clsx(
                    "grid grid-cols-3 gap-2 border-t pt-5",
                    isElite ? "border-emerald-500/20" : isGold ? "border-amber-500/20" : "border-slate-700"
                )}>
                    <div className="text-center group-hover:scale-110 transition-transform">
                        <p className="text-[8px] font-bold text-slate-500 uppercase flex items-center justify-center gap-1 mb-1">
                           <Feather className="size-2 transform rotate-45" /> WR%
                        </p>
                        <p className={clsx(
                            "text-base font-black italic",
                            isElite ? "text-emerald-400" : isGold ? "text-amber-400" : "text-slate-100"
                        )}>{winRate}%</p>
                    </div>
                    <div className="text-center border-l border-white/5">
                        <p className="text-[8px] font-bold text-slate-500 uppercase mb-1">Wins</p>
                        <p className="text-base font-black italic text-slate-100">{stats.wins}</p>
                    </div>
                    <div className="text-center border-l border-white/5">
                        <p className="text-[8px] font-bold text-slate-500 uppercase mb-1">Streak</p>
                        <p className={clsx(
                            "text-base font-black italic",
                            stats.streak > 3 ? "text-emerald-400" : "text-slate-100"
                        )}>{stats.streak}</p>
                    </div>
                </div>

                {/* Footer Branding */}
                <div className="flex items-center justify-between opacity-30 text-[8px] font-black uppercase tracking-widest italic pt-2">
                    <span className="flex items-center gap-1">
                        <Target className="size-2 text-rose-500" /> Season 1 Edition
                    </span>
                    <span className="tracking-[0.2em]">CockCount // Elite Series</span>
                </div>
            </div>

            <style jsx>{`
                .elite-glow { box-shadow: 0 0 50px rgba(52, 211, 153, 0.4), inset 0 0 20px rgba(52, 211, 153, 0.1); }
                .gold-glow { box-shadow: 0 0 40px rgba(251, 191, 36, 0.3), inset 0 0 15px rgba(251, 191, 36, 0.1); }
                .silver-glow { box-shadow: 0 0 30px rgba(56, 189, 248, 0.15); }
                
                @keyframes shine-slow {
                    0% { transform: translateX(-150%) skewX(-20deg); }
                    100% { transform: translateX(150%) skewX(-20deg); }
                }
                .animate-shine-slow { 
                    position: absolute; 
                    top: 0; left: 0; width: 60%; height: 100%;
                    background: linear-gradient(to right, transparent, rgba(255,255,255,0.05), transparent);
                    animation: shine-slow 6s infinite linear;
                }
            `}</style>
        </div>
    );
}
