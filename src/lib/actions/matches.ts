"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

interface MatchPayload {
    sessionId: string;
    teamAIds: string[];
    teamBIds: string[];
    scoreA: number;
    scoreB: number;
    playedAt?: string;
}

export async function addMatch(payloadJson: string) {
    try {
        const payload: MatchPayload = JSON.parse(payloadJson);

        const { teamAIds, teamBIds, scoreA, scoreB, sessionId, playedAt } = payload;

        // Validation
        if (!teamAIds?.length || !teamBIds?.length) {
            return { success: false, error: "Validation error: At least one player per team is required." };
        }

        const allPlayerIds = [...teamAIds, ...teamBIds];
        const uniquePlayers = new Set(allPlayerIds);
        if (uniquePlayers.size !== allPlayerIds.length) {
            return { success: false, error: "Validation error: A player cannot be on both teams." };
        }

        // Map arrays → fixed columns (schema has team_a_player1, team_a_player2, team_b_player1, team_b_player2)
        const insertData: any = {
            session_id: sessionId,
            team_a_player1: teamAIds[0] ?? null,
            team_a_player2: teamAIds[1] ?? null,
            team_b_player1: teamBIds[0] ?? null,
            team_b_player2: teamBIds[1] ?? null,
            team_a_score: scoreA,
            team_b_score: scoreB
        };

        if (playedAt) {
            insertData.played_at = playedAt;
        }

        const { data: match, error: matchError } = await supabase
            .from("matches")
            .insert([insertData])
            .select()
            .single();

        if (matchError || !match) {
            console.error("Match insert error:", matchError);
            return { success: false, error: "Database error: " + (matchError?.message || "Failed to save match") };
        }

        revalidatePath("/");
        revalidatePath("/sessions");
        return { success: true };
    } catch (err: unknown) {
        const e = err as Error;
        console.error("addMatch unexpected error:", e);
        return { success: false, error: e.message || "An unexpected error occurred" };
    }
}

export async function updateMatch(id: string, payloadJson: string) {
    try {
        const payload: Partial<MatchPayload> = JSON.parse(payloadJson);

        const { teamAIds, teamBIds, scoreA, scoreB, playedAt } = payload;

        // Build update object — always overwrite all 4 player columns so old data doesn't linger
        const updateData: Record<string, string | number | null> = {};

        if (teamAIds !== undefined) {
            updateData.team_a_player1 = teamAIds[0] ?? null;
            updateData.team_a_player2 = teamAIds[1] ?? null;
        }
        if (teamBIds !== undefined) {
            updateData.team_b_player1 = teamBIds[0] ?? null;
            updateData.team_b_player2 = teamBIds[1] ?? null;
        }
        if (scoreA !== undefined) updateData.team_a_score = scoreA;
        if (scoreB !== undefined) updateData.team_b_score = scoreB;
        if (playedAt !== undefined) updateData.played_at = playedAt;

        const { error } = await supabase
            .from("matches")
            .update(updateData)
            .eq("id", id);

        if (error) {
            return { success: false, error: error.message };
        }

        revalidatePath("/");
        revalidatePath("/sessions");
        return { success: true };
    } catch (err: unknown) {
        const e = err as Error;
        return { success: false, error: e.message || "An unexpected error occurred" };
    }
}

export async function deleteMatch(id: string) {
    try {
        const { error } = await supabase
            .from("matches")
            .delete()
            .eq("id", id);

        if (error) {
            return { success: false, error: error.message };
        }

        revalidatePath("/");
        revalidatePath("/sessions");
        return { success: true };
    } catch (err: unknown) {
        const e = err as Error;
        return { success: false, error: e.message || "An unexpected error occurred" };
    }
}
