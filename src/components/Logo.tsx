"use client";

import { Feather } from "lucide-react";
import clsx from "clsx";

export function Logo({ className, iconOnly = false }: { className?: string, iconOnly?: boolean }) {
    return (
        <div className={clsx("flex items-center gap-3", className)}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-sky-600 shadow-lg shadow-sky-500/20 shrink-0 flex items-center justify-center text-white relative group overflow-hidden">
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Feather className="w-5 h-5 text-white transform rotate-45 group-hover:scale-110 transition-transform" />
            </div>
            {!iconOnly && (
                <div className="flex flex-col leading-none">
                    <span className="text-xl font-black text-slate-50 tracking-tighter">
                        Cock<span className="text-sky-400">Count</span>
                    </span>
                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                        Shuttle Tracker
                    </span>
                </div>
            )}
        </div>
    );
}
