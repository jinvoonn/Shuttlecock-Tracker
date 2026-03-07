"use client";

import { useState } from "react";
import { addSession, editSession } from "./actions";
import { PlusCircle, Target, Users, MapPin, X, Check, Edit3 } from "lucide-react";
import { DatePicker } from "@/components/DatePicker";
import clsx from "clsx";

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

interface InitialData {
    id: string;
    date: string;
    location: string;
    notes: string;
    players: string[]; // ids
    usage: Record<string, number>;
}

export function SessionForm({
    players,
    purchases,
    initialData,
    isEdit = false,
    onCancel
}: {
    players: Player[],
    purchases: Purchase[],
    initialData?: InitialData,
    isEdit?: boolean,
    onCancel?: () => void
}) {
    const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
    const [location, setLocation] = useState(initialData?.location || "");
    const [notes, setNotes] = useState(initialData?.notes || "");

    const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>(initialData?.players || []);
    const [newPlayerName, setNewPlayerName] = useState("");
    const [newPlayers, setNewPlayers] = useState<string[]>([]);

    const [usage, setUsage] = useState<Record<string, number>>(initialData?.usage || {});

    const handleAddExistingPlayer = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        if (val && !selectedPlayerIds.includes(val)) {
            setSelectedPlayerIds([...selectedPlayerIds, val]);
        }
        e.target.value = ""; // reset
    };

    const handleAddNewPlayer = (e: React.FormEvent) => {
        e.preventDefault();
        const clean = newPlayerName.trim();
        if (clean && !newPlayers.includes(clean)) {
            setNewPlayers([...newPlayers, clean]);
        }
        setNewPlayerName("");
    };

    const removeSelectedPlayer = (id: string) => {
        setSelectedPlayerIds(selectedPlayerIds.filter(pid => pid !== id));
    };

    const removeNewPlayer = (name: string) => {
        setNewPlayers(newPlayers.filter(pn => pn !== name));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const usagePayload = Object.entries(usage)
            .map(([purchaseId, quantityUsed]) => ({ purchaseId, quantityUsed }))
            .filter(item => item.quantityUsed > 0);

        const payload = {
            date,
            location,
            notes,
            playerIds: selectedPlayerIds,
            newPlayerNames: newPlayers,
            usage: usagePayload
        };

        try {
            if (isEdit && initialData) {
                await editSession(initialData.id, JSON.stringify(payload));
                if (onCancel) onCancel();
            } else {
                await addSession(JSON.stringify(payload));
                // Reset form on success
                setSelectedPlayerIds([]);
                setNewPlayers([]);
                setUsage({});
                setLocation("");
                setNotes("");
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                alert(err.message || "Failed to process session");
            }
        }
    };

    function getStatusColor(remaining: number) {
        if (remaining >= 8) return "bg-emerald-500 shadow-emerald-500/50";
        if (remaining >= 4) return "bg-yellow-500 shadow-yellow-500/50";
        if (remaining >= 1) return "bg-rose-500 shadow-rose-500/50";
        return "bg-zinc-600 shadow-zinc-600/50";
    }

    return (
        <div className={clsx(
            "border rounded-2xl p-6 transition-all duration-300",
            isEdit ? "bg-violet-950/10 border-violet-500/30" : "bg-zinc-900/30 border-zinc-800/80 lg:sticky lg:top-8"
        )}>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className={clsx(
                        "p-2.5 rounded-xl",
                        isEdit ? "bg-violet-500/10 text-violet-400" : "bg-cyan-500/10 text-cyan-400"
                    )}>
                        {isEdit ? <Edit3 className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
                    </div>
                    <h2 className="text-lg font-medium text-zinc-100">{isEdit ? "Edit Session" : "Log Session"}</h2>
                </div>
                {isEdit && onCancel && (
                    <button onClick={onCancel} className="text-zinc-500 hover:text-zinc-300 p-2">
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 text-sm">

                {/* Basic Details */}
                <div className="space-y-4">
                    <div>
                        <label className="block font-medium text-zinc-400 mb-1">Date</label>
                        <DatePicker name="date" defaultValue={date} onChange={setDate} />
                    </div>

                    <div>
                        <label className="block font-medium text-zinc-400 mb-1">Location (Optional)</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                                <MapPin className="w-4 h-4" />
                            </div>
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="Where did you play?"
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-4 py-2.5 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Players Section */}
                <div className="space-y-4 pt-4 border-t border-zinc-800/50">
                    <h3 className="font-medium text-zinc-300 flex items-center gap-2">
                        <Users className="w-4 h-4 text-zinc-500" /> Attendees
                    </h3>

                    <div className="flex gap-2">
                        <select
                            onChange={handleAddExistingPlayer}
                            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-sm"
                            defaultValue=""
                        >
                            <option value="" disabled>Select Existing Player ▼</option>
                            {players.map(p => (
                                <option key={p.id} value={p.id} disabled={selectedPlayerIds.includes(p.id)}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="New player name..."
                            value={newPlayerName}
                            onChange={(e) => setNewPlayerName(e.target.value)}
                            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-sm"
                        />
                        <button
                            type="button"
                            onClick={handleAddNewPlayer}
                            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-3 py-2 rounded-lg font-medium transition-colors whitespace-nowrap"
                        >
                            + Add
                        </button>
                    </div>

                    {(selectedPlayerIds.length > 0 || newPlayers.length > 0) && (
                        <div className="bg-zinc-950/50 p-3 rounded-xl border border-zinc-800/50">
                            <p className="text-xs text-zinc-500 mb-2">Selected Players:</p>
                            <div className="flex flex-wrap gap-2">
                                {selectedPlayerIds.map(id => {
                                    const p = players.find(x => x.id === id);
                                    return (
                                        <div key={id} className="flex items-center gap-1.5 bg-zinc-800/80 px-2 py-1 rounded text-xs text-zinc-300">
                                            {p?.name}
                                            <button type="button" onClick={() => removeSelectedPlayer(id)} className="text-zinc-500 hover:text-rose-400">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    );
                                })}
                                {newPlayers.map(name => (
                                    <div key={name} className="flex items-center gap-1.5 bg-cyan-900/30 text-cyan-200 px-2 py-1 rounded text-xs border border-cyan-800/50">
                                        {name} <span className="text-[9px] opacity-70">(New)</span>
                                        <button type="button" onClick={() => removeNewPlayer(name)} className="text-cyan-500 hover:text-cyan-300 ml-1">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Shuttlecock Usage Section */}
                <div className="space-y-4 pt-4 border-t border-zinc-800/50">
                    <h3 className="font-medium text-zinc-300 flex items-center gap-2">
                        <Target className="w-4 h-4 text-zinc-500" /> Shuttlecock Usage
                    </h3>

                    {purchases.length === 0 ? (
                        <p className="text-xs text-zinc-500 italic">No available shuttlecock tubes.</p>
                    ) : (
                        <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                            {purchases.map(p => {
                                const brandName = p.brands?.name || 'Unknown';
                                const remaining = p.remaining_quantity;
                                const colorClass = getStatusColor(remaining);
                                const val = usage[p.id] || 0;

                                return (
                                    <div key={p.id} className="flex items-center justify-between bg-zinc-950/50 p-3 rounded-lg border border-zinc-800/50">
                                        <div className="flex items-center gap-3">
                                            <div className={clsx("w-2 h-2 rounded-full", colorClass)} />
                                            <div>
                                                <p className="font-medium text-zinc-300 text-sm">
                                                    {brandName} <span className="text-zinc-500 text-xs">({p.tube_number})</span>
                                                </p>
                                                <p className="text-[10px] text-zinc-500 flex gap-2">
                                                    <span>{remaining} left</span>
                                                    <span className="text-emerald-500/80 font-mono font-bold">RM {Number(p.price_per_tube || 0).toFixed(2)}</span>
                                                    <span className="opacity-70 font-mono">RM {Number(p.price_per_cock || 0).toFixed(2)}/pc</span>
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <label className="text-xs text-zinc-500">Use:</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={val || ""}
                                                onChange={(e) => {
                                                    const v = parseInt(e.target.value, 10);
                                                    setUsage({
                                                        ...usage,
                                                        [p.id]: isNaN(v) ? 0 : Math.max(0, v)
                                                    });
                                                }}
                                                className="w-16 bg-zinc-900 border border-zinc-700 rounded-md px-2 py-1 text-center font-mono text-zinc-200 focus:outline-none focus:border-cyan-500"
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="flex gap-3 mt-4">
                    {isEdit && onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium py-3 px-4 rounded-xl transition-all"
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        type="submit"
                        className={clsx(
                            "flex-[2] text-white font-medium py-3 px-4 rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2",
                            isEdit ? "bg-violet-600 hover:bg-violet-500 shadow-violet-500/20" : "bg-cyan-600 hover:bg-cyan-500 shadow-cyan-500/20"
                        )}
                    >
                        {isEdit ? <Check className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
                        {isEdit ? "Save Changes" : "Save Session"}
                    </button>
                </div>
            </form>
        </div>
    );
}
