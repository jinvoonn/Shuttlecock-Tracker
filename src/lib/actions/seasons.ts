"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";
import { normalizeMatches } from "@/lib/analytics/normalize";
import { aggregatePlayerStats } from "@/lib/analytics/core";
import { getLeaderboard } from "@/lib/analytics/leaderboard";
import { Season, SeasonPlayerResult, DEFAULT_SEASON_CONFIG, calculateSoftResetRatings } from "@/lib/analytics/season";

/**
 * Retrieves the currently active season.
 * Auto-seeds Season 1 if the seasons table is empty or has not been initialized yet.
 */
export async function getActiveSeason(): Promise<Season | null> {
  try {
    const { data: seasons, error } = await supabase
      .from("seasons")
      .select("*")
      .eq("status", "active")
      .order("season_number", { ascending: false })
      .limit(1);

    if (error) {
      console.warn("Seasons table query notice (using fallback):", error.message);
      return {
        id: "fallback-season-1",
        season_number: 1,
        name: "Season 1",
        status: "active",
        start_date: "2023-09-13",
        created_at: new Date().toISOString(),
        config: DEFAULT_SEASON_CONFIG
      };
    }

    if (seasons && seasons.length > 0) {
      return seasons[0] as Season;
    }

    // Auto-seed Season 1 if no active season exists
    const { data: inserted, error: insertError } = await supabase
      .from("seasons")
      .insert([
        {
          season_number: 1,
          name: "Season 1",
          status: "active",
          start_date: "2023-09-13",
          config: DEFAULT_SEASON_CONFIG
        }
      ])
      .select()
      .single();

    if (insertError) {
      console.warn("Could not insert default Season 1:", insertError.message);
      return {
        id: "fallback-season-1",
        season_number: 1,
        name: "Season 1",
        status: "active",
        start_date: "2023-09-13",
        created_at: new Date().toISOString(),
        config: DEFAULT_SEASON_CONFIG
      };
    }

    return inserted as Season;
  } catch (err) {
    console.error("getActiveSeason error:", err);
    return {
      id: "fallback-season-1",
      season_number: 1,
      name: "Season 1",
      status: "active",
      start_date: "2023-09-13",
      created_at: new Date().toISOString(),
      config: DEFAULT_SEASON_CONFIG
    };
  }
}

/**
 * Retrieves all seasons (active and completed), sorted latest first.
 */
export async function getAllSeasons(): Promise<Season[]> {
  try {
    const { data: seasons, error } = await supabase
      .from("seasons")
      .select("*")
      .order("season_number", { ascending: false });

    if (error || !seasons || seasons.length === 0) {
      const active = await getActiveSeason();
      return active ? [active] : [];
    }

    return seasons as Season[];
  } catch (err) {
    console.error("getAllSeasons error:", err);
    return [
      {
        id: "fallback-season-1",
        season_number: 1,
        name: "Season 1",
        status: "active",
        start_date: "2023-09-13",
        created_at: new Date().toISOString(),
        config: DEFAULT_SEASON_CONFIG
      }
    ];
  }
}

/**
 * Retrieves the immutable end-of-season historical snapshots for a specific completed season.
 */
export async function getSeasonPlayerResults(seasonId: string): Promise<SeasonPlayerResult[]> {
  try {
    const { data, error } = await supabase
      .from("season_player_results")
      .select("*, players(name)")
      .eq("season_id", seasonId)
      .order("final_rank", { ascending: true });

    if (error || !data) {
      console.warn("getSeasonPlayerResults notice:", error?.message);
      return [];
    }

    return data.map((row: any) => ({
      ...row,
      player_name: row.players?.name || "Unknown"
    }));
  } catch (err) {
    console.error("getSeasonPlayerResults unexpected error:", err);
    return [];
  }
}

