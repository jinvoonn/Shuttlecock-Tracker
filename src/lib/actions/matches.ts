"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

interface AddMatchPayload {
    sessionId: string;
    teamA: string[]; // Player IDs
    teamB: string[]; // Player IDs
    scoreA: number;
    scoreB: number;
}

export async function addMatch(payloadJson: string) {
    const payload: AddMatchPayload = JSON.parse(payloadJson);

    // 1. Insert Match
    const { data: match, error: matchError } = await supabase
        .from("matches")
        .insert([{
            session_id: payload.sessionId,
            team_a_score: payload.scoreA || 0,
            team_b_score: payload.scoreB || 0
        }])
        .select()
        .single();

    if (matchError || !match) {
        throw new Error("Failed to insert match: " + matchError?.message);
    }

    // 2. Insert Match Players
    const matchPlayers = [
        ...payload.teamA.map(playerId => ({ match_id: match.id, player_id: playerId, team: "A" })),
        ...payload.teamB.map(playerId => ({ match_id: match.id, player_id: playerId, team: "B" }))
    ];

    if (matchPlayers.length > 0) {
        const { error: playersError } = await supabase
            .from("match_players")
            .insert(matchPlayers);

        if (playersError) {
            throw new Error("Failed to insert match players: " + playersError.message);
        }
    }

    revalidatePath("/");
    revalidatePath("/sessions");
}

export async function deleteMatch(id: string) {
    const { error } = await supabase
        .from("matches")
        .delete()
        .eq("id", id);

    if (error) {
        throw new Error("Failed to delete match: " + error.message);
    }

    revalidatePath("/");
    revalidatePath("/sessions");
}
