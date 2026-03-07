"use client";

import { useState } from "react";
import { editPurchase, deletePurchase } from "./actions";
import { Trash2, Calendar, Archive, Edit3, X, Check, Tag } from "lucide-react";
import { DatePicker } from "@/components/DatePicker";
import clsx from "clsx";

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
    const [isEditing, setIsEditing] = useState(false);
    const brandName = purchase.brands?.name || 'Unknown Brand';

    function getStatusColor(remaining: number) {
        if (remaining >= 8) return "bg-emerald-500 shadow-emerald-500/50";
        if (remaining >= 4) return "bg-yellow-500 shadow-yellow-500/50";
        if (remaining >= 1) return "bg-rose-500 shadow-rose-500/50";
        return "bg-zinc-600 shadow-zinc-600/50";
    }

    const colorClass = getStatusColor(purchase.remaining_quantity);

    if (isEditing) {
        return (
            <div className="rounded-xl border border-violet-500/50 bg-violet-500/5 backdrop-blur-sm p-4 animate-in fade-in slide-in-from-top-2 duration-200">
                <form action={async (formData) => {
                    await editPurchase(purchase.id, formData);
                    setIsEditing(false);
                }} className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold text-violet-300 flex items-center gap-2">
                            <Edit3 className="w-4 h-4" /> Editing Tube #{purchase.tube_number}
                        </h3>
                        <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-500"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">Brand</label>
                            <select
                                name="brand_id"
                                defaultValue={purchase.brand_id}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-xs"
                                required
                            >
                                {brands.map((b) => (
                                    <option key={b.id} value={b.id}>{b.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">Date</label>
                            <DatePicker name="date" defaultValue={purchase.purchase_date} />
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">Tube Price (RM)</label>
                            <input
                                type="number"
                                name="price"
                                step="0.01"
                                min="0"
                                defaultValue={purchase.price_per_tube}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-xs font-mono"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">Notes</label>
                            <input
                                type="text"
                                name="notes"
                                defaultValue={purchase.notes || ""}
                                placeholder="Notes..."
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-xs"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-1.5 rounded-lg text-xs font-medium bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-900/20 transition-all flex items-center gap-1.5"
                        >
                            <Check className="w-3.5 h-3.5" /> Save Changes
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 backdrop-blur-sm p-4 flex flex-col sm:flex-row gap-4 sm:items-center justify-between group relative overflow-hidden">
            <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-zinc-800 flex items-center justify-center border border-zinc-700 text-zinc-400 shrink-0 shadow-inner group-hover:bg-zinc-800/80 transition-colors">
                    <Archive className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="font-medium text-zinc-200 flex items-center gap-2">
                        {brandName} <span className="text-zinc-500 text-sm">({purchase.tube_number})</span>
                    </h3>
                    <div className="text-[10px] text-zinc-500 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                        <span className="flex items-center gap-1.5">
                            <Calendar className="w-3 h-3" />
                            {new Date(purchase.purchase_date).toLocaleDateString()}
                        </span>
                        <span className="text-emerald-400 font-mono font-bold">RM {Number(purchase.price_per_tube || 0).toFixed(2)}</span>
                        <span className="text-emerald-500/70 font-mono">RM {Number(purchase.price_per_cock || 0).toFixed(2)}/pc</span>
                        {purchase.notes && <span className="text-zinc-600 truncate max-w-[120px]"> • {purchase.notes}</span>}
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 sm:w-auto w-full border-t sm:border-t-0 border-zinc-800/50 pt-3 sm:pt-0 mt-1 sm:mt-0">
                <div className="flex items-center gap-3">
                    <div className={clsx("w-2.5 h-2.5 rounded-full shadow-sm", colorClass)} title="Remaining Indicator" />
                    <div className="text-right">
                        <p className="text-xs font-semibold text-zinc-100 font-mono leading-none">
                            {purchase.remaining_quantity} <span className="text-[10px] text-zinc-500 font-normal">/ {purchase.initial_quantity} left</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1 ml-2">
                    <button
                        onClick={() => setIsEditing(true)}
                        className="p-2 rounded-lg text-zinc-600 hover:text-violet-400 hover:bg-violet-500/10 transition-colors"
                        title="Edit tube"
                    >
                        <Edit3 className="w-4 h-4" />
                    </button>

                    <form action={deletePurchase.bind(null, purchase.id)}>
                        <button type="submit" className="p-2 rounded-lg text-zinc-600 hover:text-rose-400 hover:bg-rose-500/10 transition-colors" title="Delete tube">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
