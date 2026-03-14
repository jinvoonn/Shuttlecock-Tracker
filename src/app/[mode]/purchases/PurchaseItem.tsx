"use client";

import { useState } from "react";
import { editPurchase, deletePurchase } from "@/lib/actions/purchases";
import { Trash2, Calendar, Archive, Edit3, X, Check, Tag } from "lucide-react";
import { DatePicker } from "@/components/DatePicker";
import clsx from "clsx";
import { useRole } from "@/context/AuthContext";

interface Brand {
    id: string;
    name: string;
}

interface Purchase {
    id: string;
    brand_id: string;
    purchase_date: string;
    tube_number: number;
    initial_quantity: number;
    remaining_quantity: number;
    price_per_tube: number;
    price_per_cock: number;
    notes: string | null;
    brands: { name: string } | null;
}

export function PurchaseItem({ purchase, brands }: { purchase: Purchase, brands: Brand[] }) {
    const { isAdmin } = useRole();
    const [isEditing, setIsEditing] = useState(false);
    const brandName = purchase.brands?.name || 'Unknown Brand';

    function getStatusColor(remaining: number) {
        if (remaining >= 8) return "bg-emerald-500 shadow-emerald-500/50";
        if (remaining >= 4) return "bg-yellow-500 shadow-yellow-500/50";
        if (remaining >= 1) return "bg-rose-500 shadow-rose-500/50";
        return "bg-slate-600 shadow-slate-600/50";
    }

    const colorClass = getStatusColor(purchase.remaining_quantity);

    if (isEditing) {
        return (
            <div className="rounded-2xl border border-violet-500/30 bg-violet-900/10 backdrop-blur-sm p-5 animate-in fade-in slide-in-from-top-2 duration-300">
                <form action={async (formData) => {
                    await editPurchase(purchase.id, formData);
                    setIsEditing(false);
                }} className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold uppercase tracking-tight text-violet-300 flex items-center gap-2">
                            <Edit3 className="w-4 h-4" /> Editing Tube #{purchase.tube_number}
                        </h3>
                        <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1 ml-1">Brand</label>
                            <select
                                name="brand_id"
                                defaultValue={purchase.brand_id}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-xs appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M6%209L12%2015L18%209%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:1.25rem] bg-[right_0.75rem_center] bg-no-repeat"
                                required
                            >
                                {brands.map((b) => (
                                    <option key={b.id} value={b.id}>{b.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1 ml-1">Date</label>
                            <DatePicker name="date" defaultValue={purchase.purchase_date} />
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1 ml-1">Tube Price (RM)</label>
                            <input
                                type="number"
                                name="price"
                                step="0.01"
                                min="0"
                                defaultValue={purchase.price_per_tube}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-xs font-mono"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1 ml-1">Notes</label>
                            <input
                                type="text"
                                name="notes"
                                defaultValue={purchase.notes || ""}
                                placeholder="Notes..."
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-xs"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="px-4 py-2 rounded-xl text-xs font-bold uppercase text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2 rounded-xl text-xs font-bold uppercase bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/20 transition-all flex items-center gap-1.5"
                        >
                            <Check className="w-3.5 h-3.5" /> Save Changes
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className="glass-card rounded-2xl p-5 flex flex-col sm:flex-row gap-4 sm:items-center justify-between group relative overflow-hidden transition-all duration-500 glass-card-hover">
            <div className="flex items-center gap-5">
                <div className="h-14 w-14 rounded-2xl bg-slate-950/40 flex items-center justify-center border border-white/5 text-slate-500 shrink-0 shadow-2xl group-hover:bg-sky-500/10 group-hover:text-sky-400 group-hover:border-sky-500/20 transition-all duration-500">
                    <Archive className="w-7 h-7" />
                </div>
                <div>
                    <h3 className="font-black text-slate-100 text-lg flex items-center gap-2 tracking-tight italic">
                        {brandName} <span className="text-slate-500 not-italic font-mono text-sm tracking-tighter ml-1">#{purchase.tube_number}</span>
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-2 underline-offset-4">
                        <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] flex items-center gap-1.5 whitespace-nowrap">
                            <Calendar className="w-3.5 h-3.5 text-sky-500/80" />
                            {new Date(purchase.purchase_date).toLocaleDateString()}
                        </span>
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-black uppercase text-sky-400 font-mono tracking-tighter bg-sky-400/5 px-2 py-0.5 rounded-lg border border-sky-400/10">RM {Number(purchase.price_per_tube || 0).toFixed(2)}</span>
                            <span className="text-[10px] font-bold text-slate-600 font-mono tracking-tighter">RM {Number(purchase.price_per_cock || 0).toFixed(2)} /pc</span>
                        </div>
                        {purchase.notes && (
                            <span className="text-[10px] text-slate-500 font-medium italic opacity-80 truncate max-w-[150px] sm:max-w-none">
                                {purchase.notes}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-5 sm:w-auto w-full border-t sm:border-t-0 border-white/5 pt-4 sm:pt-0 mt-1 sm:mt-0">
                <div className="flex items-center gap-4">
                    <div className={clsx("w-3 h-3 rounded-full shadow-[0_0_12px_rgba(0,0,0,0.5)] transition-all duration-500 group-hover:scale-125", colorClass)} title="Remaining Indicator" />
                    <div className="text-right">
                        <p className="text-sm font-black text-slate-100 font-mono tracking-tighter leading-none">
                            {purchase.remaining_quantity} <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest ml-1">/ {purchase.initial_quantity} left</span>
                        </p>
                    </div>
                </div>

                {isAdmin && (
                    <div className="flex items-center gap-1.5 ml-4">
                        <button
                            onClick={() => setIsEditing(true)}
                            className="p-2.5 rounded-xl text-slate-500 hover:text-violet-400 hover:bg-violet-500/10 transition-all duration-300 border border-transparent hover:border-violet-500/20"
                            title="Edit tube"
                        >
                            <Edit3 className="w-4 h-4" />
                        </button>

                        <form action={deletePurchase.bind(null, purchase.id)}>
                            <button type="submit" className="p-2.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-300 border border-transparent hover:border-rose-500/20" title="Delete tube">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
