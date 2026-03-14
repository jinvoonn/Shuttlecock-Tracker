import { supabase } from "@/lib/supabase";
import { PackagePlus } from "lucide-react";
import { DatePicker } from "@/components/DatePicker";
import { addPurchase } from "@/lib/actions/purchases";
import { PurchasesList } from "./PurchasesList";
import { PurchasesForm } from "./PurchasesForm";

export const revalidate = 0; // Disable static rendering

export default async function PurchasesPage({ params }: { params: Promise<{ mode: string }> }) {
    await params;
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

    // Sort by brand name, then tube number ascending
    const sortedPurchases = (purchases || []).sort((a, b) => {
        const nameA = (a.brands as any)?.name || "";
        const nameB = (b.brands as any)?.name || "";
        const nameCompare = nameA.localeCompare(nameB);
        if (nameCompare !== 0) return nameCompare;
        return a.tube_number - b.tube_number;
    });

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto animate-in fade-in duration-700">
            <header className="mb-10">
                <h1 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-50 via-sky-100 to-sky-400 mb-2 tracking-tighter italic">
                    Shuttlecocks
                </h1>
                <p className="text-slate-400 font-bold tracking-tight text-sm">Track your inventory and detailed tube costs.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Add Purchase Form - Internal Role Check within Component */}
                <PurchasesForm brands={brands || []} />

                {/* Purchases List */}
                <div className="lg:col-span-2">
                    <PurchasesList purchases={sortedPurchases} brands={brands || []} />
                </div>
            </div>
        </div>
    );
}
