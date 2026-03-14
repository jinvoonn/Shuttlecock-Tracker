"use client";

import { Feather } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950 animate-in fade-in duration-500">
      <div className="relative mb-8">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-sky-500/20 blur-2xl rounded-full scale-150 animate-pulse" />
        
        {/* Animated Icon */}
        <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500 to-sky-600 flex items-center justify-center shadow-2xl shadow-sky-500/40 animate-bounce transition-all duration-1000">
          <Feather className="w-12 h-12 text-white transform rotate-45" />
        </div>
      </div>

      <div className="text-center space-y-2">
        <h1 className="text-4xl font-black text-slate-50 tracking-tighter">
          Cock<span className="text-sky-400">Count</span>
        </h1>
        <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.2em]">
          "Because Shuttlecocks Aren’t Free."
        </p>
      </div>

      {/* Loading Indicator */}
      <div className="mt-12 flex flex-col items-center gap-4">
        <div className="w-48 h-1 bg-slate-900 rounded-full overflow-hidden border border-slate-800/50">
          <div className="h-full bg-gradient-to-r from-indigo-500 to-sky-400 w-1/3 rounded-full animate-[loading_1.5s_infinite_ease-in-out]" />
        </div>
        <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest animate-pulse">
          Initializing System
        </span>
      </div>

      <style jsx>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
}
