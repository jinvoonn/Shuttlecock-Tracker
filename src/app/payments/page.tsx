import { supabase } from "@/lib/supabase";
import { HandCoins, Trash2, Calendar, User, DollarSign, Users } from "lucide-react";
import { DatePicker } from "@/components/DatePicker";
import { addPayment, deletePayment } from "./actions";

export const revalidate = 0;

export default async function PaymentsPage() {
    const [{ data: players, error: playersError }, { data: payments, error: paymentsError }] = await Promise.all([
        supabase.from("players").select("*").order("name"),
        supabase.from("payments").select("*, players(name)").order("date", { ascending: false }).order("created_at", { ascending: false })
    ]);

    if (playersError || paymentsError) {
        return (
            <div className="p-8 text-rose-500 flex items-center justify-center min-h-screen">
                Failed to load payments. Run schema_v2 snippet in Supabase SQL editor.
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto animate-in fade-in duration-500">
            <header className="mb-8">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-100 to-emerald-400 mb-2">
                    Payments
                </h1>
                <p className="text-zinc-400">Record deposits made by players into the group pool.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Add Payment Form */}
                <div className="lg:col-span-1 border border-zinc-800/80 bg-zinc-900/30 backdrop-blur-sm p-6 lg:sticky lg:top-8 rounded-2xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400">
                            <HandCoins className="w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-medium text-zinc-100">Add Deposit</h2>
                    </div>

                    <form action={addPayment} className="space-y-4 text-sm">
                        <div>
                            <label className="block text-xs font-medium text-zinc-400 mb-1">Date</label>
                            <DatePicker name="date" />
                        </div>

                        <div>
                            <label htmlFor="player_id" className="block text-xs font-medium text-zinc-400 mb-1">Select Existing Player</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                                    <User className="w-4 h-4" />
                                </div>
                                <select
                                    id="player_id"
                                    name="player_id"
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-4 py-2.5 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all appearance-none"
                                >
                                    <option value="">-- Or Select Existing --</option>
                                    {(players || []).map((p) => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="new_player_name" className="block text-xs font-medium text-zinc-400 mb-1">Or Add New Player</label>
                            <input
                                type="text"
                                id="new_player_name"
                                name="new_player_name"
                                placeholder="e.g. Alice"
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
                            />
                            <p className="text-[10px] text-zinc-500 mt-1">If filled, ignores dropdown and adds new player.</p>
                        </div>

                        <div>
                            <label htmlFor="amount" className="block text-xs font-medium text-zinc-400 mb-1">Amount (RM)</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
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
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-4 py-2.5 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all font-mono"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full mt-2 bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-400 hover:to-violet-500 text-white font-medium py-3 px-4 rounded-xl shadow-lg shadow-violet-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            <HandCoins className="w-4 h-4" />
                            Save Payment
                        </button>
                    </form>
                </div>

                {/* Payments List */}
                <div className="lg:col-span-2 space-y-4">
                    {(!payments || payments.length === 0) ? (
                        <div className="rounded-2xl border border-zinc-800/80 border-dashed bg-zinc-900/10 p-12 text-center">
                            <HandCoins className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                            <h3 className="text-zinc-300 font-medium mb-1">No payments yet</h3>
                            <p className="text-zinc-500 text-sm max-w-sm mx-auto">
                                Record payments when players contribute to the pool to update their balances.
                            </p>
                        </div>
                    ) : (
                        payments.map((payment) => (
                            <div key={payment.id} className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 backdrop-blur-sm p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:items-center justify-between group">
                                <div className="flex items-start gap-4">
                                    <div className="h-12 w-12 rounded-xl bg-zinc-800 flex items-center justify-center border border-zinc-700 text-zinc-400 shrink-0 shadow-inner group-hover:bg-zinc-800/80 transition-colors">
                                        <User className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-zinc-200 flex items-center gap-2">
                                            {payment.players?.name || "Unknown Player"}
                                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(payment.date).toLocaleDateString()}
                                            </span>
                                        </h3>
                                        <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest font-semibold flex items-center gap-1.5">
                                            <HandCoins className="w-3.5 h-3.5 text-violet-400/80" /> Added to Pool
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-auto w-full border-t sm:border-t-0 border-zinc-800/50 pt-3 sm:pt-0 mt-1 sm:mt-0">
                                    <p className="text-xl font-bold text-violet-400 font-mono">
                                        +RM {Number(payment.amount).toFixed(2)}
                                    </p>

                                    <form action={deletePayment.bind(null, payment.id)}>
                                        <button type="submit" className="p-2 -mr-2 sm:mr-0 rounded-lg text-zinc-600 hover:text-rose-400 hover:bg-rose-500/10 transition-colors" title="Delete payment">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </form>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
