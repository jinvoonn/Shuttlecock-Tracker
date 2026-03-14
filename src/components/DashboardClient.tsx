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
        <div className="rounded-3xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm overflow-hidden shadow-2xl shadow-slate-950/50">
            <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60 flex-wrap gap-3">
                <div className="flex items-center gap-3">
                    <h2 className="text-lg font-bold uppercase tracking-tight text-slate-200">Player Balances</h2>
                    <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 bg-slate-800/80 rounded-full text-slate-500 border border-slate-700/50">
                        {players.length} Registered
                    </span>
                </div>

                {/* Sort toggle */}
                <div className="flex items-center gap-1 bg-slate-800/60 rounded-xl p-1 border border-slate-700/50">
                    {([
                        { key: "debt", label: "By Debt" },
                        { key: "alpha", label: "A–Z" },
                        { key: "settled-last", label: "Unsettled" },
                    ] as { key: SortMode; label: string }[]).map(opt => (
                        <button
                            key={opt.key}
                            onClick={() => setSortMode(opt.key)}
                            className={clsx(
                                "text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all duration-200",
                                sortMode === opt.key
                                    ? "bg-sky-500 text-slate-950 shadow"
                                    : "text-slate-400 hover:text-slate-200"
                            )}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {sortedPlayers.length === 0 ? (
                <div className="p-20 text-center">
                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700 text-slate-600">
                        <ArrowUpDown className="w-8 h-8" />
                    </div>
                    <h3 className="text-slate-300 font-bold mb-1">No players found</h3>
                    <p className="text-slate-500 text-sm max-w-xs mx-auto">No data recorded yet.</p>
                </div>
            ) : (
                <div className="divide-y divide-slate-800/50">
                    {sortedPlayers.map((player) => {
                        const isDebt = player.balance < 0;
                        const isSettled = Math.abs(player.balance) < 0.01;
                        const colorClass = AVATAR_COLORS[colorMap[player.id] ?? 0];
                        const paidRatio = player.totalShares > 0
                            ? Math.min(1, player.totalPayments / player.totalShares)
                            : 1;

                        return (
                            <div key={player.id} className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-5 hover:bg-slate-800/30 transition-all gap-4 group/item">
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <Link href={`/${mode}/players/${player.id}`} className="flex items-center gap-4 flex-1 min-w-0 group/link">
                                        {/* Color-coded avatar */}
                                        <div className={clsx(
                                            "h-12 w-12 rounded-2xl flex items-center justify-center font-bold text-lg shrink-0 ring-2 transition-all shadow-inner",
                                            colorClass,
                                            "group-hover/link:ring-4 group-hover/link:scale-105"
                                        )}>
                                            {player.name.charAt(0).toUpperCase()}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="font-bold text-slate-200 truncate group-hover/link:text-sky-400 transition-colors flex items-center gap-2">
                                                {player.name}
                                                <ArrowUpRight className="w-3.5 h-3.5 opacity-0 -ml-2 group-hover/link:opacity-100 group-hover/link:ml-0 transition-all text-sky-400" />
                                            </p>
                                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                <span className="text-[10px] font-bold uppercase tracking-tight text-slate-600">
                                                    Paid RM {player.totalPayments.toFixed(2)}
                                                </span>
                                                <span className="w-1 h-1 rounded-full bg-slate-700" />
                                                <span className="text-[10px] font-bold uppercase tracking-tight text-slate-600">
                                                    Cost RM {player.totalShares.toFixed(2)}
                                                </span>
                                            </div>
                                            {/* Progress bar */}
                                            <div className="mt-2 h-1 w-full max-w-[160px] bg-slate-800 rounded-full overflow-hidden">
                                                <div
                                                    className={clsx(
                                                        "h-full rounded-full transition-all duration-700",
                                                        isSettled ? "bg-slate-500" : isDebt ? "bg-rose-500" : "bg-emerald-500"
                                                    )}
                                                    style={{ width: `${paidRatio * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    </Link>
                                </div>

                                <div className="flex items-center justify-between sm:justify-end gap-5 sm:gap-6 w-full sm:w-auto border-t sm:border-t-0 border-slate-800/50 pt-4 sm:pt-0">
                                    {isDebt && (
                                        <SettleButton
                                            playerId={player.id}
                                            playerName={player.name}
                                            amount={Math.abs(player.balance)}
                                        />
                                    )}

                                    <div className="flex flex-col items-end sm:min-w-[120px]">
                                        <div className={clsx(
                                            "flex items-center gap-1.5 font-bold font-mono tracking-tighter",
                                            isSettled ? "text-slate-500" : isDebt ? "text-rose-400" : "text-emerald-400"
                                        )}>
                                            {!isSettled && (isDebt
                                                ? <ArrowDownRight className="w-5 h-5" />
                                                : <ArrowUpRight className="w-5 h-5" />
                                            )}
                                            <span className="text-2xl">RM {Math.abs(player.balance).toFixed(2)}</span>
                                        </div>
                                        <span className={clsx(
                                            "text-[10px] uppercase font-bold tracking-widest mt-0.5",
                                            isSettled ? "text-slate-600" : isDebt ? "text-rose-500/60" : "text-emerald-500/60"
                                        )}>
                                            {isSettled ? "Settled ✓" : isDebt ? "In Debt" : "Credit"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
