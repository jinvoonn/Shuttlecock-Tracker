import { supabase } from "@/lib/supabase";
import DesktopSessionList from "@/stitch-designs/desktop/SessionList";
import MobileSessions from "@/stitch-designs/mobile/Sessions";
import { normalizeMatches } from "@/lib/analytics/normalize";
import { aggregatePlayerStats } from "@/lib/analytics/core";

export const revalidate = 0;

interface SessionPlayer {
  players: { id: string, name: string } | null;
}

interface Session {
  id: string;
  date: string;
  start_time: string | null;
  location: string | null;
  notes: string | null;
  session_players: SessionPlayer[];
  session_usage: {
    quantity_used: number;
    purchases: {
      tube_number: number;
      brands: { name: string } | null;
      price_per_cock: number;
    } | null;
  }[];
}

interface Player { id: string; name: string; }
interface Purchase { id: string; remaining_quantity: number; tube_number: number; brands: { name: string } | null; price_per_tube: number; price_per_cock: number; }

export default async function SessionsPage({ params }: { params: Promise<{ mode: string }> }) {
  await params;
  
  const [
    { data: sessions, error: sessionsError },
    { data: playersData, error: playersError },
    { data: purchasesData, error: purchasesError }
  ] = await Promise.all([
    supabase
      .from("sessions")
      .select(`
        *,
        session_players ( players ( id, name ) ),
        session_usage ( quantity_used, purchases ( id, tube_number, brands ( name ), price_per_cock ) )
      `)
      .order("date", { ascending: true })
      .order("created_at", { ascending: true }),
    supabase.from("players").select("id, name").order("name"),
    supabase.from("purchases").select("id, tube_number, brands(name), price_per_tube, price_per_cock, remaining_quantity").gt("remaining_quantity", 0).order("created_at", { ascending: true })
  ]);

  // 1. Fetch data
  const { data: matchesData } = await supabase.from("matches").select("*").order("created_at", { ascending: true });
  const { data: allPlayersData } = await supabase.from("players").select("id, name");
  const playerMap = Object.fromEntries((allPlayersData || []).map(p => [p.id, p.name]));
  const normalizedMatches = normalizeMatches(matchesData || [], playerMap);
  const { stats: coreStats, elo: globalElo } = aggregatePlayerStats(normalizedMatches, playerMap);

  if (sessionsError) {
    return (
      <div className="p-8 text-rose-500 font-black italic uppercase flex items-center justify-center min-h-screen bg-[#020617]">
        Failed to load sessions data
      </div>
    );
  }

  const formattedSessions = (sessions as unknown as Session[] || []).map((session, index: number) => {
    const attendees = session.session_players?.map((sp) => sp.players?.name || "Unknown") || [];
    const playerIds = (session.session_players?.map((sp) => sp.players?.id).filter(Boolean) || []) as string[];
    
    let shuttleName = "None";
    let totalShuttles = 0;
    let totalCost = 0;
    const usageMap: Record<string, number> = {};

    if (session.session_usage && session.session_usage.length > 0) {
      shuttleName = (Array.isArray(session.session_usage[0].purchases?.brands) ? session.session_usage[0].purchases?.brands[0]?.name : session.session_usage[0].purchases?.brands?.name) || "Various";
      session.session_usage.forEach((su) => {
        const purchases = Array.isArray(su.purchases) ? su.purchases[0] : su.purchases;
        const qty = su.quantity_used || 0;
        const price = purchases?.price_per_cock || 0;
        totalShuttles += qty;
        totalCost += (qty * price);
        if (purchases?.id) usageMap[purchases.id] = qty;
      });
    }

    const costPerPerson = attendees.length > 0 && totalCost > 0 ? (totalCost / attendees.length) : 0;
    
    return {
      id: session.id,
      displayNumber: index + 1,
      date: session.date,
      startTime: session.start_time,
      location: session.location || "Default Court",
      notes: session.notes || "",
      status: "Completed" as const,
      shuttleUsed: {
        name: shuttleName,
        quantity: totalShuttles
      },
      costPerPerson,
      attendees: (session.session_players?.map((sp) => ({
        id: sp.players?.id || "",
        name: sp.players?.name || "Unknown",
        elo: globalElo[sp.players?.id || ""] || 1200,
        placementMatchesPlayed: coreStats[sp.players?.id || ""]?.placementMatchesPlayed ?? 0
      })) || []),
      playerIds,
      usageMap,
      totalNet: -totalCost // Defaulting to the negative expense of the session for now
    };
  }).reverse();

  const allPlayers = (playersData || []).map(p => ({
    id: p.id,
    name: p.name,
    elo: globalElo[p.id] || 1200,
    placementMatchesPlayed: coreStats[p.id]?.placementMatchesPlayed ?? 0
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
        <MobileSessions sessions={formattedSessions} allPlayers={allPlayers} allPurchases={sortedPurchases as unknown as Purchase[]} />
      </div>
      <div className="hidden lg:block">
        <DesktopSessionList sessions={formattedSessions} allPlayers={allPlayers} allPurchases={sortedPurchases as unknown as Purchase[]} />
      </div>
    </>
  );
}
