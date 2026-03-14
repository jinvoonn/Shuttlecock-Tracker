"use client";

import { useState } from "react";
import { ArrowDownRight, ArrowUpRight, ArrowUpDown, SortAsc } from "lucide-react";
import { SettleButton } from "@/components/SettleButton";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Deterministic distinct colors per player logic removed in favor of status pills

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


    return (
        <div className="glass-card rounded-3xl overflow-hidden shadow-2xl relative border-slate-800">
            <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900 flex-wrap gap-3">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl italic-header text-white">Player Ledger</h2>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 opacity-60">
                        {players.length} Registered
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
                <div className="divide-y divide-slate-800">
                    {sortedPlayers.map((player) => {
                        const isDebt = player.balance < 0;
                        const isSettled = Math.abs(player.balance) < 0.01;
                        const paidRatio = player.totalShares > 0
                            ? Math.min(1, player.totalPayments / player.totalShares)
                            : 1;

                        return (
                            <div key={player.id} className="flex items-center justify-between px-6 py-5 hover:bg-slate-800/30 transition-all duration-300 gap-4 group/item border-b border-slate-800/50 last:border-0 relative overflow-hidden">
                                <div className="flex items-center gap-5 flex-1 min-w-0 z-10">
                                    {/* Vertical Status Pill */}
                                    <div className={clsx(
                                        "w-2 h-10 rounded-full transition-all duration-500 shrink-0 shadow-lg",
                                        isSettled 
                                            ? "bg-slate-700" 
                                            : isDebt 
                                                ? "bg-rose-400 shadow-rose-500/20" 
                                                : "bg-emerald-400 shadow-emerald-500/20"
                                    )} />

                                    <Link href={`/${mode}/players/${player.id}`} className="min-w-0 flex-1 group/link">
                                        <div className="flex flex-col">
                                            <p className="font-black text-slate-100 text-sm uppercase tracking-tight truncate group-hover/link:text-sky-400 transition-colors">
                                                {player.name}
                                            </p>
                                            <p className="text-[9px] text-slate-500 font-mono tracking-tighter uppercase mt-0.5">
                                                ID: {player.id.slice(0, 8)} // {isSettled ? "Settled" : isDebt ? "Owed" : "Credit"}
                                            </p>
                                        </div>
                                    </Link>
                                </div>

                                <div className="flex items-center gap-6 z-10">
                                    <div className="text-right flex flex-col items-end">
                                        <p className={clsx(
                                            "font-mono text-sm font-black tracking-tighter transition-all",
                                            isSettled ? "text-slate-600" : isDebt ? "text-rose-400" : "text-emerald-400"
                                        )}>
                                            {isDebt ? "-" : isSettled ? "" : "+"}RM {Math.abs(player.balance).toFixed(2)}
                                        </p>
                                        <p className="text-[9px] text-slate-600 font-bold uppercase tracking-wider mt-0.5">
                                            {isSettled ? "Balanced" : isDebt ? "Debt" : "Available"}
                                        </p>
                                    </div>
                                    
                                    {isDebt && (
                                        <div className="shrink-0">
                                            <SettleButton
                                                playerId={player.id}
                                                playerName={player.name}
                                                amount={Math.abs(player.balance)}
                                            />
                                        </div>
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
