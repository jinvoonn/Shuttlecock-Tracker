import { supabase } from "@/lib/supabase";
import DesktopRecordMatch from "@/stitch-designs/desktop/RecordMatch";
import MobileRecordMatch from "@/stitch-designs/mobile/RecordMatch";

export const revalidate = 0;

export default async function RecordMatchPage({ params }: { params: Promise<{ mode: string, id: string }> }) {
  const { mode, id } = await params;

  const { data: sessionPlayers, error: playersError } = await supabase
    .from("session_players")
    .select("players(id, name)")
    .eq("session_id", id);

  if (playersError) {
    return (
      <div className="p-8 text-rose-500 font-black italic uppercase flex items-center justify-center min-h-screen bg-[#020617]">
        Failed to load session players
      </div>
    );
  }

  const players = (sessionPlayers || []).map((sp: { players: { id: string, name: string } | { id: string, name: string }[] | null }) => {
    if (!sp.players) return null;
    return Array.isArray(sp.players) ? sp.players[0] : sp.players;
  }).filter((p): p is { id: string, name: string } => !!p);

  Object.fromEntries(players.map((p: { id: string, name: string }) => [p.id, p.name]));

  return (
    <>
      <div className="block lg:hidden">
        <MobileRecordMatch sessionId={id} players={players} />
      </div>
      <div className="hidden lg:block">
        <DesktopRecordMatch sessionId={id} players={players} />
      </div>
    </>
  );
}
