import { supabase } from "@/lib/supabase";
import DesktopSessionDetails from "@/stitch-designs/desktop/SessionDetails";
import MobileSessionDetails from "@/stitch-designs/mobile/SessionDetails";

export const revalidate = 0;

export default async function SessionDetailsPage({ params }: { params: Promise<{ mode: string, id: string }> }) {
  const { mode, id } = await params;

  // 1. Fetch the main session
  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", id)
    .single();

  if (sessionError || !session) {
    console.error("Session fetch error:", sessionError);
    return (
      <div className="p-8 text-rose-500 font-black italic uppercase flex items-center justify-center min-h-screen bg-[#020617]">
        Session not found or error loading data
      </div>
    );
  }

  // 2. Fetch all related data in parallel for speed
  const [
    { data: sessionPlayers, error: playersError },
    { data: sessionUsage, error: usageError },
    { data: matchesData, error: matchesError },
    { data: allPlayers, error: allPlayersError },
    { data: allSessions, error: allSessionsListError },
    { data: purchasesData, error: purchasesError }
  ] = await Promise.all([
    supabase.from("session_players").select("*, players(id, name)").eq("session_id", id),
    supabase.from("session_usage").select("*, purchases(id, tube_number, brands(name), price_per_cock)").eq("session_id", id),
    supabase.from("matches").select("*").eq("session_id", id),
    supabase.from("players").select("id, name"),
    supabase.from("sessions").select("id").order("date", { ascending: true }).order("created_at", { ascending: true }),
    supabase.from("purchases").select("id, tube_number, brands(name), price_per_tube, price_per_cock, remaining_quantity").gt("remaining_quantity", 0).order("created_at", { ascending: true })
  ]);

  if (playersError || usageError || matchesError || allPlayersError || allSessionsListError || purchasesError) {
    console.error("Error fetching related data:", { playersError, usageError, matchesError, allPlayersError, allSessionsListError, purchasesError });
    return (
      <div className="p-8 text-rose-500 font-black italic uppercase flex items-center justify-center min-h-screen bg-[#020617]">
        Error loading session details
      </div>
    );
  }

  // 3. Build lookup maps
  const playerMap = Object.fromEntries((allPlayers || []).map(p => [p.id, p.name]));
  const sessionIndex = (allSessions || []).findIndex(s => s.id === id);
  const sessionNum = sessionIndex !== -1 ? sessionIndex + 1 : "??";
  const sessionDate = new Date(session.date);

  // 4. Transform attendee data
  let totalCost = 0;
  let shuttlesUsedCount = 0;

  const usage = (sessionUsage || []).map(su => {
    const purchase = Array.isArray(su.purchases) ? su.purchases[0] : su.purchases;
    const qty = su.quantity_used || 0;
    const price = purchase?.price_per_cock || 0;
    
    shuttlesUsedCount += qty;
    totalCost += (qty * price);
    
    return {
        ...su,
        cost: qty * price
    };
  });

  const attendeesList = (sessionPlayers || []).map((sp: { players: { id: string, name: string } | null }) => ({
    id: sp.players?.id || "",
    name: sp.players?.name || "Unknown",
    role: "Player",
    fee: totalCost / (sessionPlayers?.length || 1),
    paid: false 
  }));

  const costPerHead = attendeesList.length > 0 ? totalCost / attendeesList.length : 0;

  const sessionMeta = {
    id: session.id,
    name: `Session ${sessionNum}`,
    date: sessionDate.toLocaleDateString(),
    time: sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    location: session.location || "Default Court",
    division: "Social Play",
    shuttlesUsed: shuttlesUsedCount,
    costPerHead,
    totalCost
  };

  // 5. Transform match data using lookup map
  const matches = (matchesData || []).map(m => {
      const p1 = m.team_a_player1;
      const p2 = m.team_a_player2;
      const p3 = m.team_b_player1;
      const p4 = m.team_b_player2;

      const teamAStr = [playerMap[p1], playerMap[p2]].filter(Boolean).join(" & ");
      const teamBStr = [playerMap[p3], playerMap[p4]].filter(Boolean).join(" & ");

      return {
        id: m.id,
        teamA: teamAStr || "Team A",
        teamB: teamBStr || "Team B",
        scoreA: m.team_a_score || 0,
        scoreB: m.team_b_score || 0,
        team_a_player1: p1,
        team_a_player2: p2,
        team_b_player1: p3,
        team_b_player2: p4,
        type: "Doubles",
        court: "Any",
        status: (m.team_a_score > 0 || m.team_b_score > 0) ? "Completed" as const : "Live" as const
      };
  });

  const initialData = {
    id: session.id,
    date: session.date,
    location: session.location || "",
    notes: session.notes || "",
    players: (sessionPlayers as any[] || []).map(sp => sp.players?.id).filter(Boolean),
    usage: (sessionUsage as any[] || []).reduce((acc, su) => {
      if (su.purchases?.id) acc[su.purchases.id] = su.quantity_used;
      return acc;
    }, {} as Record<string, number>)
  };

  const formattedPlayers = (allPlayers || []).map(p => ({
    id: p.id,
    name: p.name,
  }));

  const sortedPurchases = (purchasesData || []).map(p => ({
    id: p.id,
    brand: (Array.isArray(p.brands) 
      ? (p.brands as unknown as {name: string}[])[0]?.name 
      : (p.brands as unknown as {name: string} | null)?.name) || "Unknown Brand",
    model: `Batch #${p.tube_number}`,
    price_per_tube: p.price_per_tube || 0,
    price_per_cock: p.price_per_cock || 0,
    remaining_quantity: p.remaining_quantity,
    brands: p.brands,
    tube_number: p.tube_number
  }));

  return (
    <>
      <div className="block lg:hidden">
        <MobileSessionDetails
          session={sessionMeta}
          attendees={attendeesList}
          matches={matches}
          sessionPlayers={(sessionPlayers || []).map((sp: { players: { id: string, name: string } | null }) => ({
            id: sp.players?.id || "",
            name: sp.players?.name || "Unknown"
          })).filter((p: { id: string; name: string }) => !!p.id)}
          allPlayers={formattedPlayers}
          allPurchases={sortedPurchases as any[]}
          initialData={initialData}
        />
      </div>
      <div className="hidden lg:block">
        <DesktopSessionDetails 
          session={sessionMeta} 
          attendees={attendeesList} 
          matches={matches} 
          allPlayers={formattedPlayers}
          allPurchases={sortedPurchases as any[]}
          initialData={initialData}
        />
      </div>
    </>
  );
}
