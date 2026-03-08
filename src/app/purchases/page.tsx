import { supabase } from "@/lib/supabase";
import { PackagePlus } from "lucide-react";
import { DatePicker } from "@/components/DatePicker";
import { addPurchase } from "./actions";
import { PurchasesList } from "./PurchasesList";
import { PurchasesForm } from "./PurchasesForm";

export const revalidate = 0; // Disable static rendering

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
        <div className="p-4 md:p-8 max-w-6xl mx-auto animate-in fade-in duration-700">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-slate-50 mb-2">
                    Shuttlecock Purchases
                </h1>
                <p className="text-slate-400">Track your inventory and detailed tube costs.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Add Purchase Form - Internal Role Check within Component */}
                <PurchasesForm brands={brands || []} />

                {/* Purchases List */}
                <div className="lg:col-span-2">
                    <PurchasesList purchases={purchases || []} brands={brands || []} />
                </div>
            </div>
        </div>
    );
}
