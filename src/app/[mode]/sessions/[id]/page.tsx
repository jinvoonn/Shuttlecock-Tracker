import { supabase } from "@/lib/supabase";
import DesktopSessionDetails from "@/stitch-designs/desktop/SessionDetails";
import MobileSessionDetails from "@/stitch-designs/mobile/SessionDetails";

export const revalidate = 0;

export default async function SessionDetailsPage({ params }: { params: Promise<{ mode: string, id: string }> }) {
  const { mode, id } = await params;

  const [
    { data: session, error: sessionError },
    { data: matchesData, error: matchesError },
    { data: allSessions, error: allSessionsError }
  ] = await Promise.all([
    supabase
      .from("sessions")
      .select(`
        *,
        session_players ( players ( id, name ) ),
        session_usage ( quantity_used, purchases ( price_per_cock ) )
      `)
      .eq("id", id)
      .single(),
    supabase
      .from("matches")
      .select(`
        id, 
        team_a_score, 
        team_b_score, 
        team_a_ids, 
        team_b_ids,
        players_a1:team_a_player1 ( name ),
        players_a2:team_a_player2 ( name ),
        players_b1:team_b_player1 ( name ),
        players_b2:team_b_player2 ( name )
      `)
      .eq("session_id", id),
    supabase.from("sessions").select("id").order("date", { ascending: true }).order("created_at", { ascending: true })
  ]);

  if (sessionError || matchesError || allSessionsError || !session) {
    return (
      <div className="p-8 text-rose-500 font-black italic uppercase flex items-center justify-center min-h-screen bg-[#020617]">
        Session not found or error loading data
      </div>
    );
  }

  const sessionIndex = (allSessions || []).findIndex(s => s.id === id);
  const sessionNum = sessionIndex !== -1 ? sessionIndex + 1 : "??";

  const sessionDate = new Date(session.date);

  // Calculate Costs
  let totalCost = 0;
  let shuttlesUsed = 0;
  if (session.session_usage && session.session_usage.length > 0) {
    session.session_usage.forEach((su: any) => {
      const qty = su.quantity_used || 0;
      const price = su.purchases?.price_per_cock || 0;
      shuttlesUsed += qty;
      totalCost += (qty * price);
    });
  }

  const attendeesList = session.session_players?.map((sp: any) => ({
    id: sp.players?.id,
    name: sp.players?.name || "Unknown",
    role: "Player",
    fee: totalCost / (session.session_players.length || 1),
    paid: false // Without per-session payment tracking, default to false or handle properly
  })) || [];

  const costPerHead = attendeesList.length > 0 ? totalCost / attendeesList.length : 0;

  const sessionMeta = {
    id: session.id,
    name: `Session ${sessionNum}`,
    date: sessionDate.toLocaleDateString(),
    time: sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    location: session.location || "Default Court",
    division: "Social Play",
    shuttlesUsed,
    costPerHead,
    totalCost
  };

  const getPlayerName = (p: any) => {
      if (!p) return null;
      if (Array.isArray(p)) return p[0]?.name;
      return p.name;
  };

  const matches = (matchesData || []).map(m => {
      let teamAStr = "";
      if (m.team_a_ids && m.team_a_ids.length > 0) {
          teamAStr = [getPlayerName(m.players_a1), getPlayerName(m.players_a2)].filter(Boolean).join(" & ") || `Team A (${m.team_a_ids.length})`;
      } else {
          teamAStr = [getPlayerName(m.players_a1), getPlayerName(m.players_a2)].filter(Boolean).join(" & ") || "Team A";
      }

      let teamBStr = "";
      if (m.team_b_ids && m.team_b_ids.length > 0) {
          teamBStr = [getPlayerName(m.players_b1), getPlayerName(m.players_b2)].filter(Boolean).join(" & ") || `Team B (${m.team_b_ids.length})`;
      } else {
          teamBStr = [getPlayerName(m.players_b1), getPlayerName(m.players_b2)].filter(Boolean).join(" & ") || "Team B";
      }

      return {
        id: m.id,
        teamA: teamAStr,
        teamB: teamBStr,
        scoreA: m.team_a_score || 0,
        scoreB: m.team_b_score || 0,
        type: "Doubles",
        court: "Any",
        status: (m.team_a_score > 0 || m.team_b_score > 0) ? "Completed" as const : "Live" as const
      };
  });

  return (
    <>
      <div className="block lg:hidden">
        <MobileSessionDetails session={sessionMeta} attendees={attendeesList} matches={matches} />
      </div>
      <div className="hidden lg:block">
        <DesktopSessionDetails session={sessionMeta} attendees={attendeesList} matches={matches} />
      </div>
    </>
  );
}
