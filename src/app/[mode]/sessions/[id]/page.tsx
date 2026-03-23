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
    { data: purchasesData, error: purchasesError },
    // Global data for balance calculation
    { data: allPayments, error: allPaymentsError },
    { data: allSessionUsage, error: allUsageError }
  ] = await Promise.all([
    supabase.from("session_players").select("*, players(id, name)").eq("session_id", id),
    supabase.from("session_usage").select("*, purchases(id, tube_number, brands(name), price_per_cock)").eq("session_id", id),
    supabase.from("matches").select("*").eq("session_id", id),
    supabase.from("players").select("id, name"),
    supabase.from("sessions").select("id, date, session_players(player_id)").order("date", { ascending: true }).order("created_at", { ascending: true }),
    supabase.from("purchases").select("id, tube_number, brands(name), price_per_tube, price_per_cock, remaining_quantity").gt("remaining_quantity", 0).order("created_at", { ascending: true }),
    supabase.from("payments").select("amount, player_id"),
    supabase.from("session_usage").select("session_id, quantity_used, purchases(price_per_cock)")
  ]);

  if (playersError || usageError || matchesError || allPlayersError || allSessionsListError || purchasesError || allPaymentsError || allUsageError) {
    console.error("Error fetching related data:", { playersError, usageError, matchesError, allPlayersError, allSessionsListError, purchasesError, allPaymentsError, allUsageError });
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

  // 4. Calculate Global Balances (same logic as Dashboard)
  const playerBalances: Record<string, { totalShares: number; totalPayments: number; balance: number }> = {};
  (allPlayers || []).forEach(p => {
    playerBalances[p.id] = { totalShares: 0, totalPayments: 0, balance: 0 };
  });

  (allPayments || []).forEach(p => {
    if (playerBalances[p.player_id]) {
      playerBalances[p.player_id].totalPayments += Number(p.amount || 0);
    }
  });

  const sessionCosts: Record<string, number> = {};
  (allSessionUsage || []).forEach(su => {
    const sId = su.session_id;
    const purchase = Array.isArray(su.purchases) ? su.purchases[0] : su.purchases;
    const price_per_cock = Number(purchase?.price_per_cock || 0);
    sessionCosts[sId] = (sessionCosts[sId] || 0) + (price_per_cock * Number(su.quantity_used || 0));
  });

  (allSessions || []).forEach(s => {
    const cost = sessionCosts[s.id] || 0;
    const attendees = s.session_players || [];
    if (attendees.length > 0) {
      const share = cost / attendees.length;
      attendees.forEach((ap: { player_id: string }) => {
        if (playerBalances[ap.player_id]) {
          playerBalances[ap.player_id].totalShares += share;
        }
      });
    }
  });

  // 5. Transform attendee data
  let currentSessionTotalCost = 0;
  let shuttlesUsedCount = 0;

  (sessionUsage || []).forEach(su => {
    const purchase = Array.isArray(su.purchases) ? su.purchases[0] : su.purchases;
    const qty = su.quantity_used || 0;
    const price = purchase?.price_per_cock || 0;
    
    shuttlesUsedCount += qty;
    currentSessionTotalCost += (qty * price);
  });

  const attendeesList = (sessionPlayers || []).map((sp: { players: { id: string, name: string } | null }) => {
    const pId = sp.players?.id || "";
    const balance = playerBalances[pId] ? (playerBalances[pId].totalPayments - playerBalances[pId].totalShares) : -1;
    
    return {
      id: pId,
      name: sp.players?.name || "Unknown",
      role: "Player",
      fee: currentSessionTotalCost / (sessionPlayers?.length || 1),
      paid: balance >= -0.01 // Use a small epsilon for float precision
    };
  });

  const costPerHead = attendeesList.length > 0 ? currentSessionTotalCost / attendeesList.length : 0;

  const sessionMeta = {
    id: session.id,
    name: `Session ${sessionNum}`,
    date: sessionDate.toLocaleDateString(),
    time: sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    location: session.location || "Default Court",
    division: "Social Play",
    shuttlesUsed: shuttlesUsedCount,
    costPerHead,
    totalCost: currentSessionTotalCost
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

  // 6. Calculate Session Stats
  const sessionPLayersStats: Record<string, { wins: number; games: number }> = {};
  (matchesData || []).forEach(match => {
    const teamA = [match.team_a_player1, match.team_a_player2].filter(Boolean);
    const teamB = [match.team_b_player1, match.team_b_player2].filter(Boolean);

    const scoreA = Number(match.team_a_score);
    const scoreB = Number(match.team_b_score);
    const isTeamAWinner = scoreA > scoreB;
    const isTeamBWinner = scoreB > scoreA;

    const winningTeam = isTeamAWinner ? teamA : (isTeamBWinner ? teamB : []);

    // Track games
    [...teamA, ...teamB].forEach(player => {
      if (!sessionPLayersStats[player]) {
        sessionPLayersStats[player] = { wins: 0, games: 0 };
      }
      sessionPLayersStats[player].games += 1;
    });

    // Track wins
    winningTeam.forEach(player => {
      sessionPLayersStats[player].wins += 1;
    });
  });

  const sessionMostWins = Object.entries(sessionPLayersStats)
    .map(([id, stats]) => ({
      id,
      name: playerMap[id],
      value: stats.wins,
      suffix: stats.wins === 1 ? "win" : "wins"
    }))
    .sort((a, b) => b.value - a.value);

  const sessionWinRate = Object.entries(sessionPLayersStats)
    .map(([id, stats]) => ({
      id,
      name: playerMap[id],
      value: stats.games > 0 ? stats.wins / stats.games : 0
    }))
    .sort((a, b) => b.value - a.value);

  const sessionStats = {
    mostWins: sessionMostWins,
    winRate: sessionWinRate
  };

  return (
    <>
      <div className="block lg:hidden">
        <MobileSessionDetails
          session={sessionMeta}
          attendees={attendeesList}
          matches={matches}
          sessionStats={sessionStats}
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
          sessionStats={sessionStats}
          allPlayers={formattedPlayers}
          allPurchases={sortedPurchases as any[]}
          initialData={initialData}
        />
      </div>
    </>
  );
}