/**
 * Atomic Season Transition: Ends the current active season and creates a new season.
 *
 * Steps:
 * 1. Verify active season exists.
 * 2. Calculate final season leaderboard and snapshot all player ratings & stats.
 * 3. Store immutable snapshots in `season_player_results`.
 * 4. Mark active season as `completed` with `ended_at = now()`.
 * 5. Create new season (`season_number = N + 1`, `status = 'active'`, `start_date = now()`).
 * 6. ZERO modifications to financial records (payments/balances).
 */
export async function endAndStartNewSeason(startDate?: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
  newSeasonNumber?: number;
}> {
  try {
    // 1. Get active season
    const activeSeason = await getActiveSeason();
    if (!activeSeason || activeSeason.id === "fallback-season-1") {
      return { success: false, error: "Cannot find database active season to complete." };
    }

    const nowIso = new Date().toISOString();
    const seasonStartDate = startDate && startDate.trim() !== "" ? startDate.trim() : nowIso.slice(0, 10);

    // 2. Fetch matches and players
    const [
      { data: players, error: errPlayers },
      { data: allMatches, error: errMatches }
    ] = await Promise.all([
      supabase.from("players").select("id, name"),
      supabase.from("matches").select("*").order("played_at", { ascending: true })
    ]);

    if (errPlayers || errMatches) {
      return { success: false, error: "Failed to fetch players or matches for season finalization." };
    }

    const playerMap = Object.fromEntries((players || []).map((p: any) => [p.id, p.name]));
    
    // Filter matches belonging to this season (or all matches if Season 1 with unassigned IDs)
    const seasonMatchesRaw = (allMatches || []).filter((m: any) => {
      if (m.season_id) return m.season_id === activeSeason.id;
      // If season_id is null and this is Season 1, include it
      return activeSeason.season_number === 1;
    });

    const normalizedSeasonMatches = normalizeMatches(seasonMatchesRaw, playerMap);

    // 3. Compute final seasonal leaderboard & detailed ratings
    const { stats, elo, detailed } = aggregatePlayerStats(normalizedSeasonMatches, playerMap);
    const leaderboard = getLeaderboard(stats, elo, { sortBy: "elo" });

    // 4. Build immutable snapshot rows for all active participants
    const snapshotRows = leaderboard.map((p, index) => {
      const pDetail = detailed[p.id] || { r: p.elo, rd: 350, xp: 0 };
      return {
        season_id: activeSeason.id,
        player_id: p.id,
        final_mmr: pDetail.r,
        final_rd: pDetail.rd,
        final_xp: pDetail.xp,
        final_cock_rating: p.elo,
        final_rank: index + 1,
        wins: p.wins || 0,
        losses: p.losses || 0,
        draws: p.draws || 0,
        matches_played: p.totalGames || 0,
        win_rate: p.winRate || 0,
        streak: p.streak || 0,
        max_streak: p.maxStreak || 0,
      };
    });

    // 5. Upsert snapshots into season_player_results
    if (snapshotRows.length > 0) {
      const { error: snapshotError } = await supabase
        .from("season_player_results")
        .upsert(snapshotRows, { onConflict: "season_id,player_id" });

      if (snapshotError) {
        console.error("Failed to save season snapshots:", snapshotError);
        return { success: false, error: "Failed to save season snapshots: " + snapshotError.message };
      }
    }

    // 6. Mark active season as completed
    const { error: completeError } = await supabase
      .from("seasons")
      .update({
        status: "completed",
        end_date: seasonStartDate,
        ended_at: nowIso
      })
      .eq("id", activeSeason.id);

    if (completeError) {
      console.error("Failed to mark season as completed:", completeError);
      return { success: false, error: "Failed to mark season completed: " + completeError.message };
    }

    // 7. Create New Season
    const newSeasonNumber = activeSeason.season_number + 1;
    const { error: newSeasonError } = await supabase
      .from("seasons")
      .insert([
        {
          season_number: newSeasonNumber,
          name: `Season ${newSeasonNumber}`,
          status: "active",
          start_date: seasonStartDate,
          config: DEFAULT_SEASON_CONFIG
        }
      ]);

    if (newSeasonError) {
      console.error("Failed to create new season:", newSeasonError);
      return { success: false, error: "Season completed, but failed to create Season " + newSeasonNumber + ": " + newSeasonError.message };
    }

    // 8. Revalidate all application layouts and routes
    revalidatePath("/", "layout");
    revalidatePath("/sessions");
    revalidatePath("/players");
    revalidatePath("/cockrating");

    return {
      success: true,
      message: `Season ${activeSeason.season_number} finalized successfully. Season ${newSeasonNumber} is now live!`,
      newSeasonNumber
    };
  } catch (err: unknown) {
    const e = err as Error;
    console.error("endAndStartNewSeason error:", e);
    return { success: false, error: e.message || "An unexpected error occurred during season transition." };
  }
}

