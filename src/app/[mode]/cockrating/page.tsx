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
  Flame,
  Award
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { RANK_TIERS } from "@/lib/analytics/rank";
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
            CockRating (CR) is a state-of-the-art hybrid skill rating system built on a professional matchmaking 
            engine and augmented with casual social engagement modifiers.
          </p>
        </section>

        {/* Section 2: Core Rating Elements */}
        <section className="space-y-4">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 mb-6">
            <Activity className="w-4 h-4 text-sky-400" /> How Ratings Move
          </h3>

          <div className="grid gap-4">
            <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl hover:bg-slate-800/60 transition-colors group">
              <div className="flex gap-4 items-start">
                <div className="size-10 rounded-xl bg-sky-500/10 flex items-center justify-center shrink-0 border border-sky-500/20 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-5 h-5 text-sky-400" />
                </div>
                <div>
                  <h4 className="font-black italic uppercase text-slate-200 tracking-tighter mb-1">MMR Logic</h4>
                  <p className="text-sm text-slate-400 leading-relaxed italic font-light">
                    Your visible CockRating is a combination of your core Matchmaking Rating (MMR) and consistency bonuses. Core rating only updates based on match outcomes—wins add points, losses subtract points.
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
                  <h4 className="font-black italic uppercase text-slate-200 tracking-tighter mb-1">Match Predictability</h4>
                  <p className="text-sm text-slate-400 leading-relaxed italic font-light">
                    Beating players higher-rated than you awards substantial rating points, while losing to lower-rated players inflicts a steeper penalty. Expected outcomes yield smaller rating changes.
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
                  <h4 className="font-black italic uppercase text-slate-200 tracking-tighter mb-1">Close Match Protection</h4>
                  <p className="text-sm text-slate-400 leading-relaxed italic font-light">
                    To respect hard-fought games, matches ending in a score margin of 2 points or fewer (e.g., 21-19, 23-21) are treated as close call deuces. Rating gains and losses are dampened by 70% to prevent wild rating swings.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Volatility & Calibrating */}
        <section className="bg-gradient-to-br from-indigo-500/10 to-sky-500/5 border border-indigo-500/20 p-8 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Zap className="w-24 h-24 text-indigo-400" />
          </div>
          
          <h3 className="text-xl font-black italic uppercase tracking-tighter text-indigo-400 mb-4 flex items-center gap-3">
            <RankBadgeIcon rank="Unranked" size="default" /> Certainty & Volatility (Placement)
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed mb-6 italic font-light">
            New players start with <span className="text-white font-bold">Unranked</span> status for their first 5 placement matches. 
            The engine uses an uncertainty Certainty Meter to increase rating mobility initially so you land at your correct rank rapidly.
          </p>

          <div className="bg-slate-900/50 rounded-2xl p-6 border border-indigo-500/10">
            <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-4 text-center">Certainty Calibrator</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800 p-4 rounded-xl border border-slate-700/50 text-center">
                <span className="text-[10px] font-black uppercase text-slate-500 block mb-1">High Volatility (First 5 Games)</span>
                <span className="text-lg font-black text-indigo-400 font-mono">Rapid Swings</span>
                <span className="text-[9px] text-slate-500 block mt-2">Enables fast upward/downward mobility</span>
              </div>
              <div className="bg-slate-800 p-4 rounded-xl border border-slate-700/50 text-center">
                <span className="text-[10px] font-black uppercase text-slate-500 block mb-1">Low Volatility (Established)</span>
                <span className="text-lg font-black text-emerald-400 font-mono">Stable & Precise</span>
                <span className="text-[9px] text-slate-500 block mt-2">Protects rating from sudden bad sessions</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Light Social Adjustments */}
        <section className="space-y-4">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 mb-6">
            <Award className="w-4 h-4 text-emerald-400" /> Light Social Adjustments
          </h3>

          <div className="grid gap-4">
            <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl hover:bg-slate-800/60 transition-colors group">
              <div className="flex gap-4 items-start">
                <div className="size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                  <Zap className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h4 className="font-black italic uppercase text-slate-200 tracking-tighter mb-1">Underdog Upset Bonus</h4>
                  <p className="text-sm text-slate-400 leading-relaxed italic font-light">
                    If your team is calculated to have an expected win probability of **less than 30%** based on matchup history, securing a victory triggers an **Underdog Upset Bonus**, granting you a **+20% bonus multiplier** to your rating gains.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl hover:bg-slate-800/60 transition-colors group">
              <div className="flex gap-4 items-start">
                <div className="size-10 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0 border border-orange-500/20 group-hover:scale-110 transition-transform">
                  <Flame className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <h4 className="font-black italic uppercase text-slate-200 tracking-tighter mb-1">Attendance Streak XP</h4>
                  <p className="text-sm text-slate-400 leading-relaxed italic font-light">
                    Playing matches consistently maintains your session attendance streak. Streaks earn you separate **Activity XP** (independent of your skill rating) that boosts your visible rank. Attendance XP also creates a baseline cushion so players are protected at a skill floor of `1000`.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Rank Tiers */}
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
