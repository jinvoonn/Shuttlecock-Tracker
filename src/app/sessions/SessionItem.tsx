"use client";

import { useState } from "react";
import { Trash2, Calendar, Target, MapPin, Edit3 } from "lucide-react";
import { SessionForm } from "./SessionForm";
import { deleteSession } from "./actions";

interface SessionItemProps {
    session: any;
    allPlayers: any[];
    allPurchases: any[];
}

export function SessionItem({ session, allPlayers, allPurchases }: SessionItemProps) {
    const [isEditing, setIsEditing] = useState(false);

    if (isEditing) {
        // Prepare initial data for the form
        const initialUsage: Record<string, number> = {};
        session.session_usage?.forEach((su: any) => {
            initialUsage[su.purchase_id] = su.quantity_used;
        });

        const initialData = {
            id: session.id,
            date: session.date,
            location: session.location || "",
            notes: session.notes || "",
            players: session.session_players?.map((sp: any) => sp.player_id) || [],
            usage: initialUsage
        };

        // For editing, we might want to "restore" the current usage to the available purchases
        // so the user sees the true "available" amount if they were to cancel or modify this session.
        const restoredPurchases = allPurchases.map(p => {
            const usedInThisSession = initialUsage[p.id] || 0;
            return {
                ...p,
                remaining_quantity: p.remaining_quantity + usedInThisSession
            };
        });

        return (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <SessionForm
                    players={allPlayers}
                    purchases={restoredPurchases}
                    initialData={initialData}
                    isEdit={true}
                    onCancel={() => setIsEditing(false)}
                />
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 backdrop-blur-sm p-5 flex flex-col gap-4 group transition-all hover:bg-zinc-900/40">
            {/* Header */}
            <div className="flex items-start sm:items-center justify-between border-b border-zinc-800/50 pb-4">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 flex flex-col items-center justify-center bg-zinc-800 rounded-lg border border-zinc-700 shadow-inner">
                        <span className="text-[10px] font-bold uppercase text-zinc-500 leading-none">
                            {new Date(session.date).toLocaleString('default', { month: 'short' })}
                        </span>
                        <span className="text-xl font-bold text-zinc-100 font-mono leading-tight">
                            {new Date(session.date).getDate()}
                        </span>
                    </div>
                    <div>
                        <h3 className="font-medium text-zinc-200 flex items-center gap-1.5 flex-wrap">
                            <Calendar className="w-3.5 h-3.5 text-cyan-500/80" />
                            {new Date(session.date).toLocaleDateString()}
                            {session.location && (
                                <span className="text-xs text-zinc-500 flex items-center gap-1">
                                    <MapPin className="w-3 h-3 ml-2" /> {session.location}
                                </span>
                            )}
                        </h3>
                        {session.notes && <p className="text-xs text-zinc-500 mt-1">{session.notes}</p>}
                    </div>
                </div>

                <div className="flex gap-1">
                    <button
                        onClick={() => setIsEditing(true)}
                        className="p-2 rounded-lg text-zinc-600 hover:text-violet-400 hover:bg-violet-500/10 transition-colors"
                        title="Edit session"
                    >
                        <Edit3 className="w-5 h-5" />
                    </button>
                    <form action={deleteSession.bind(null, session.id)}>
                        <button type="submit" className="p-2 rounded-lg text-zinc-600 hover:text-rose-400 hover:bg-rose-500/10 transition-colors" title="Delete session">
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Players list */}
                <div className="space-y-2">
                    <div className="text-[10px] uppercase font-bold text-zinc-600">
                        {session.session_players?.length || 0} Players
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {session.session_players?.map((sp: any, i: number) => {
                            const name = sp.players?.name || "Unknown";
                            return (
                                <div key={i} className="flex items-center gap-1.5 bg-zinc-950/50 px-2 py-1 rounded border border-zinc-800">
                                    <span className="text-xs font-medium text-zinc-300">{name}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Usage list */}
                <div className="space-y-2 sm:border-l border-zinc-800/50 sm:pl-4">
                    <div className="text-[10px] uppercase font-bold text-zinc-600 flex items-center gap-1">
                        <Target className="w-3 h-3" /> Tubes Used
                    </div>
                    <div className="flex flex-col gap-1.5">
                        {session.session_usage?.length === 0 ? (
                            <span className="text-xs text-zinc-500 italic">No shuttles used.</span>
                        ) : (
                            session.session_usage?.map((su: any, i: number) => {
                                const bName = su.purchases?.brands?.name || "Unknown";
                                const tNo = su.purchases?.tube_number || "?";
                                const q = su.quantity_used;
                                return (
                                    <div key={i} className="flex items-center justify-between bg-zinc-950/50 px-2.5 py-1.5 rounded border border-zinc-800/50">
                                        <span className="text-xs text-zinc-400">{bName} <span className="text-[10px]">({tNo})</span></span>
                                        <span className="text-xs font-mono font-medium text-amber-400">-{q}</span>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
