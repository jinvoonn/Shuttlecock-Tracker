"use client";

import { useState } from "react";
import { addSession, editSession } from "@/lib/actions/sessions";
import { PlusCircle, Target, Users, MapPin, X, Check, Edit3 } from "lucide-react";
import { DatePicker } from "@/components/DatePicker";
import clsx from "clsx";
import { useRole } from "@/context/AuthContext";

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
    const { isAdmin } = useRole();
    const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
    const [location, setLocation] = useState(initialData?.location || "");
    const [notes, setNotes] = useState(initialData?.notes || "");

    const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>(initialData?.players || []);
    const [newPlayerName, setNewPlayerName] = useState("");
    const [newPlayers, setNewPlayers] = useState<string[]>([]);

    const [usage, setUsage] = useState<Record<string, number>>(initialData?.usage || {});

    if (!isAdmin && !isEdit) return null;

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
        return "bg-slate-600 shadow-slate-600/50";
    }

    return (
        <div className={clsx(
            "border rounded-2xl p-6 transition-all duration-300 animate-in slide-in-from-left-4 mb-6 lg:mb-0",
            isEdit ? "bg-slate-900 border-slate-700" : "bg-slate-900 border-slate-800 lg:sticky lg:top-8"
        )}>
            <div className="flex items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-3 min-w-0">
                    <div className={clsx(
                        "p-2.5 rounded-xl shrink-0",
                        isEdit ? "bg-violet-500/10 text-violet-400" : "bg-sky-500/10 text-sky-400"
                    )}>
                        {isEdit ? <Edit3 className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
                    </div>
                    <h2 className="text-lg font-bold text-slate-100 uppercase tracking-tight truncate">{isEdit ? "Edit Session" : "Log Session"}</h2>
                </div>
                {isEdit && onCancel && (
                    <button onClick={onCancel} className="text-slate-500 hover:text-slate-300 p-2">
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 text-sm">
                <div className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1 ml-1">Date</label>
                        <DatePicker name="date" defaultValue={date} onChange={setDate} />
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1 ml-1">Location (Optional)</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                                <MapPin className="w-4 h-4" />
                            </div>
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="Where did you play?"
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-800/50">
                    <h3 className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-2">
                        <Users className="w-4 h-4" /> Attendees
                    </h3>

                    <div className="flex gap-2">
                        <select
                            onChange={handleAddExistingPlayer}
                            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/50 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M6%209L12%2015L18%209%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:1.25rem] bg-[right_0.75rem_center] bg-no-repeat"
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
                            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                        />
                        <button
                            type="button"
                            onClick={handleAddNewPlayer}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-xl font-bold text-xs uppercase transition-all whitespace-nowrap"
                        >
                            + Add
                        </button>
                    </div>

                    {(selectedPlayerIds.length > 0 || newPlayers.length > 0) && (
                        <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/50">
                            <p className="text-[10px] font-bold uppercase text-slate-600 mb-2 ml-1">Selected Players:</p>
                            <div className="flex flex-wrap gap-2">
                                {selectedPlayerIds.map(id => {
                                    const p = players.find(x => x.id === id);
                                    return (
                                        <div key={id} className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded-lg text-xs text-slate-300 border border-slate-700">
                                            {p?.name}
                                            <button type="button" onClick={() => removeSelectedPlayer(id)} className="text-slate-500 hover:text-rose-400">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    );
                                })}
                                {newPlayers.map(name => (
                                    <div key={name} className="flex items-center gap-1.5 bg-sky-900/30 text-sky-200 px-2.5 py-1 rounded-lg text-xs border border-sky-800/50">
                                        {name} <span className="text-[9px] opacity-70">(New)</span>
                                        <button type="button" onClick={() => removeNewPlayer(name)} className="text-sky-500 hover:text-sky-300 ml-1">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-800/50">
                    <h3 className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-2">
                        <Target className="w-4 h-4" /> Shuttlecock Usage
                    </h3>

                    {purchases.length === 0 ? (
                        <p className="text-xs text-slate-500 italic ml-1">No available shuttlecock tubes.</p>
                    ) : (
                        <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                            {purchases.map(p => {
                                const brandName = p.brands?.name || 'Unknown';
                                const remaining = p.remaining_quantity;
                                const colorClass = getStatusColor(remaining);
                                const val = usage[p.id] || 0;

                                return (
                                    <div key={p.id} className="flex items-center justify-between bg-slate-950/50 p-3 rounded-xl border border-slate-800/50">
                                        <div className="flex items-center gap-3">
                                            <div className={clsx("w-2 h-2 rounded-full", colorClass)} />
                                            <div>
                                                <p className="font-medium text-slate-300 text-sm">
                                                    {brandName} ({p.tube_number}) <span className="text-slate-500 font-normal hidden sm:inline">—</span> <span className="text-sky-400 font-bold ml-1">{remaining} remaining</span>
                                                </p>
                                                <p className="text-[10px] text-slate-500 flex gap-2">
                                                    <span className="text-sky-400 font-mono font-bold">RM {Number(p.price_per_tube || 0).toFixed(2)}</span>
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
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
                                                className="w-16 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-center font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500/50"
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="flex gap-3 pt-2">
                    {isEdit && onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase py-3.5 px-4 rounded-xl transition-all"
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        type="submit"
                        className={clsx(
                            "flex-[2] text-white font-bold text-xs uppercase py-3.5 px-4 rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2",
                            isEdit ? "bg-violet-600 hover:bg-violet-500 shadow-violet-500/20" : "bg-sky-600 hover:bg-sky-500 shadow-sky-500/20"
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
