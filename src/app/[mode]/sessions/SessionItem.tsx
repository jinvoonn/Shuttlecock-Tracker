"use client";

import { useState } from "react";
import { Trash2, Calendar, Target, MapPin, Edit3, User } from "lucide-react";
import { SessionForm } from "./SessionForm";
import { deleteSession } from "@/lib/actions/sessions";
import { SessionMatches } from "./SessionMatches";
import { useRole } from "@/context/AuthContext";

interface SessionItemProps {
    session: any;
    allPlayers: any[];
    allPurchases: any[];
}

export function SessionItem({ session, allPlayers, allPurchases }: SessionItemProps) {
    const { isAdmin } = useRole();
    const [isEditing, setIsEditing] = useState(false);

    if (isEditing) {
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
        <div className="glass-card rounded-2xl p-5 flex flex-col gap-4 group transition-all duration-500 glass-card-hover">
            {/* Header */}
            <div className="flex items-start sm:items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                    <div className="h-14 w-14 flex flex-col items-center justify-center bg-slate-950/40 rounded-2xl border border-white/5 shadow-2xl">
                        <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest leading-none mb-1">
                            {new Date(session.date).toLocaleString('default', { month: 'short' })}
                        </span>
                        <span className="text-2xl font-black text-slate-100 font-mono tracking-tighter leading-none">
                            {new Date(session.date).getDate()}
                        </span>
                    </div>
                    <div>
                        <h3 className="font-black text-slate-100 flex items-center gap-2 flex-wrap tracking-tight italic">
                            {new Date(session.date).toLocaleDateString(undefined, { weekday: 'long' })}
                            {session.location && (
                                <span className="text-[10px] text-slate-500 flex items-center gap-1 normal-case not-italic tracking-widest bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                                    <MapPin className="w-3 h-3" /> {session.location}
                                </span>
                            )}
                        </h3>
                        {session.notes && <p className="text-xs text-slate-500 mt-1 font-medium">{session.notes}</p>}
                    </div>
                </div>

                {isAdmin && (
                    <div className="flex gap-1.5">
                        <button
                            onClick={() => setIsEditing(true)}
                            className="p-2.5 rounded-xl text-slate-500 hover:text-violet-400 hover:bg-violet-500/10 transition-all duration-300 border border-transparent hover:border-violet-500/20"
                            title="Edit session"
                        >
                            <Edit3 className="w-5 h-5" />
                        </button>
                        <form action={deleteSession.bind(null, session.id)}>
                            <button type="submit" className="p-2.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-300 border border-transparent hover:border-rose-500/20" title="Delete session">
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </form>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Players list */}
                <div className="space-y-3">
                    <div className="text-[10px] uppercase font-black text-slate-500 tracking-widest flex items-center gap-2">
                        <User className="w-3 h-3" /> {session.session_players?.length || 0} Players
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {session.session_players?.map((sp: any, i: number) => {
                            const name = sp.players?.name || "Unknown";
                            return (
                                <div key={i} className="flex items-center gap-1.5 bg-slate-950/30 px-3 py-1.5 rounded-xl border border-white/5 shadow-sm group-hover:border-white/10 transition-colors">
                                    <span className="text-xs font-bold text-slate-300 tracking-tight">{name}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Usage list */}
                <div className="space-y-3 sm:border-l border-white/5 sm:pl-6">
                    <div className="text-[10px] uppercase font-black text-slate-500 tracking-widest flex items-center gap-2">
                        <Target className="w-3 h-3" /> Tubes Used
                    </div>
                    <div className="flex flex-col gap-2">
                        {session.session_usage?.length === 0 ? (
                            <span className="text-xs text-slate-500 italic opacity-60">No shuttles used.</span>
                        ) : (
                            session.session_usage?.map((su: any, i: number) => {
                                const bName = su.purchases?.brands?.name || "Unknown";
                                const tNo = su.purchases?.tube_number || "?";
                                const q = su.quantity_used;
                                return (
                                    <div key={i} className="flex items-center justify-between bg-slate-950/30 px-3 py-2 rounded-xl border border-white/5 shadow-sm group-hover:border-white/10 transition-colors">
                                        <span className="text-xs text-slate-400 font-bold tracking-tight">{bName} <span className="text-slate-600 ml-1">#{tNo}</span></span>
                                        <span className="text-xs font-black font-mono text-sky-400 bg-sky-400/10 px-2 py-0.5 rounded-lg border border-sky-400/20">-{q}</span>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Matches Section! */}
            <div className="mt-2">
                <SessionMatches 
                    sessionId={session.id} 
                    sessionPlayers={session.session_players || []} 
                    matches={session.matches || []} 
                />
            </div>
        </div>
    );
}
