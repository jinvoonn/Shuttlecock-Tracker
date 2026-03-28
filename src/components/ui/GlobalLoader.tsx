"use client";

import { useLoading } from "@/context/LoadingContext";
import { Feather } from "lucide-react";

export default function GlobalLoader() {
  const { loading } = useLoading();

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900/80 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-200">
      <div className="flex flex-col items-center gap-4">
        {/* Glow effect */}
        <div className="absolute bg-emerald-500/10 blur-2xl rounded-full w-32 h-32 animate-pulse" />
        
        {/* Animated Icon */}
        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 flex items-center justify-center shadow-2xl shadow-emerald-500/20 animate-bounce transition-all duration-700">
          <Feather className="w-8 h-8 text-emerald-400 transform rotate-45" />
        </div>
        
        <div className="text-emerald-400 text-sm font-black tracking-widest uppercase animate-pulse">
          Loading...
        </div>
      </div>
    </div>
  );
}