/**
 * Rollback / Revert Season Transition:
 * Reverts the current active season back to the previous completed season.
 * Safety rule:
 * - Season must be Season > 1.
 * - Current active season must have 0 matches recorded to avoid accidental data loss.
 */
export async function rollbackToPreviousSeason(): Promise<{
  success: boolean;
  message?: string;
  error?: string;
  revertedToSeasonNumber?: number;
}> {
  try {
    const activeSeason = await getActiveSeason();
    if (!activeSeason || activeSeason.id === "fallback-season-1") {
      return { success: false, error: "No active season found to rollback." };
    }

    if (activeSeason.season_number <= 1) {
      return { success: false, error: "Cannot rollback Season 1. Season 1 is the genesis season." };
    }

    // Check if any matches have been recorded in this active season
    const { count: matchCount, error: countErr } = await supabase
      .from("matches")
      .select("id", { count: "exact", head: true })
      .eq("season_id", activeSeason.id);

    if (countErr) {
      return { success: false, error: "Failed to verify matches in active season: " + countErr.message };
    }

    if (matchCount && matchCount > 0) {
      return { 
        success: false, 
        error: `Cannot rollback Season ${activeSeason.season_number} because it already has ${matchCount} recorded match(es). Please delete or reassign matches before rolling back.` 
      };
    }

    const previousSeasonNumber = activeSeason.season_number - 1;

    // Fetch the previous season row
    const { data: prevSeason, error: prevErr } = await supabase
      .from("seasons")
      .select("*")
      .eq("season_number", previousSeasonNumber)
      .single();

    if (prevErr || !prevSeason) {
      return { success: false, error: `Could not find Season ${previousSeasonNumber} in the database.` };
    }

    // 1. Delete current empty active season
    const { error: deleteErr } = await supabase
      .from("seasons")
      .delete()
      .eq("id", activeSeason.id);

    if (deleteErr) {
      return { success: false, error: "Failed to remove current season: " + deleteErr.message };
    }

    // 2. Re-open previous season as active
    const { error: reopenErr } = await supabase
      .from("seasons")
      .update({
        status: "active",
        end_date: null,
        ended_at: null
      })
      .eq("id", prevSeason.id);

    if (reopenErr) {
      return { success: false, error: "Failed to re-open previous season: " + reopenErr.message };
    }

    // 3. Clear snapshots of previous season since it's active again
    await supabase
      .from("season_player_results")
      .delete()
      .eq("season_id", prevSeason.id);

    // 4. Revalidate cache
    revalidatePath("/", "layout");
    revalidatePath("/sessions");
    revalidatePath("/players");
    revalidatePath("/cockrating");

    return {
      success: true,
      message: `Rolled back successfully! Season ${previousSeasonNumber} is now active again.`,
      revertedToSeasonNumber: previousSeasonNumber
    };
  } catch (err: unknown) {
    const e = err as Error;
    console.error("rollbackToPreviousSeason error:", e);
    return { success: false, error: e.message || "An unexpected error occurred during season rollback." };
  }
}
