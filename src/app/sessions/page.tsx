import { supabase } from "@/lib/supabase";
import { Trash2, Calendar, Target, MapPin } from "lucide-react";
import { deleteSession } from "./actions";
import { SessionForm } from "./SessionForm";
import { SessionItem } from "./SessionItem";

export const revalidate = 0;

export default async function SessionsPage() {
    const [
        { data: sessions, error: sessionsError },
        { data: players, error: playersError },
        { data: purchases, error: purchasesError }
    ] = await Promise.all([
        supabase
            .from("sessions")
            .select(`
        *,
        session_players ( players ( name ) ),
        session_usage ( quantity_used, purchases ( tube_number, brands ( name ) ) )
      `)
            .order("date", { ascending: false })
            .order("created_at", { ascending: false }),
        supabase.from("players").select("*").order("name"),
        supabase.from("purchases").select("id, remaining_quantity, tube_number, brands(name), initial_quantity, price_per_tube, price_per_cock").gt("remaining_quantity", 0).order("created_at", { ascending: true })
    ]);

    if (sessionsError || playersError || purchasesError) {
        return (
            <div className="p-8 text-rose-500 flex items-center justify-center min-h-screen">
                Failed to load sessions data. Did you run the schema_v2.sql script?
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto animate-in fade-in duration-500">
            <header className="mb-8">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-100 to-emerald-400 mb-2">
                    Sessions
                </h1>
                <p className="text-zinc-400">Log playtime, track individual shuttlecock tube usage.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Client form component */}
                <SessionForm players={players || []} purchases={purchases || []} />

                {/* Sessions List */}
                <div className="lg:col-span-2 space-y-4">
                    {(!sessions || sessions.length === 0) ? (
                        <div className="rounded-2xl border border-zinc-800/80 border-dashed bg-zinc-900/10 p-12 text-center">
                            <Calendar className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                            <h3 className="text-zinc-300 font-medium mb-1">No sessions logged</h3>
                            <p className="text-zinc-500 text-sm max-w-sm mx-auto">
                                Log your first session tracking attendees and specific tube usage.
                            </p>
                        </div>
                    ) : (
                        sessions.map((session) => (
                            <SessionItem
                                key={session.id}
                                session={session}
                                allPlayers={players || []}
                                allPurchases={purchases || []}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
