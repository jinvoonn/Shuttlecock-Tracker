import { supabase } from "@/lib/supabase";
import { PackagePlus, Trash2, Package, Tag, Archive } from "lucide-react";
import { DatePicker } from "@/components/DatePicker";
import { addPurchase } from "./actions";
import { PurchaseItem } from "./PurchaseItem";
import clsx from "clsx";

export const revalidate = 0; // Disable static rendering

function getStatusColor(remaining: number) {
    if (remaining >= 8) return "bg-emerald-500 shadow-emerald-500/50";
    if (remaining >= 4) return "bg-yellow-500 shadow-yellow-500/50";
    if (remaining >= 1) return "bg-rose-500 shadow-rose-500/50";
    return "bg-zinc-600 shadow-zinc-600/50";
}

export default async function PurchasesPage() {
    const [{ data: brands, error: brandsError }, { data: purchases, error: purchasesError }] = await Promise.all([
        supabase.from("brands").select("*").order("name"),
        supabase.from("purchases").select("*, brands(name)").order("purchase_date", { ascending: false }).order("created_at", { ascending: false })
    ]);

    if (brandsError || purchasesError) {
        return (
            <div className="p-8 text-rose-500 flex items-center justify-center min-h-screen">
                Failed to load purchases. Check database connection and schema.
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto animate-in fade-in duration-500">
            <header className="mb-8">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-100 to-emerald-400 mb-2">
                    Tube Inventory
                </h1>
                <p className="text-zinc-400">Track shuttlecock tube purchases and remaining inventory.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Add Purchase Form */}
                <div className="lg:col-span-1 border border-zinc-800/80 bg-zinc-900/30 backdrop-blur-sm p-6 lg:sticky lg:top-8 rounded-2xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                            <PackagePlus className="w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-medium text-zinc-100">Add Shuttlecock Tube</h2>
                    </div>

                    <form action={addPurchase} className="space-y-4 text-sm">
                        <div>
                            <label className="block text-xs font-medium text-zinc-400 mb-1">Purchase Date</label>
                            <DatePicker name="date" />
                        </div>

                        <div>
                            <label htmlFor="brand_id" className="block text-xs font-medium text-zinc-400 mb-1">Select Existing Brand</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                                    <Tag className="w-4 h-4" />
                                </div>
                                <select
                                    id="brand_id"
                                    name="brand_id"
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-4 py-2.5 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all appearance-none"
                                >
                                    <option value="">-- Or Select Existing --</option>
                                    {(brands || []).map((brand) => (
                                        <option key={brand.id} value={brand.id}>{brand.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="new_brand_name" className="block text-xs font-medium text-zinc-400 mb-1">Or Add New Brand Line</label>
                            <input
                                type="text"
                                id="new_brand_name"
                                name="new_brand_name"
                                placeholder="e.g. Yonex AS-30"
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                            />
                            <p className="text-[10px] text-zinc-500 mt-1">If filled, creates a new brand and ignores dropdown.</p>
                        </div>

                        <div>
                            <label htmlFor="notes" className="block text-xs font-medium text-zinc-400 mb-1">Notes (Optional)</label>
                            <input
                                type="text"
                                id="notes"
                                name="notes"
                                placeholder="Where did you buy it?"
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all text-sm"
                            />
                        </div>

                        <div>
                            <label htmlFor="price" className="block text-xs font-medium text-zinc-400 mb-1">Price / Total Cost (RM)</label>
                            <input
                                type="number"
                                id="price"
                                name="price"
                                step="0.01"
                                min="0"
                                required
                                placeholder="0.00"
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all font-mono text-sm"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full mt-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-medium py-3 px-4 rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            <PackagePlus className="w-4 h-4" />
                            Store New Tube
                        </button>
                    </form>
                </div>

                {/* Purchases List */}
                <div className="lg:col-span-2 space-y-4">
                    {(!purchases || purchases.length === 0) ? (
                        <div className="rounded-2xl border border-zinc-800/80 border-dashed bg-zinc-900/10 p-12 text-center">
                            <Archive className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                            <h3 className="text-zinc-300 font-medium mb-1">No tubes recorded yet</h3>
                            <p className="text-zinc-500 text-sm max-w-sm mx-auto">
                                Add your first shuttlecock tube purchase to start managing inventory. Each purchase represents one individual tube.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {(purchases || []).map((purchase: any) => (
                                <PurchaseItem key={purchase.id} purchase={purchase} brands={brands || []} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
