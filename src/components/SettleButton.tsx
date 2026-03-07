"use client";

import { useState } from "react";
import { quickSettle } from "@/app/payments/actions";
import { CheckCircle2, Loader2, DollarSign } from "lucide-react";
import clsx from "clsx";

interface SettleButtonProps {
    playerId: string;
    playerName: string;
    amount: number;
}

export function SettleButton({ playerId, playerName, amount }: SettleButtonProps) {
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);

    const handleSettle = async () => {
        if (amount <= 0) return;

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

    return (
        <button
            onClick={handleSettle}
            disabled={loading || done || amount <= 0}
            className={clsx(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-[0.95] shrink-0",
                done
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50"
                    : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 hover:border-zinc-500"
            )}
            title={`Record RM ${amount.toFixed(2)} payment for ${playerName}`}
        >
            {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : done ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
            ) : (
                <DollarSign className="w-3.5 h-3.5" />
            )}
            {done ? "Settled" : "Quick Settle"}
        </button>
    );
}
