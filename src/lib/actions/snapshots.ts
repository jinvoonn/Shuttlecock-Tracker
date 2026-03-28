"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";
import { normalizeMatches } from "@/lib/analytics/normalize";
import { aggregatePlayerStats } from "@/lib/analytics/core";
import { getLeaderboard } from "@/lib/analytics/leaderboard";

export async function createWeeklySnapshot() {
  // 1. Define period
  const now = new Date();
  const periodEnd = now.toISOString().slice(0, 10);

  const start = new Date();
  start.setDate(now.getDate() - 7);
  const periodStart = start.toISOString().slice(0, 10);

  // 2. Check if snapshot already exists (GLOBAL LEVEL)
  const { data: existing } = await supabase
    .from("leaderboard_snapshots")
    .select("id")
    .eq("period_start", periodStart)
    .eq("period_end", periodEnd)
    .limit(1);

  if (existing && existing.length > 0) {
    return { success: true, message: "Snapshot already exists" };
  }

  // 3. Fetch players and matches (READ ONLY)
  const [{ data: players, error: errPlayers }, { data: matches, error: errMatches }] = await Promise.all([
    supabase.from("players").select("id, name"),
    supabase.from("matches").select("*")
  ]);

  if (errPlayers || errMatches) throw new Error("Failed to fetch data for snapshot");

  const playerMap = Object.fromEntries((players || []).map((p: any) => [p.id, p.name]));
  const normalizedMatches = normalizeMatches(matches || [], playerMap);

  // 4. Compute leaderboard (SAFE - PURE FUNCTION)
  const { stats, elo } = aggregatePlayerStats(normalizedMatches, playerMap);
  const leaderboard = getLeaderboard(stats, elo, { sortBy: "elo" });

  // 5. Prepare rows
  const rows = leaderboard.map((player, index) => ({
    player_id: player.id,
    rank: index + 1,
    wins: player.wins || 0,
    win_rate: player.winRate || 0,
    cock_rating: player.elo || 1200,
    period_start: periodStart,
    period_end: periodEnd,
    type: "global",
  }));

  if (rows.length === 0) {
      return { success: true, message: "No players found to snapshot" };
  }

  // 6. Insert (SAFE: no overwrite due to UNIQUE constraint)
  const { error: insertError } = await supabase
    .from("leaderboard_snapshots")
    .insert(rows);

  // Postgres unique violation code is 23505
  // If we get it, it just means someone else created the exact same snapshot a millisecond ago
  if (insertError && insertError.code !== '23505') {
    throw new Error("Snapshot insert failed: " + insertError.message);
  }

  // 7. Revalidate UI safely
  revalidatePath("/", "layout");

  return { success: true, message: "Snapshot created successfully" };
}
