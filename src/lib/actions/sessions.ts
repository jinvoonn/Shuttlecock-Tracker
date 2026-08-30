"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { assertAdmin, assertAdminOrViewerPermission } from "../auth";
import { VIEWER_PERMISSIONS } from "@/lib/constants";

export async function addSession(payloadStr: string, mode?: string) {
    const payload = JSON.parse(payloadStr);
    await assertAdmin(mode || payload.mode, "addSession");
    const { date, startTime, location, notes, playerIds, newPlayerNames, usage } = payload;

    if (!date || (playerIds.length === 0 && newPlayerNames.length === 0)) {
        throw new Error("Date and at least one player are required");
    }

    // 1. Process new players
    const finalPlayerIds = new Set(playerIds);

    if (newPlayerNames && newPlayerNames.length > 0) {
        for (const name of newPlayerNames) {
            const cleanName = name.trim();
            if (!cleanName) continue;

            // Check if player exists
            const { data: existing } = await supabase.from("players").select("id").ilike("name", cleanName).single();

            if (existing) {
                finalPlayerIds.add(existing.id);
            } else {
                const { data: newPlayer, error: newError } = await supabase.from("players").insert([{ name: cleanName }]).select().single();
                if (newError) {
                    throw new Error("Failed to add new player: " + newError.message);
                }
                if (newPlayer) {
                    finalPlayerIds.add(newPlayer.id);
                }
            }
        }
    }

    const uniquePlayerIds = Array.from(finalPlayerIds);

    if (uniquePlayerIds.length === 0) {
        throw new Error("No players selected after resolution");
    }

    // 2. Validate usage amounts against remaining_quantity
    for (const { purchaseId, quantityUsed } of usage) {
        if (quantityUsed > 0) {
            const { data: purchase } = await supabase.from("purchases").select("remaining_quantity").eq("id", purchaseId).single();
            if (!purchase || purchase.remaining_quantity < quantityUsed) {
                throw new Error("Invalid usage quantity for a shuttlecock tube.");
            }
        }
    }

    // 3. Insert session
    const insertData: any = {
        date,
        location,
        notes
    };
    if (startTime) insertData.start_time = startTime;

    const { data: session, error: sessionError } = await supabase.from("sessions").insert([insertData]).select().single();

    if (sessionError || !session) {
        throw new Error("Failed to create session: " + sessionError?.message);
    }

    // 4. Insert session_players
    const sessionPlayers = uniquePlayerIds.map(id => ({
        session_id: session.id,
        player_id: id
    }));
    const { error: spError } = await supabase.from("session_players").insert(sessionPlayers);
    if (spError) {
        throw new Error("Failed to link players to session: " + spError.message);
    }

    // 5. Build usage entries and update purchases
    const usageInserts = [];
    for (const { purchaseId, quantityUsed } of usage) {
        if (quantityUsed > 0) {
            usageInserts.push({
                session_id: session.id,
                purchase_id: purchaseId,
                quantity_used: quantityUsed
            });

            // Update purchase remaining quantity using RPC or just regular update since we don't have concurrency overhead concerns right now for an MVP.
            const { data: currentPurchase } = await supabase.from("purchases").select("remaining_quantity").eq("id", purchaseId).single();

            if (currentPurchase) {
                await supabase.from("purchases")
                    .update({ remaining_quantity: currentPurchase.remaining_quantity - quantityUsed })
                    .eq("id", purchaseId);
            }
        }
    }

    if (usageInserts.length > 0) {
        const { error: usgError } = await supabase.from("session_usage").insert(usageInserts);
        if (usgError) {
            throw new Error("Failed to save usage data: " + usgError.message);
        }
    }

    revalidatePath("/");
    revalidatePath("/sessions");
    revalidatePath("/purchases"); // update quantities
}

