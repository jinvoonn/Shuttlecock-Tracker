import { supabase } from "@/lib/supabase";
import MobileSessionDetails from "@/stitch-designs/mobile/SessionDetails";
import { notFound } from "next/navigation";

export const revalidate = 0;

export default async function SessionDetailsStitchPage({ 
  params 
}: { 
  params: Promise<{ mode: string; id: string }> 
}) {
  const { id } = await params;

  // 1. Fetch session details
  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .select("*, session_usage(quantity_used)")
    .eq("id", id)
    .single();

  if (sessionError || !session) {
    return notFound();
  }

  // 2. Fetch matches
  const { data: matchesData, error: matchesError } = await supabase
    .from("matches")
    .select("*")
    .eq("session_id", id)
    .order("created_at", { ascending: true });

  // 3. Fetch attendees (session_players)
  const { data: attendeesData, error: attendeesError } = await supabase
    .from("session_players")
    .select("player_id, players(id, name)")
    .eq("session_id", id);

  // 4. Fetch payments to check paid status
  const { data: paymentsData } = await supabase
    .from("payments")
    .select("player_id, amount, status")
    .eq("session_id", id);

  // Calculate shuttles used
  const shuttlesUsed = session.session_usage?.reduce((acc: number, u: any) => acc + u.quantity_used, 0) || 0;

  // Map session metadata
  const sessionMeta = {
    id: session.id,
    name: session.notes || `Session ${session.date}`,
    date: new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    time: "19:00 - 21:00", // Placeholder as time is not explicitly in schema
    location: session.location || "Central Court",
    division: "General",
    shuttlesUsed: shuttlesUsed * 12, // Assume quantity_used is in tubes
    costPerHead: 0, // Need to calculate/fetch
    totalCost: 0 // Need to calculate
  };

  // Map matches
  const matches = matchesData?.map((m, i) => ({
    id: m.id,
    teamA: "Team A", // Placeholder or fetch names
    teamB: "Team B",
    scoreA: m.score_a,
    scoreB: m.score_b,
    type: m.match_type || "Doubles",
    court: "01",
    status: 'Completed' as const
  })) || [];

  // Map attendees
  const attendees = attendeesData?.map(ap => {
    const payment = paymentsData?.find(p => p.player_id === ap.player_id);
    return {
      id: ap.player_id,
      name: (ap.players as any)?.name || "Unknown",
      role: "Member",
      fee: payment?.amount || 0,
      paid: payment?.status === 'paid'
    };
  }) || [];

  return (
    <MobileSessionDetails 
      session={sessionMeta}
      matches={matches}
      attendees={attendees}
    />
  );
}
