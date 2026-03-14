import { supabase } from "@/lib/supabase";
import MobileSessions from "@/stitch-designs/mobile/Sessions";

export const revalidate = 0;

export default async function SessionsStitchPage({ params }: { params: Promise<{ mode: string }> }) {
  await params;

  // 1. Fetch sessions with players and usage
  const [
    { data: sessionsData, error: sessionsError },
    { data: usageData, error: usageError }
  ] = await Promise.all([
    supabase.from("sessions").select(`
      id, 
      date, 
      location, 
      session_players ( players ( id, name ) )
    `).order('date', { ascending: false }),
    supabase.from("session_usage").select(`
      session_id, 
      quantity_used, 
      purchases ( 
        price_per_cock, 
        brands ( name ) 
      )
    `)
  ]);

  if (sessionsError || usageError) {
    return <div>Error loading sessions</div>;
  }

  // 2. Process data for the component
  const sessionCosts: Record<string, { total: number; shuttles: string; quantity: number }> = {};
  
  (usageData || []).forEach(su => {
    const sId = su.session_id;
    // @ts-expect-error type mismatch
    const price = Number(su.purchases?.price_per_cock || 0);
    // @ts-expect-error type mismatch
    const brandName = su.purchases?.brands?.name || "Generic";
    
    if (!sessionCosts[sId]) {
      sessionCosts[sId] = { total: 0, shuttles: brandName, quantity: 0 };
    }
    
    sessionCosts[sId].total += price * su.quantity_used;
    sessionCosts[sId].quantity += su.quantity_used;
  });

  const formattedSessions: any[] = (sessionsData || []).map(s => {
    const costData = sessionCosts[s.id] || { total: 0, shuttles: "No shuttles", quantity: 0 };
    const attendeeCount = s.session_players?.length || 0;
    const costPerPerson = attendeeCount > 0 ? costData.total / attendeeCount : 0;
    const attendees = (s.session_players || []).map((sp: any) => sp.players?.name || "Unknown");

    return {
      id: s.id,
      date: s.date,
      location: s.location || "Main Court",
      status: attendeeCount > 0 ? 'Completed' : 'Outstanding',
      shuttleUsed: {
        name: costData.shuttles,
        quantity: costData.quantity
      },
      costPerPerson: costPerPerson,
      attendees: attendees,
      totalNet: costData.total // Using total cost as "Net" for now
    };
  });

  return <MobileSessions sessions={formattedSessions} />;
}
