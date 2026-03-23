import { supabase } from "@/lib/supabase";
import { normalizeMatches } from "@/lib/analytics/normalize";
import { getPlayerStats, aggregatePlayerStats } from "@/lib/analytics/core";
import { getLeaderboard } from "@/lib/analytics/leaderboard";
import { getTotalShuttleUsed } from "@/lib/analytics/session";
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
    { data: allSessionUsage, error: allUsageError },
    { data: allMatchesData, error: allMatchesError }
  ] = await Promise.all([
    supabase.from("session_players").select("*, players(id, name)").eq("session_id", id),
    supabase.from("session_usage").select("*, purchases(id, tube_number, brands(name), price_per_cock)").eq("session_id", id),
    supabase.from("matches").select("*").eq("session_id", id),
    supabase.from("players").select("id, name"),
    supabase.from("sessions").select("id, date, session_players(player_id)").order("date", { ascending: true }).order("created_at", { ascending: true }),
    supabase.from("purchases").select("id, tube_number, brands(name), price_per_tube, price_per_cock, remaining_quantity").gt("remaining_quantity", 0).order("created_at", { ascending: true }),
    supabase.from("payments").select("amount, player_id"),
    supabase.from("session_usage").select("session_id, quantity_used, purchases(price_per_cock)"),
    supabase.from("matches").select("*").order("created_at", { ascending: true }) // Global match history
  ]);

  if (playersError || usageError || matchesError || allPlayersError || allSessionsListError || purchasesError || allPaymentsError || allUsageError || allMatchesError) {
    console.error("Error fetching related data:", { playersError, usageError, matchesError, allPlayersError, allSessionsListError, purchasesError, allPaymentsError, allUsageError, allMatchesError });
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

  (sessionUsage || []).forEach(su => {
    const purchase = Array.isArray(su.purchases) ? su.purchases[0] : su.purchases;
    const qty = su.quantity_used || 0;
    const price = purchase?.price_per_cock || 0;
    
    currentSessionTotalCost += (qty * price);
  });

  // 6.5 Calculate Global ELO
  const normalizedGlobalMatches = normalizeMatches(allMatchesData || [], playerMap);
  const { stats: coreStats, elo: globalElo } = aggregatePlayerStats(normalizedGlobalMatches, playerMap);

  const attendeesList = (sessionPlayers || []).map((sp: { players: { id: string, name: string } | null }) => {
    const pId = sp.players?.id || "";
    const balance = playerBalances[pId] ? (playerBalances[pId].totalPayments - playerBalances[pId].totalShares) : -1;
    
    return {
      id: pId,
      name: sp.players?.name || "Unknown",
      role: "Player",
      fee: currentSessionTotalCost / (sessionPlayers?.length || 1),
      paid: balance >= -0.01, // Use a small epsilon for float precision
      elo: globalElo[pId] || 1200,
      placementMatchesPlayed: coreStats[pId]?.placementMatchesPlayed ?? 0
    };
  });

  const costPerHead = attendeesList.length > 0 ? currentSessionTotalCost / attendeesList.length : 0;

  // 6. Calculate Session Stats using Analytics Engine
  const normalizedSessionMatches = normalizeMatches(matchesData || [], playerMap);
  const coreSessionStats = getPlayerStats(normalizedSessionMatches, playerMap);
  const shuttlesUsedCount = getTotalShuttleUsed(normalizedSessionMatches);

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

      const teamAPlayers = [
        { id: p1, name: playerMap[p1] || "Unknown", elo: globalElo[p1] || 1200, placementMatchesPlayed: coreStats[p1]?.placementMatchesPlayed ?? 0 },
        { id: p2, name: playerMap[p2] || "Unknown", elo: globalElo[p2] || 1200, placementMatchesPlayed: coreStats[p2]?.placementMatchesPlayed ?? 0 }
      ].filter(p => p.id);

      const teamBPlayers = [
        { id: p3, name: playerMap[p3] || "Unknown", elo: globalElo[p3] || 1200, placementMatchesPlayed: coreStats[p3]?.placementMatchesPlayed ?? 0 },
        { id: p4, name: playerMap[p4] || "Unknown", elo: globalElo[p4] || 1200, placementMatchesPlayed: coreStats[p4]?.placementMatchesPlayed ?? 0 }
      ].filter(p => p.id);

      return {
        id: m.id,
        teamA: teamAPlayers.map(p => p.name).join(" & ") || "Team A",
        teamB: teamBPlayers.map(p => p.name).join(" & ") || "Team B",
        teamAPlayers,
        teamBPlayers,
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

  const winsLeaderboard = getLeaderboard(coreSessionStats, { sortBy: "wins" });
  const winRateLeaderboard = getLeaderboard(coreSessionStats, { sortBy: "winRate", minGames: 1 });

  const sessionStats = {
    mostWins: winsLeaderboard.map(s => ({
      id: s.id,
      name: s.name,
      value: s.wins,
      suffix: s.wins === 1 ? "win" : "wins",
      elo: globalElo[s.id] || 1200,
      placementMatchesPlayed: coreStats[s.id]?.placementMatchesPlayed ?? 0
    })),
    winRate: winRateLeaderboard.map(s => ({
      id: s.id,
      name: s.name,
      value: s.winRate,
      elo: globalElo[s.id] || 1200,
      placementMatchesPlayed: coreStats[s.id]?.placementMatchesPlayed ?? 0
    }))
  };

  console.log("Session Stats:", coreSessionStats);
  console.log("Session Leaderboard:", winsLeaderboard);

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
