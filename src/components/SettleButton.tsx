"use client";

import { useState } from "react";
import { quickSettle } from "@/lib/actions/payments";
import { HandCoins, Loader2, CheckCircle2 } from "lucide-react";
import clsx from "clsx";
import { useRole } from "@/context/AuthContext";

interface SettleButtonProps {
    playerId: string;
    playerName: string;
    amount: number;
}

export function SettleButton({ playerId, playerName, amount }: SettleButtonProps) {
    const { isAdmin } = useRole();
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);

    const handleSettle = async () => {
        if (!isAdmin || amount <= 0) return;

        setLoading(true);
        try {
            await quickSettle(playerId, amount);
            setDone(true);
            setTimeout(() => setDone(false), 2000);
        } catch (err: any) {
            alert(err.message || "Failed to settle up");
        } finally {
            setLoading(false);
        }
    };

    if (!isAdmin) return null;

    return (
        <button
            onClick={handleSettle}
            disabled={loading || done || amount <= 0}
            className={clsx(
                "flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all active:scale-[0.95] shrink-0 border shadow-lg",
                done
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-emerald-500/10"
                    : "bg-slate-800/80 hover:bg-sky-600 text-slate-300 hover:text-white border-slate-700 hover:border-sky-500 shadow-slate-950/20"
            )}
            title={`Record RM ${amount.toFixed(2)} payment for ${playerName}`}
        >
            {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : done ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
            ) : (
                <HandCoins className="w-3.5 h-3.5" />
            )}
            {done ? "Settled" : "Quick Settle"}
        </button>
    );
}