export async function editSession(id: string, payloadStr: string, mode?: string) {
    const payload = JSON.parse(payloadStr);
    await assertAdminOrViewerPermission(VIEWER_PERMISSIONS.EDIT_SESSION, mode || payload.mode, "editSession");

    const { date, startTime, location, notes, playerIds, newPlayerNames, usage } = payload;

    if (!date || (playerIds.length === 0 && newPlayerNames.length === 0)) {
        throw new Error("Date and at least one player are required");
    }

    // 1. Revert previous usage to restore inventory
    const { data: oldUsages } = await supabase.from("session_usage").select("purchase_id, quantity_used").eq("session_id", id);
    if (oldUsages) {
        for (const u of oldUsages) {
            const { data: p } = await supabase.from("purchases").select("remaining_quantity").eq("id", u.purchase_id).single();
            if (p) {
                await supabase.from("purchases").update({ remaining_quantity: p.remaining_quantity + u.quantity_used }).eq("id", u.purchase_id);
            }
        }
    }

    // 2. Clear old relations
    await supabase.from("session_players").delete().eq("session_id", id);
    await supabase.from("session_usage").delete().eq("session_id", id);

    // 3. Update session metadata
    const updateData: any = { date, location, notes };
    if (startTime) updateData.start_time = startTime;
    await supabase.from("sessions").update(updateData).eq("id", id);

    // 4. Resolve players (same logic as addSession - could be refactored if needed)
    const finalPlayerIds = new Set<string>(playerIds);
    if (newPlayerNames && newPlayerNames.length > 0) {
        for (const name of newPlayerNames) {
            const cleanName = (name as string).trim();
            if (!cleanName) continue;
            const { data: existing } = await supabase.from("players").select("id").ilike("name", cleanName).single();
            if (existing) {
                finalPlayerIds.add(existing.id);
            } else {
                const { data: newPlayer } = await supabase.from("players").insert([{ name: cleanName }]).select().single();
                if (newPlayer) finalPlayerIds.add(newPlayer.id);
            }
        }
    }
    const uniquePlayerIds = Array.from(finalPlayerIds);

    // 5. Insert new players
    const sessionPlayers = uniquePlayerIds.map(pId => ({ session_id: id, player_id: pId }));
    await supabase.from("session_players").insert(sessionPlayers);

    // 6. Apply new usage and update inventory
    const usageInserts = [];
    for (const { purchaseId, quantityUsed } of usage) {
        if (quantityUsed > 0) {
            usageInserts.push({ session_id: id, purchase_id: purchaseId, quantity_used: quantityUsed });

            const { data: p } = await supabase.from("purchases").select("remaining_quantity").eq("id", purchaseId).single();
            if (p) {
                await supabase.from("purchases").update({ remaining_quantity: p.remaining_quantity - quantityUsed }).eq("id", purchaseId);
            }
        }
    }
    if (usageInserts.length > 0) {
        await supabase.from("session_usage").insert(usageInserts);
    }

    revalidatePath("/");
    revalidatePath("/sessions");
    revalidatePath("/purchases");
}

export async function deleteSession(id: string, modeOrFormData?: string | FormData) {
    const mode = typeof modeOrFormData === "string" ? modeOrFormData : undefined;
    await assertAdminOrViewerPermission(VIEWER_PERMISSIONS.DELETE_SESSION, mode, "deleteSession");

    // 1. Revert usage before cascade deletion to restore stock
    const { data: usages } = await supabase.from("session_usage").select("purchase_id, quantity_used").eq("session_id", id);
    if (usages) {
        for (const u of usages) {
            const { data: p } = await supabase.from("purchases").select("remaining_quantity").eq("id", u.purchase_id).single();
            if (p) {
                await supabase.from("purchases").update({ remaining_quantity: p.remaining_quantity + u.quantity_used }).eq("id", u.purchase_id);
            }
        }
    }

    // 2. Cascade delete (matches, session_players, session_usage deleted via DB foreign keys or manual check)
    const { error } = await supabase.from("sessions").delete().eq("id", id);
    if (error) {
        throw new Error("Failed to delete session: " + error.message);
    }

    revalidatePath("/");
    revalidatePath("/sessions");
    revalidatePath("/purchases");
}

export async function updateSessionMetadata(id: string, formData: FormData, mode?: string) {
    const finalMode = mode || (formData.get("mode") as string);
    await assertAdminOrViewerPermission(VIEWER_PERMISSIONS.EDIT_SESSION, finalMode, "updateSessionMetadata");

    const date = formData.get("date") as string;
    const location = formData.get("location") as string;
    const startTime = formData.get("startTime") as string;

    if (!date || !location) {
        throw new Error("Date and location are required");
    }

    const updateData: any = { date, location };
    if (startTime) updateData.start_time = startTime;

    const { error } = await supabase.from("sessions").update(updateData).eq("id", id);
    if (error) {
        throw new Error("Failed to update session: " + error.message);
    }

    revalidatePath("/");
    revalidatePath("/sessions");
}
