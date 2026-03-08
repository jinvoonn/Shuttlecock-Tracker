import { supabase } from "@/lib/supabase";
import { SessionForm } from "./SessionForm";
import { SessionsList } from "./SessionsList";

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
                Failed to load sessions data. Check database connection.
            </div>
        );
    }

    // Role check (Admin by default for now)
    const isAdmin = true;

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto animate-in fade-in duration-700">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-slate-50 mb-2">
                    Sessions
                </h1>
                <p className="text-slate-400">Log playtime and track individual shuttlecock usage.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Session Form - Hidden from Viewers */}
                {isAdmin && (
                    <div className="lg:col-span-1">
                        <SessionForm players={players || []} purchases={purchases || []} />
                    </div>
                )}

                {/* Sessions List */}
                <div className={isAdmin ? "lg:col-span-2" : "lg:col-span-3"}>
                    <SessionsList
                        sessions={sessions || []}
                        allPlayers={players || []}
                        allPurchases={purchases || []}
                    />
                </div>
            </div>
        </div>
    );
}
