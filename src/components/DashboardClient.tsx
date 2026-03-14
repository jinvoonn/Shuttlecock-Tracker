"use client";

import { useState } from "react";
import { ArrowDownRight, ArrowUpRight, ArrowUpDown, SortAsc } from "lucide-react";
import { SettleButton } from "@/components/SettleButton";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Deterministic distinct colors per player — cycles through a palette
const AVATAR_COLORS = [
    "ring-sky-500 bg-sky-500/10 text-sky-300",
    "ring-violet-500 bg-violet-500/10 text-violet-300",
    "ring-emerald-500 bg-emerald-500/10 text-emerald-300",
    "ring-amber-500 bg-amber-500/10 text-amber-300",
    "ring-rose-500 bg-rose-500/10 text-rose-300",
    "ring-pink-500 bg-pink-500/10 text-pink-300",
    "ring-teal-500 bg-teal-500/10 text-teal-300",
    "ring-orange-500 bg-orange-500/10 text-orange-300",
    "ring-cyan-500 bg-cyan-500/10 text-cyan-300",
    "ring-indigo-500 bg-indigo-500/10 text-indigo-300",
    "ring-lime-500 bg-lime-500/10 text-lime-300",
    "ring-fuchsia-500 bg-fuchsia-500/10 text-fuchsia-300",
];

type SortMode = "debt" | "alpha" | "settled-last";

interface Player {
    id: string;
    name: string;
    totalShares: number;
    totalPayments: number;
    balance: number;
}

