"use client";

import { useState, useMemo } from "react";
import { Folder } from "@/components/Folder";
import { FilterBar } from "@/components/FilterBar";
import { SessionItem } from "./SessionItem";
import { Calendar } from "lucide-react";

interface Session {
    id: string;
    date: string;
    location: string | null;
    notes: string | null;
    session_players: { players: { name: string } }[];
    session_usage: { quantity_used: number, purchases: { tube_number: number, brands: { name: string } } }[];
}

interface Player {
    id: string;
    name: string;
}

interface Purchase {
    id: string;
    remaining_quantity: number;
    tube_number: number;
    brands: any;
    price_per_tube: number;
    price_per_cock: number;
}

export function SessionsList({ sessions, allPlayers, allPurchases }: {
    sessions: any[],
    allPlayers: Player[],
    allPurchases: Purchase[]
}) {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const filteredSessions = useMemo(() => {
        return sessions.filter(s => {
            const sDate = s.date;
            const matchesStart = !startDate || sDate >= startDate;
            const matchesEnd = !endDate || sDate <= endDate;
            return matchesStart && matchesEnd;
        });
    }, [sessions, startDate, endDate]);

    const handleClear = () => {
        setStartDate("");
        setEndDate("");
    };

    return (
        <Folder title="Play Sessions" defaultOpen={true}>
            <FilterBar
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                onClear={handleClear}
            />

            {filteredSessions.length === 0 ? (
                <div className="rounded-2xl border border-slate-800 border-dashed bg-slate-900/10 p-12 text-center mt-4">
                    <Calendar className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                    <h3 className="text-slate-300 font-medium mb-1">No matching sessions</h3>
                    <p className="text-slate-500 text-sm max-w-sm mx-auto">
                        Adjust your filters or log a new session to see results.
                    </p>
                </div>
            ) : (
                <div className="space-y-4 transition-all">
                    {filteredSessions.map((session) => (
                        <SessionItem
                            key={session.id}
                            session={session}
                            allPlayers={allPlayers}
                            allPurchases={allPurchases}
                        />
                    ))}
                </div>
            )}
        </Folder>
    );
}
