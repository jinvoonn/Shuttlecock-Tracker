"use client";

import { PackagePlus } from "lucide-react";
import { DatePicker } from "@/components/DatePicker";
import { addPurchase } from "@/lib/actions/purchases";
import { useRole } from "@/context/AuthContext";

interface Brand {
    id: string;
    name: string;
}

export function PurchasesForm({ brands }: { brands: Brand[] }) {
    const { isAdmin } = useRole();

    if (!isAdmin) return null;

    return (
        <div className="lg:col-span-1 border border-slate-800 bg-slate-900/40 backdrop-blur-sm p-6 lg:sticky lg:top-8 rounded-2xl animate-in slide-in-from-left-4 duration-500">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400">
                    <PackagePlus className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-medium text-slate-100 uppercase tracking-tight">Add New Tube</h2>
            </div>

            <form action={addPurchase} className="space-y-4 text-sm">
                <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1 ml-1">Purchase Date</label>
                    <DatePicker name="date" />
                </div>

                <div>
                    <label htmlFor="brand_id" className="block text-[10px] font-bold uppercase text-slate-500 mb-1 ml-1">Brand</label>
                    <select
                        id="brand_id"
                        name="brand_id"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/50 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M6%209L12%2015L18%209%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:1.25rem] bg-[right_0.75rem_center] bg-no-repeat"
                        defaultValue=""
                    >
                        <option value="" disabled>-- Select Brand --</option>
                        {(brands || []).map((brand) => (
                            <option key={brand.id} value={brand.id}>{brand.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="new_brand_name" className="block text-[10px] font-bold uppercase text-slate-500 mb-1 ml-1 whitespace-nowrap overflow-hidden text-ellipsis">Or Type New Brand</label>
                    <input
                        type="text"
                        id="new_brand_name"
                        name="new_brand_name"
                        placeholder="e.g. Yonex AS-30"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                    />
                </div>

                <div>
                    <label htmlFor="price" className="block text-[10px] font-bold uppercase text-slate-500 mb-1 ml-1">Tube Price (RM)</label>
                    <input
                        type="number"
                        id="price"
                        name="price"
                        step="0.01"
                        min="0"
                        required
                        placeholder="0.00"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/50 font-mono text-sm"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full mt-4 bg-sky-600 hover:bg-sky-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-sky-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                    <PackagePlus className="w-4 h-4" />
                    Add to Inventory
                </button>
            </form>
        </div>
    );
}