export function DashboardClient({ players }: { players: Player[] }) {
    const [sortMode, setSortMode] = useState<SortMode>("debt");
    const pathname = usePathname();
    const mode = pathname.split('/')[1] || 'view';

    const sortedPlayers = [...players].sort((a, b) => {
        if (sortMode === "debt") return a.balance - b.balance;
        if (sortMode === "alpha") return a.name.localeCompare(b.name);
        if (sortMode === "settled-last") {
            const aSettled = Math.abs(a.balance) < 0.01 ? 1 : 0;
            const bSettled = Math.abs(b.balance) < 0.01 ? 1 : 0;
            return aSettled - bSettled || a.balance - b.balance;
        }
        return 0;
    });

    // Map player IDs to color indices (stable per player order in original list)
    const colorMap = Object.fromEntries(players.map((p, i) => [p.id, i % AVATAR_COLORS.length]));

    return (
        <div className="glass-card rounded-3xl overflow-hidden shadow-2xl relative">
            <div className="px-6 py-5 border-b border-slate-800/50 flex items-center justify-between bg-slate-900/40 backdrop-blur-md flex-wrap gap-3">
                <div className="flex items-center gap-3">
                    <h2 className="text-lg font-black uppercase tracking-tight text-slate-100 italic">Player Balances</h2>
                    <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 bg-sky-500/10 rounded-full text-sky-400 border border-sky-500/20">
                        {players.length} Active
                    </span>
                </div>

                {/* Sort toggle */}
                <div className="flex items-center gap-1 bg-slate-950/50 rounded-xl p-1 border border-slate-800/50">
                    {([
                        { key: "debt", label: "Debt" },
                        { key: "alpha", label: "A–Z" },
                        { key: "settled-last", label: "Settled" },
                    ] as { key: SortMode; label: string }[]).map(opt => (
                        <button
                            key={opt.key}
                            onClick={() => setSortMode(opt.key)}
                            className={clsx(
                                "text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all duration-300",
                                sortMode === opt.key
                                    ? "bg-sky-500 text-slate-950 shadow-lg shadow-sky-500/20"
                                    : "text-slate-500 hover:text-slate-300"
                            )}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {sortedPlayers.length === 0 ? (
                <div className="p-20 text-center">
                    <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700/50 text-slate-600">
                        <ArrowUpDown className="w-8 h-8" />
                    </div>
                    <h3 className="text-slate-300 font-bold mb-1">No players found</h3>
                    <p className="text-slate-500 text-sm max-w-xs mx-auto">No data recorded yet.</p>
                </div>
            ) : (
                <div className="divide-y divide-slate-800/30">
                    {sortedPlayers.map((player) => {
                        const isDebt = player.balance < 0;
                        const isSettled = Math.abs(player.balance) < 0.01;
                        const colorClass = AVATAR_COLORS[colorMap[player.id] ?? 0];
                        const paidRatio = player.totalShares > 0
                            ? Math.min(1, player.totalPayments / player.totalShares)
                            : 1;

                        return (
                            <div key={player.id} className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-5 hover:bg-white/5 transition-all duration-300 gap-4 group/item relative overflow-hidden">
                                {/* Subtle background glow for negative/positive */}
                                {!isSettled && (
                                    <div className={clsx(
                                        "absolute inset-0 opacity-0 group-hover/item:opacity-5 transition-opacity pointer-events-none",
                                        isDebt ? "bg-rose-500" : "bg-emerald-500"
                                    )} />
                                )}

                                <div className="flex items-center gap-4 flex-1 min-w-0 z-10">
                                    <Link href={`/${mode}/players/${player.id}`} className="flex items-center gap-4 flex-1 min-w-0 group/link">
                                        {/* Color-coded avatar */}
                                        <div className={clsx(
                                            "h-12 w-12 rounded-2xl flex items-center justify-center font-black text-lg shrink-0 ring-1 transition-all shadow-2xl",
                                            colorClass,
                                            "group-hover/link:ring-2 group-hover/link:scale-110 group-hover/link:shadow-sky-500/20"
                                        )}>
                                            {player.name.charAt(0).toUpperCase()}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="font-black text-slate-100 text-base truncate group-hover/link:text-sky-400 transition-colors flex items-center gap-2 tracking-tight">
                                                <span className="truncate">{player.name}</span>
                                                <ArrowUpRight className="w-4 h-4 shrink-0 opacity-0 -translate-x-2 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all text-sky-400" />
                                            </p>
                                            <div className="flex items-center gap-x-3 mt-1 underline-offset-4">
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                                    Paid <span className="text-slate-300">RM {player.totalPayments.toFixed(2)}</span>
                                                </span>
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                                    Cost <span className="text-slate-300">RM {player.totalShares.toFixed(2)}</span>
                                                </span>
                                            </div>
                                            {/* Progress bar */}
                                            <div className="mt-3 h-1 w-full max-w-[140px] bg-slate-800/50 rounded-full overflow-hidden border border-white/5">
                                                <div
                                                    className={clsx(
                                                        "h-full rounded-full transition-all duration-1000",
                                                        isSettled ? "bg-slate-600" : isDebt ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]" : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                                                    )}
                                                    style={{ width: `${paidRatio * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    </Link>
                                </div>

                                <div className="flex items-center justify-between sm:justify-end gap-5 sm:gap-8 w-full sm:w-auto border-t sm:border-t-0 border-white/5 pt-4 sm:pt-0 z-10">
                                    <div className="flex flex-col items-end min-w-[100px]">
                                        <div className={clsx(
                                            "flex items-center gap-1 font-black font-mono tracking-tighter text-2xl transition-all",
                                            isSettled ? "text-slate-600" : isDebt ? "text-rose-400 group-hover/item:scale-105" : "text-emerald-400 group-hover/item:scale-105"
                                        )}>
                                            <span className="text-xs mr-0.5 opacity-50">RM</span>
                                            {Math.abs(player.balance).toFixed(2)}
                                        </div>
                                        <span className={clsx(
                                            "text-[9px] uppercase font-black tracking-[0.2em] mt-0.5 px-2 py-0.5 rounded border transition-all",
                                            isSettled 
                                                ? "text-slate-600 border-slate-800" 
                                                : isDebt 
                                                    ? "text-rose-500 border-rose-500/20 bg-rose-500/5" 
                                                    : "text-emerald-500 border-emerald-500/20 bg-emerald-500/5"
                                        )}>
                                            {isSettled ? "Settled ✓" : isDebt ? "Owed" : "Exceed"}
                                        </span>
                                    </div>
                                    
                                    {isDebt && (
                                        <SettleButton
                                            playerId={player.id}
                                            playerName={player.name}
                                            amount={Math.abs(player.balance)}
                                        />
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
