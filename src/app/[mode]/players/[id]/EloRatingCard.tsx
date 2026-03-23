"use client";

import React, { useState } from 'react';
import { Info } from 'lucide-react';
import clsx from 'clsx';
import CockRatingModal from '@/components/ui/CockRatingModal';

interface EloRatingCardProps {
    playerElo: number;
    eloLabel: string;
    eloColor: string;
    eloBg: string;
}

export default function EloRatingCard({ playerElo, eloLabel, eloColor, eloBg }: EloRatingCardProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <div 
                onClick={() => setIsOpen(true)}
                className={clsx(
                    "p-5 rounded-2xl border shadow-lg relative overflow-hidden flex flex-col justify-center text-left cursor-pointer group hover:brightness-110 active:scale-95 transition-all", 
                    eloBg
                )}
            >
                <div className="flex items-center justify-between relative z-10 mb-1">
                    <p className={clsx("text-[10px] font-bold uppercase tracking-widest leading-none", eloColor)}>
                        {eloLabel}
                    </p>
                    <Info className={clsx("w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity", eloColor)} />
                </div>
                <div className="flex items-baseline gap-2 relative z-10 mt-1">
                    <p className={clsx("text-3xl font-black font-mono leading-none tracking-tighter italic shadow-sm", eloColor)}>
                        {playerElo}
                    </p>
                    <p className={clsx("text-[10px] uppercase font-bold tracking-widest", eloColor)}>
                        ELO
                    </p>
                </div>
            </div>
            
            <CockRatingModal 
                isOpen={isOpen} 
                onClose={() => setIsOpen(false)} 
                playerElo={playerElo} 
            />
        </>
    );
}
