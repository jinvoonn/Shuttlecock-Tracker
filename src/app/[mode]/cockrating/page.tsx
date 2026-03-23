"use client";

import React from "react";
import { 
  ArrowLeft, 
  Trophy, 
  Target, 
  Shield, 
  Zap, 
  TrendingUp, 
  Activity,
  ChevronRight,
  Info
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { RANK_TIERS } from "@/lib/analytics/rank";
import RankBadge from "@/components/ui/RankBadge";
import RankBadgeIcon from "@/components/ui/RankBadgeIcon";

export default function CockRatingPage() {
  const { mode } = useParams();
  const router = useRouter();
  const basePath = `/${mode}`;

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push(basePath);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 font-['Lexend',_sans-serif] pb-20">
      {/* Cinematic Background */}
      <div 
        className="fixed inset-0 opacity-10 pointer-events-none grayscale bg-cover bg-center"
        style={{ backgroundImage: "url('/badminton-bg.png')" }}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-slate-900/90 to-slate-900/95 pointer-events-none" />

      {/* Sticky Top Header */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/50 px-6 py-4 flex items-center gap-4">
        <button 
          onClick={handleBack}
          className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-all active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-black italic uppercase tracking-tighter leading-none">
            CockRating Guide
          </h1>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
            Understanding the Skill System
          </p>
        </div>
      </header>

      <main className="relative z-10 max-w-2xl mx-auto px-6 pt-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Section 1: Hero */}
        <section className="text-center py-4">
          <div className="inline-flex items-center justify-center size-24 bg-gradient-to-br from-emerald-500/20 to-sky-600/20 rounded-3xl shadow-2xl shadow-emerald-500/10 mb-6 rotate-3 hover:rotate-0 transition-transform duration-500 border border-emerald-500/20">
            <RankBadgeIcon rank="CockMaster" size="large" className="scale-125" />
          </div>
          <h2 className="text-5xl font-black italic tracking-tighter uppercase mb-2">
            Cock<span className="text-emerald-400">Rating</span>
          </h2>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
            Because Shuttlecocks Aren't Free.
          </p>
          <p className="text-sm text-slate-500 mt-6 leading-relaxed max-w-md mx-auto">
            CockRating is a comprehensive skill-based system designed to track performance, 
            fairness, and progress within the CockCount ecosystem.
          </p>
        </section>

        {/* Section 2: How It Works */}
        <section className="space-y-4">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 mb-6">
            <Activity className="w-4 h-4 text-sky-400" /> How It Works
          </h3>

          <div className="grid gap-4">
            <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl hover:bg-slate-800/60 transition-colors group">
              <div className="flex gap-4 items-start">
                <div className="size-10 rounded-xl bg-sky-500/10 flex items-center justify-center shrink-0 border border-sky-500/20 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-5 h-5 text-sky-400" />
                </div>
                <div>
                  <h4 className="font-black italic uppercase text-slate-200 tracking-tighter mb-1">CockRating Logic</h4>
                  <p className="text-sm text-slate-400 leading-relaxed italic font-light">
                    Your rating is a dynamic number that fluctuates based on match outcomes. 
                    Victory increases your score, while defeat lowers it.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl hover:bg-slate-800/60 transition-colors group">
              <div className="flex gap-4 items-start">
                <div className="size-10 rounded-xl bg-rose-500/10 flex items-center justify-center shrink-0 border border-rose-500/20 group-hover:scale-110 transition-transform">
                  <Shield className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <h4 className="font-black italic uppercase text-slate-200 tracking-tighter mb-1">Opponent Strength</h4>
                  <p className="text-sm text-slate-400 leading-relaxed italic font-light">
                    Gains and losses aren't flat. Beating a stronger team rewards more points. 
                    Losing to a weaker team results in a heavier penalty.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl hover:bg-slate-800/60 transition-colors group">
              <div className="flex gap-4 items-start">
                <div className="size-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-500/20 group-hover:scale-110 transition-transform">
                  <Target className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h4 className="font-black italic uppercase text-slate-200 tracking-tighter mb-1">Score Difference</h4>
                  <p className="text-sm text-slate-400 leading-relaxed italic font-light">
                    Winning by a landslide (blowout) boosts your rating more than a close game. 
                    Every point matters in calculating your final skill impact.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Placement Matches */}
        <section className="bg-gradient-to-br from-indigo-500/10 to-sky-500/5 border border-indigo-500/20 p-8 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Zap className="w-24 h-24 text-indigo-400" />
          </div>
          
          <h3 className="text-xl font-black italic uppercase tracking-tighter text-indigo-400 mb-4 flex items-center gap-3">
            <RankBadgeIcon rank="Unranked" size="default" /> Placement System
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed mb-6 italic font-light">
            New players are marked as <span className="text-white font-bold">Unranked</span> for their first 5 matches. 
            During this phase, the system uses a <span className="text-white font-bold">Dynamic K-Factor</span> to calibrate your skill quickly.
          </p>

          <div className="bg-slate-900/50 rounded-2xl p-6 border border-indigo-500/10">
            <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-4 text-center">Calibrating Volatility</h4>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="text-center">
                  <div className="text-[9px] font-bold text-slate-600 mb-2">Match {i}</div>
                  <div className="bg-slate-800 py-3 rounded-lg border border-slate-700 text-xs font-mono font-black text-indigo-400">
                    K-{45 - (i * 5)}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[9px] text-slate-500 mt-4 text-center uppercase tracking-widest font-bold">
              Higher K = Faster Rating Movement
            </p>
          </div>
        </section>

        {/* Section 4: Rank System */}
        <section className="space-y-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" /> Rank Tiers
          </h3>

          <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl overflow-hidden shadow-2xl">
            <div className="grid grid-cols-5 text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-900/50 p-4 border-b border-slate-700/50">
              <span className="col-span-3">Tier Name</span>
              <span className="col-span-2 text-right">Rating Range</span>
            </div>
            
            <div className="divide-y divide-slate-700/30">
              {RANK_TIERS.map((tier, index) => (
                <div key={index} className="grid grid-cols-5 items-center p-4 hover:bg-slate-700/20 transition-colors group">
                  <div className="col-span-3 flex items-center gap-3">
                    <RankBadgeIcon rank={tier.name} size="default" className="group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-sm font-black uppercase tracking-widest italic drop-shadow-sm" style={{ color: tier.color }}>
                      {tier.name}
                    </span>
                  </div>
                  <div className="col-span-2 text-right">
                    <span className="text-xs font-mono font-bold text-slate-400 bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-800">
                      {tier.minElo}{tier.maxElo !== null ? `–${tier.maxElo - 1}` : '+'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 5: Example Scenarios */}
        <section className="space-y-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
            <Info className="w-4 h-4 text-emerald-400" /> Impact Scenarios
          </h3>

          <div className="grid gap-3">
             <div className="flex items-center justify-between p-4 bg-slate-800/40 rounded-2xl border border-slate-700/50">
                <div className="flex flex-col">
                  <span className="text-xs font-black uppercase text-slate-100 italic tracking-tighter">Big Victory</span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">21-5 vs Stronger Team</span>
                </div>
                <div className="text-emerald-400 font-black text-lg font-mono italic tracking-tighter">+32-40 pts</div>
             </div>

             <div className="flex items-center justify-between p-4 bg-slate-800/40 rounded-2xl border border-slate-700/50">
                <div className="flex flex-col">
                  <span className="text-xs font-black uppercase text-slate-100 italic tracking-tighter">Close Call</span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">21-19 vs Even Team</span>
                </div>
                <div className="text-emerald-400/60 font-black text-lg font-mono italic tracking-tighter">+8-12 pts</div>
             </div>

             <div className="flex items-center justify-between p-4 bg-slate-800/40 rounded-2xl border border-slate-700/50">
                <div className="flex flex-col">
                  <span className="text-xs font-black uppercase text-slate-100 italic tracking-tighter">Heavy Loss</span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">5-21 vs Weaker Team</span>
                </div>
                <div className="text-rose-500 font-black text-lg font-mono italic tracking-tighter">-35-45 pts</div>
             </div>
          </div>
        </section>

        {/* Footer Navigation */}
        <section className="pt-10 border-t border-slate-800/50 text-center">
            <button 
              onClick={handleBack}
              className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 shadow-xl"
            >
              <ArrowLeft className="w-4 h-4" /> Return to Previous Page
            </button>
        </section>

      </main>
    </div>
  );
}
