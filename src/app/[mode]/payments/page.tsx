import { supabase } from "@/lib/supabase";
import { PaymentsList } from "./PaymentsList";
import { PaymentsForm } from "./PaymentsForm";

export const revalidate = 0;

export default async function PaymentsPage({ params }: { params: Promise<{ mode: string }> }) {
    await params;
    const [{ data: players, error: playersError }, { data: payments, error: paymentsError }] = await Promise.all([
        supabase.from("players").select("*").order("name"),
        supabase.from("payments").select("*, players(name)").order("date", { ascending: false }).order("created_at", { ascending: false })
    ]);

    if (playersError || paymentsError) {
        return (
            <div className="p-8 text-rose-500 flex items-center justify-center min-h-screen">
                Failed to load payments. Check database connection.
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto animate-in fade-in duration-700">
            <header className="mb-10">
                <h1 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-50 via-sky-100 to-sky-400 mb-2 tracking-tighter italic">
                    Payments
                </h1>
                <p className="text-slate-400 font-bold tracking-tight text-sm">Record deposits made by players into the group pool.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Add Payment Form - Internal Role Check */}
                <PaymentsForm players={players || []} />

                {/* Payments List */}
                <div className="lg:col-span-2">
                    <PaymentsList payments={payments || []} />
                </div>
            </div>
        </div>
    );
}
