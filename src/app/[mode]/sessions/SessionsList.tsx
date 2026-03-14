"use client";

import { useState, useMemo } from "react";
import { Folder } from "@/components/Folder";
import { FilterBar } from "@/components/FilterBar";
import { SessionItem } from "./SessionItem";
import { Calendar, ChevronDown, ChevronRight } from "lucide-react";
import { useRole } from "@/context/AuthContext";

interface Session {
    id: string;
    date: string;
    location: string | null;
    notes: string | null;
    session_players: { players: { name: string } }[];
    session_usage: { quantity_used: number, purchases: { tube_number: number, brands: { name: string } } }[];
}

interface Player { id: string; name: string; }
interface Purchase { id: string; remaining_quantity: number; tube_number: number; brands: any; price_per_tube: number; price_per_cock: number; }

export function SessionsList({ sessions, allPlayers, allPurchases }: {
    sessions: any[], allPlayers: Player[], allPurchases: Purchase[]
}) {
    const { isAdmin } = useRole();
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [collapsedMonths, setCollapsedMonths] = useState<Set<string>>(new Set());

    const filteredSessions = useMemo(() => {
        return sessions.filter(s => {
            const sDate = s.date;
            return (!startDate || sDate >= startDate) && (!endDate || sDate <= endDate);
        });
    }, [sessions, startDate, endDate]);

    // Group by YYYY-MM
    const groupedByMonth = useMemo(() => {
        const groups: Record<string, any[]> = {};
        for (const s of filteredSessions) {
            const key = s.date.slice(0, 7); // "YYYY-MM"
            if (!groups[key]) groups[key] = [];
            groups[key].push(s);
        }
        return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a)); // newest first
    }, [filteredSessions]);

    const toggleMonth = (key: string) => {
        setCollapsedMonths(prev => {
            const next = new Set(prev);
            next.has(key) ? next.delete(key) : next.add(key);
            return next;
        });
    };

    const formatMonthLabel = (key: string) => {
        const [year, month] = key.split("-");
        return new Date(Number(year), Number(month) - 1).toLocaleString("default", { month: "long", year: "numeric" });
    };

    const content = (
        <div className="mt-2">
            <FilterBar
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                onClear={() => { setStartDate(""); setEndDate(""); }}
            />

            {filteredSessions.length === 0 ? (
                <div className="rounded-2xl border border-slate-800 border-dashed bg-slate-900/10 p-12 text-center mt-4">
                    <Calendar className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                    <h3 className="text-slate-300 font-medium mb-1">No matching sessions</h3>
                    <p className="text-slate-500 text-sm max-w-sm mx-auto">Adjust your filters or log a new session.</p>
                </div>
            ) : (
                <div className="space-y-6 mt-4">
                    {groupedByMonth.map(([monthKey, monthSessions]) => {
                        const isCollapsed = collapsedMonths.has(monthKey);
                        return (
                            <div key={monthKey}>
                                {/* Month header */}
                                <button
                                    onClick={() => toggleMonth(monthKey)}
                                    className="w-full flex items-center justify-between py-2 px-1 mb-3 group"
                                >
                                    <div className="flex items-center gap-2">
                                        {isCollapsed
                                            ? <ChevronRight className="w-4 h-4 text-slate-500" />
                                            : <ChevronDown className="w-4 h-4 text-sky-400" />
                                        }
                                        <span className="text-sm font-bold text-slate-300 group-hover:text-slate-100 transition-colors">
                                            {formatMonthLabel(monthKey)}
                                        </span>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700/50">
                                        {monthSessions.length} sessions
                                    </span>
                                </button>

                                {!isCollapsed && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                                        {monthSessions.map(session => (
                                            <SessionItem
                                                key={session.id}
                                                session={session}
                                                allPlayers={allPlayers}
                                                allPurchases={allPurchases}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );

    if (!isAdmin) {
        return (
            <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-5 h-5 text-sky-400" />
                    <h2 className="text-xl font-bold text-slate-100">Play Sessions</h2>
                </div>
                {content}
            </div>
        );
    }

    return (
        <Folder title="Play Sessions" defaultOpen={true}>
            {content}
        </Folder>
    );
}
