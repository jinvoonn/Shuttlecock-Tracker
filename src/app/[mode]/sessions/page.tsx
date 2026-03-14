import { supabase } from "@/lib/supabase";
import DesktopSessionList from "@/stitch-designs/desktop/SessionList";
import MobileSessions from "@/stitch-designs/mobile/Sessions";

export const revalidate = 0;

export default async function SessionsPage({ params }: { params: Promise<{ mode: string }> }) {
  await params;
  
  const [
    { data: sessions, error: sessionsError },
  ] = await Promise.all([
    supabase
      .from("sessions")
      .select(`
        *,
        session_players ( players ( id, name ) ),
        session_usage ( quantity_used, purchases ( tube_number, brands ( name ), price_per_cock ) )
      `)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false }),
  ]);

  if (sessionsError) {
    return (
      <div className="p-8 text-rose-500 font-black italic uppercase flex items-center justify-center min-h-screen bg-[#020617]">
        Failed to load sessions data
      </div>
    );
  }

  const formattedSessions = (sessions || []).map((session: any) => {
    const attendees = session.session_players?.map((sp: any) => sp.players?.name || "Unknown") || [];
    
    let shuttleName = "None";
    let totalShuttles = 0;
    let totalCost = 0;

    if (session.session_usage && session.session_usage.length > 0) {
      shuttleName = session.session_usage[0].purchases?.brands?.name || "Various";
      session.session_usage.forEach((su: any) => {
        const qty = su.quantity_used || 0;
        const price = su.purchases?.price_per_cock || 0;
        totalShuttles += qty;
        totalCost += (qty * price);
      });
    }

    const costPerPerson = attendees.length > 0 && totalCost > 0 ? (totalCost / attendees.length) : 0;
    
    return {
      id: session.id,
      date: session.date,
      location: session.location || "Default Court",
      status: "Completed" as const,
      shuttleUsed: {
        name: shuttleName,
        quantity: totalShuttles
      },
      costPerPerson,
      attendees,
      totalNet: -totalCost // Defaulting to the negative expense of the session for now
    };
  });

  return (
    <>
      <div className="block lg:hidden">
        <MobileSessions sessions={formattedSessions} />
      </div>
      <div className="hidden lg:block">
        <DesktopSessionList sessions={formattedSessions} />
      </div>
    </>
  );
}
