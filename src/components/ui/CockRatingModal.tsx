"use client";

import React, { useEffect, useState } from "react";
import { X, Trophy, Activity, Target, Shield, Zap, TrendingUp } from "lucide-react";

interface CockRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerElo?: number;
}

export default function CockRatingModal({ isOpen, onClose, playerElo = 1200 }: CockRatingModalProps) {
  const [isRendered, setIsRendered] = useState(false);

  // Handle ESC key close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      // Lock body scroll
      document.body.style.overflow = 'hidden';
      // Trigger entrance animation next frame
      requestAnimationFrame(() => setIsRendered(true));
    } else {
      setIsRendered(false);
      document.body.style.overflow = 'unset';
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen && !isRendered) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 font-['Lexend',_sans-serif]">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-out ${isRendered ? 'opacity-100' : 'opacity-0'}`} 
      />

      {/* Modal Card */}
      <div 
        className={`relative w-full sm:max-w-md bg-[#1A1D23] border border-slate-700/60 shadow-2xl rounded-t-[2rem] sm:rounded-3xl flex flex-col max-h-[90vh] overflow-hidden transform transition-all duration-300 ease-out origin-bottom sm:origin-center
          ${isRendered ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-full sm:translate-y-0 sm:scale-95 opacity-0'}
        `}
      >
        {/* Header Ribbon */}
        <div className="sticky top-0 z-10 bg-[#1A1D23]/95 backdrop-blur-xl border-b border-slate-700/50 px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black italic tracking-tighter text-slate-100 uppercase leading-none">
              How CockRating Works
            </h2>
            <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mt-1">
              Understand your skill system
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors active:scale-90"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6 space-y-6 custom-scrollbar">
          
          {/* Highlight Card */}
          <div className="bg-slate-900 border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.05)] rounded-2xl p-6 text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -translate-y-16 translate-x-16 pointer-events-none"></div>
            <div className="flex items-center justify-center gap-2 mb-2 relative z-10">
              <span className="text-xl">🏸</span>
              <span className="text-xs font-black text-emerald-400 tracking-widest uppercase">CockRating</span>
            </div>
            <p className="text-5xl font-black italic tracking-tighter text-slate-100 relative z-10 leading-none">
              {Math.round(playerElo)}
            </p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-3 relative z-10">
              Skill-based rating system
            </p>
          </div>

          {/* Rules List */}
          <div className="space-y-4">
            
            <div className="flex gap-4 items-start bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center shrink-0 border border-sky-500/20">
                <Activity className="w-5 h-5 text-sky-400" />
              </div>
              <div>
                <h4 className="text-sm font-black italic uppercase text-slate-200 tracking-tighter mb-1">1. What is CockRating?</h4>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">
                  CockRating is your definitive skill score. The higher your rating climbs, the stronger a player you are scientifically recognized to be.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center shrink-0 border border-rose-500/20">
                <TrendingUp className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h4 className="text-sm font-black italic uppercase text-slate-200 tracking-tighter mb-1">2. Opponent Strength</h4>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">
                  Gains and losses aren't flat. Beating a significantly stronger opposing team rewards you with a massive rating boost. Losing exclusively to weaker opponents will nosedive your rating.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-500/20">
                <Target className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h4 className="text-sm font-black italic uppercase text-slate-200 tracking-tighter mb-1">3. Score Difference Impact</h4>
                <p className="text-xs text-slate-400 font-medium leading-relaxed mb-2">
                  Winning by massive margins boosts your rating heavily compared to close games. Every single point counts.
                </p>
                <div className="flex gap-2">
                  <div className="bg-slate-900 px-2 py-1.5 rounded-lg border border-slate-700 flex-1 text-center">
                    <p className="text-white font-black text-xs">21–5</p>
                    <p className="text-[9px] font-bold text-amber-500 uppercase tracking-widest mt-0.5">Big Gain</p>
                  </div>
                  <div className="bg-slate-900 px-2 py-1.5 rounded-lg border border-slate-700 flex-1 text-center">
                    <p className="text-white font-black text-xs">21–19</p>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Small Gain</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 items-start bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0 border border-indigo-500/20">
                <Shield className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h4 className="text-sm font-black italic uppercase text-slate-200 tracking-tighter mb-1">4. Team-Based Fairness</h4>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">
                  Matches are inherently team-based. The system actively balances your teammate overhead: a strong teammate isn't over-rewarded for winning, and you are rarely overly-punished for carrying a weak teammate into a loss.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
                <Zap className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-sm font-black italic uppercase text-slate-200 tracking-tighter mb-1">How to Improve?</h4>
                <ul className="text-xs text-slate-400 font-medium leading-relaxed space-y-1 mt-2 list-disc pl-4">
                  <li>Win matches consistently.</li>
                  <li>Perform well against vastly stronger opponents.</li>
                  <li>Win with larger point discrepancies (blowouts).</li>
                </ul>
              </div>
            </div>

          </div>

          {/* Spacer for mobile safe area */}
          <div className="h-6 sm:h-2" />

        </div>
      </div>
    </div>
  );
}
