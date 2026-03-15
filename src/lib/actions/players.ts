"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { ADMIN_SECRET } from "@/lib/constants";

/**
 * Updates a player's skill rating.
 * @param playerId The UUID of the player.
 * @param skill The new skill rating (1-10).
 * @param mode The access mode (admin secret required).
 */
export async function updatePlayerSkill(playerId: string, skill: number, mode?: string) {
    if (mode !== ADMIN_SECRET) {
        throw new Error("Unauthorized: Admin access required to update player skill");
    }
    if (skill < 1 || skill > 10) {
        throw new Error("Skill rating must be between 1 and 10.");
    }

    const { error } = await supabase
        .from("players")
        .update({ skill_rating: skill })
        .eq("id", playerId);

    if (error) {
        console.error("Error updating player skill:", error);
        throw new Error("Failed to update skill rating: " + error.message);
    }

    revalidatePath("/");
    revalidatePath("/players");
    revalidatePath(`/players/${playerId}`);
}
