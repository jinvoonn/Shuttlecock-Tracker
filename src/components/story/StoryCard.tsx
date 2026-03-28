import React, { forwardRef } from 'react';
import { Feather, MapPin, Calendar, Flame, Trophy, Skull } from 'lucide-react';

interface StoryCardProps {
  sessionName: string;
  location: string;
  date: string;
  shuttlesUsed: number;
  mvp?: { name: string; wins: number };
  streak?: { name: string; streak: number };
  cursed?: { name: string; losses: number };
  isTransparent?: boolean;
}

export const StoryCard = forwardRef<HTMLDivElement, StoryCardProps>(
  ({ sessionName, location, date, shuttlesUsed, mvp, streak, cursed, isTransparent = false }, ref) => {
    return (
      <div 
        ref={ref}
        className={`w-[360px] h-[640px] relative overflow-hidden flex flex-col font-['Lexend',_sans-serif] ${!isTransparent ? 'bg-[#020617]' : ''}`}
        style={{
          boxSizing: 'border-box'
        }}
      >
        {!isTransparent && (
          <>
            {/* Absolute pitch black base to ensure contrast */}
            <div className="absolute inset-0 bg-black pointer-events-none z-0"></div>

            {/* Minimal Noise/Texture Overlay */}
            <div 
              className="absolute inset-0 opacity-15 pointer-events-none z-0" 
              style={{ 
                backgroundImage: "url('/badminton-bg.png')", 
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            ></div>
            
            {/* Subtle vignette gradient to keep focus on center content */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/90 pointer-events-none z-10"></div>
          </>
        )}

        <div className="relative z-20 flex flex-col h-full p-8 text-slate-100">
           {/* Header Logo */}
           <div className="flex items-center justify-center gap-2 mb-10 mt-4 w-full">
              <div className="size-8 rounded-lg bg-gradient-to-br from-indigo-500 to-sky-600 flex items-center justify-center shadow-md shadow-sky-500/20">
                <Feather className="size-5 text-white transform rotate-45" />
              </div>
              <h1 className="text-2xl font-black text-slate-50 tracking-tighter">
                Cock<span className="text-sky-400">Count</span>
              </h1>
           </div>

           {/* Session Details */}
           <div className="space-y-2 mb-auto pb-4 border-b border-white/10">
             <h2 className="text-3xl font-black uppercase italic tracking-tighter leading-none">{sessionName}</h2>
             <div className="flex flex-col gap-2 text-slate-400 mt-4">
                <div className="flex items-center gap-2">
                   <MapPin className="size-3 text-[#13ec80]" />
                   <span className="text-xs font-bold uppercase tracking-widest">{location}</span>
                </div>
                <div className="flex items-center gap-2">
                   <Calendar className="size-3 text-[#13ec80]" />
                   <span className="text-[10px] font-bold uppercase tracking-widest">{date}</span>
                </div>
             </div>
           </div>

           {/* Metrics List */}
           <div className="flex flex-col gap-6 pt-6">
              {mvp && (
                 <div className="flex flex-col border-l-2 border-[#13ec80] pl-4">
                    <span className="text-emerald-400 text-[9px] font-black uppercase tracking-[0.2em] mb-1 flex items-center gap-1.5 opacity-80">
                      <Trophy className="size-3" /> MVP
                    </span>
                    <span className="text-4xl font-black italic tracking-tighter uppercase leading-none">{mvp.name}</span>
                    <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1.5">{mvp.wins} WINS</span>
                 </div>
              )}

              {streak && streak.streak >= 2 && (
                 <div className="flex flex-col border-l-2 border-amber-400 pl-4 mt-2">
                    <span className="text-amber-400 text-[9px] font-black uppercase tracking-[0.2em] mb-1 flex items-center gap-1.5 opacity-80">
                      <Flame className="size-3" /> HIGHEST STREAK
                    </span>
                    <span className="text-3xl font-black italic tracking-tighter uppercase leading-none text-slate-100">{streak.name}</span>
                    <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1.5">{streak.streak} IN A ROW</span>
                 </div>
              )}

              {cursed && cursed.losses >= 2 && (
                 <div className="flex flex-col border-l-2 border-rose-500 pl-4 mt-2">
                    <span className="text-rose-500 text-[9px] font-black uppercase tracking-[0.2em] mb-1 flex items-center gap-1.5 opacity-80">
                      <Skull className="size-3" /> MOST CURSED
                    </span>
                    <span className="text-2xl font-black italic tracking-tighter uppercase leading-none text-slate-200">{cursed.name}</span>
                    <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1.5">{cursed.losses} LOSSES</span>
                 </div>
              )}
           </div>

           {/* Footer Branding */}
           <div className="flex justify-between items-end mt-auto pt-6">
             <div className="flex flex-col">
               <span className="text-3xl font-black italic leading-none">{shuttlesUsed}</span>
               <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 mt-1">Shuttles Sweated</span>
             </div>
             <div className="text-[7px] font-black text-slate-600 uppercase tracking-[0.2em] italic mb-1">
               shuttle-tracker.vercel.app
             </div>
           </div>
        </div>
      </div>
    );
  }
);

StoryCard.displayName = 'StoryCard';
