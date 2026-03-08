"use client";

import { useState, useMemo } from "react";
import { Folder } from "@/components/Folder";
import { FilterBar } from "@/components/FilterBar";
import { HandCoins, Trash2, Calendar, User } from "lucide-react";
import { deletePayment } from "@/lib/actions/payments";
import { useRole } from "@/context/AuthContext";

interface Payment {
    id: string;
    player_id: string;
    amount: number;
    date: string;
    created_at: string;
    players: { name: string } | null;
}

export function PaymentsList({ payments }: { payments: Payment[] }) {
    const { isAdmin } = useRole();
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const filteredPayments = useMemo(() => {
        return (payments || []).filter(p => {
            const pDate = p.date;
            const matchesStart = !startDate || pDate >= startDate;
            const matchesEnd = !endDate || pDate <= endDate;
            return matchesStart && matchesEnd;
        });
    }, [payments, startDate, endDate]);

    const handleClear = () => {
        setStartDate("");
        setEndDate("");
    };

    return (
        <Folder title="Payment History" defaultOpen={true}>
            <FilterBar
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                onClear={handleClear}
            />

            {filteredPayments.length === 0 ? (
                <div className="rounded-2xl border border-slate-800 border-dashed bg-slate-900/10 p-12 text-center mt-4">
                    <HandCoins className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                    <h3 className="text-slate-300 font-medium mb-1 uppercase tracking-tight">No matching payments</h3>
                    <p className="text-slate-500 text-xs max-w-sm mx-auto">
                        Adjust your filters or record a new deposit to see results.
                    </p>
                </div>
            ) : (
                <div className="grid gap-3 transition-all">
                    {filteredPayments.map((payment) => (
                        <div key={payment.id} className="rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm p-5 flex flex-col sm:flex-row gap-4 sm:items-center justify-between group transition-all hover:bg-slate-900/60">
                            <div className="flex items-start gap-4">
                                <div className="h-12 w-12 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700 text-slate-500 shrink-0 shadow-inner group-hover:bg-slate-700 transition-colors">
                                    <User className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-slate-200 flex items-center gap-2">
                                        {payment.players?.name || "Unknown Player"}
                                        <span className="text-[10px] font-bold py-0.5 rounded text-slate-500 flex items-center gap-1">
                                            <Calendar className="w-3 h-3 text-sky-500/80" />
                                            {new Date(payment.date).toLocaleDateString()}
                                        </span>
                                    </h3>
                                    <p className="text-[10px] text-slate-500 mt-1.5 uppercase font-bold tracking-widest flex items-center gap-1.5">
                                        <HandCoins className="w-3.5 h-3.5 text-sky-400" /> Recorded Deposit
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-auto w-full border-t sm:border-t-0 border-slate-800 pt-3 sm:pt-0 mt-1 sm:mt-0">
                                <p className="text-xl font-black text-sky-400 font-mono tracking-tighter">
                                    +RM {Number(payment.amount).toFixed(2)}
                                </p>

                                {isAdmin && (
                                    <form action={deletePayment.bind(null, payment.id)}>
                                        <button type="submit" className="p-2.5 -mr-2 sm:mr-0 rounded-xl text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-all" title="Delete payment">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Folder>
    );
}
