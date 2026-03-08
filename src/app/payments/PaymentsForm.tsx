"use client";

import { HandCoins, DollarSign } from "lucide-react";
import { DatePicker } from "@/components/DatePicker";
import { addPayment } from "./actions";
import { useRole } from "@/context/AuthContext";

interface Player {
    id: string;
    name: string;
}

export function PaymentsForm({ players }: { players: Player[] }) {
    const { isAdmin } = useRole();

    if (!isAdmin) return null;

    return (
        <div className="lg:col-span-1 border border-slate-800 bg-slate-900/40 backdrop-blur-sm p-6 lg:sticky lg:top-8 rounded-2xl animate-in slide-in-from-left-4 duration-500">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl bg-sky-400/10 text-sky-400">
                    <HandCoins className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-medium text-slate-100 uppercase tracking-tight">Record Deposit</h2>
            </div>

            <form action={addPayment} className="space-y-4 text-sm">
                <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1 ml-1">Date</label>
                    <DatePicker name="date" />
                </div>

                <div>
                    <label htmlFor="player_id" className="block text-[10px] font-bold uppercase text-slate-500 mb-1 ml-1">Player</label>
                    <select
                        id="player_id"
                        name="player_id"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/50 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M6%209L12%2015L18%209%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:1.25rem] bg-[right_0.75rem_center] bg-no-repeat"
                        defaultValue=""
                    >
                        <option value="" disabled>-- Select Player --</option>
                        {(players || []).map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="new_player_name" className="block text-[10px] font-bold uppercase text-slate-500 mb-1 ml-1">Or Add New Player</label>
                    <input
                        type="text"
                        id="new_player_name"
                        name="new_player_name"
                        placeholder="e.g. Alice"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                    />
                </div>

                <div>
                    <label htmlFor="amount" className="block text-[10px] font-bold uppercase text-slate-500 mb-1 ml-1">Amount (RM)</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                            <DollarSign className="w-4 h-4" />
                        </div>
                        <input
                            type="number"
                            id="amount"
                            name="amount"
                            step="0.01"
                            min="0.01"
                            required
                            placeholder="0.00"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/50 font-mono"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full mt-4 bg-sky-600 hover:bg-sky-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-sky-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                    <HandCoins className="w-4 h-4" />
                    Save Payment
                </button>
            </form>
        </div>
    );
}
