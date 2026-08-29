"use server";

import { cookies } from "next/headers";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { supabase } from "@/lib/supabase";
import { assertAdmin } from "@/lib/auth";
import {
  VIEWER_PERMISSIONS,
  DEFAULT_VIEWER_PERMISSIONS,
  ALL_VIEWER_PERMISSION_KEYS,
  VIEWER_SESSION_COOKIE,
  VIEWER_UNLOCK_TTL_SECONDS,
  ViewerPermission,
} from "@/lib/constants";

const SECRET_KEY = process.env.VIEWER_UNLOCK_SECRET || "cc-badminton-viewer-secret-key-2026";

interface TokenPayload {
  grantedAt: number;
  exp: number;
  permissions: ViewerPermission[];
}

function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return Buffer.from(base64, "base64").toString();
}

function signPayload(payload: TokenPayload): string {
  const payloadStr = base64UrlEncode(JSON.stringify(payload));
  const hmac = crypto.createHmac("sha256", SECRET_KEY);
  hmac.update(payloadStr);
  const signature = base64UrlEncode(hmac.digest("base64"));
  return `${payloadStr}.${signature}`;
}

export async function verifyToken(token?: string | null): Promise<{ valid: boolean; permissions: ViewerPermission[] }> {
  if (!token) return { valid: false, permissions: [] };

  const parts = token.split(".");
  if (parts.length !== 2) return { valid: false, permissions: [] };

  const [payloadStr, signature] = parts;
  const hmac = crypto.createHmac("sha256", SECRET_KEY);
  hmac.update(payloadStr);
  const expectedSignature = base64UrlEncode(hmac.digest("base64"));

  try {
    const isSigMatch = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
    if (!isSigMatch) return { valid: false, permissions: [] };

    const payload: TokenPayload = JSON.parse(base64UrlDecode(payloadStr));
    const now = Math.floor(Date.now() / 1000);

    if (!payload.exp || now > payload.exp) {
      return { valid: false, permissions: [] };
    }

    return { valid: true, permissions: payload.permissions || [] };
  } catch {
    return { valid: false, permissions: [] };
  }
}

/**
 * Reads the current viewer unlock state from the HTTP-only cookie.
 */
export async function getViewerUnlockState(): Promise<{
  unlocked: boolean;
  permissions: ViewerPermission[];
}> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(VIEWER_SESSION_COOKIE)?.value;
    const { valid, permissions } = await verifyToken(token);
    return { unlocked: valid, permissions };
  } catch {
    return { unlocked: false, permissions: [] };
  }
}

/**
 * Returns whether a Viewer PIN has been set up and what permissions are currently enabled.
 * Never returns the PIN or PIN hash.
 */
export async function getViewerPinStatus(): Promise<{
  configured: boolean;
  permissions: ViewerPermission[];
}> {
  try {
    const { data, error } = await supabase
      .from("viewer_settings")
      .select("pin_hash, permissions")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return {
        configured: false,
        permissions: DEFAULT_VIEWER_PERMISSIONS,
      };
    }

    return {
      configured: !!data.pin_hash,
      permissions: (data.permissions as ViewerPermission[]) || DEFAULT_VIEWER_PERMISSIONS,
    };
  } catch {
    return {
      configured: false,
      permissions: DEFAULT_VIEWER_PERMISSIONS,
    };
  }
}

/**
 * Verifies entered PIN against stored bcrypt hash, and creates an HTTP-only unlock cookie on success.
 */
export async function verifyViewerPin(pin: string): Promise<{
  success: boolean;
  error?: string;
  permissions?: ViewerPermission[];
}> {
  if (!pin || typeof pin !== "string" || pin.trim() === "") {
    return { success: false, error: "Please enter a PIN." };
  }

  try {
    const { data: settings, error } = await supabase
      .from("viewer_settings")
      .select("id, pin_hash, permissions")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return { success: false, error: "Database error checking PIN. Please try again." };
    }

    if (!settings || !settings.pin_hash) {
      return {
        success: false,
        error: "Viewer PIN has not been configured yet. Please ask the administrator to set one.",
      };
    }

    const isMatch = await bcrypt.compare(pin.trim(), settings.pin_hash);
    if (!isMatch) {
      return { success: false, error: "Incorrect PIN. Please try again." };
    }

    const permissions: ViewerPermission[] =
      (settings.permissions as ViewerPermission[]) || DEFAULT_VIEWER_PERMISSIONS;

    const now = Math.floor(Date.now() / 1000);
    const token = signPayload({
      grantedAt: now,
      exp: now + VIEWER_UNLOCK_TTL_SECONDS,
      permissions,
    });

    const cookieStore = await cookies();
    cookieStore.set(VIEWER_SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: VIEWER_UNLOCK_TTL_SECONDS,
      path: "/",
    });

    return { success: true, permissions };
  } catch (err: unknown) {
    const e = err as Error;
    return { success: false, error: e.message || "An unexpected error occurred during verification." };
  }
}

/**
 * Admin action: Changes the Viewer PIN. Hashes PIN before saving.
 */
export async function changeViewerPin(
  newPin: string,
  confirmPin: string,
  mode?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await assertAdmin(mode, "changeViewerPin");

    if (!newPin || newPin.trim().length < 4) {
      return { success: false, error: "PIN must be at least 4 digits." };
    }

    if (newPin.trim() !== confirmPin.trim()) {
      return { success: false, error: "PIN entries do not match." };
    }

    const pinHash = await bcrypt.hash(newPin.trim(), 10);

    const { data: existing } = await supabase
      .from("viewer_settings")
      .select("id")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing?.id) {
      const { error } = await supabase
        .from("viewer_settings")
        .update({ pin_hash: pinHash, updated_at: new Date().toISOString() })
        .eq("id", existing.id);

      if (error) throw error;
    } else {
      const { error } = await supabase.from("viewer_settings").insert([
        {
          pin_hash: pinHash,
          permissions: DEFAULT_VIEWER_PERMISSIONS,
          updated_at: new Date().toISOString(),
        },
      ]);
      if (error) throw error;
    }

    return { success: true };
  } catch (err: unknown) {
    const e = err as Error;
    return { success: false, error: e.message || "Failed to update Viewer PIN." };
  }
}

/**
 * Admin action: Updates the list of permissions granted when Viewer is unlocked.
 */
export async function updateViewerPermissions(
  permissions: ViewerPermission[],
  mode?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await assertAdmin(mode, "updateViewerPermissions");

    // Sanitize permissions
    const validPermissions = permissions.filter((p) =>
      ALL_VIEWER_PERMISSION_KEYS.includes(p)
    );

    const { data: existing } = await supabase
      .from("viewer_settings")
      .select("id")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing?.id) {
      const { error } = await supabase
        .from("viewer_settings")
        .update({
          permissions: validPermissions,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);

      if (error) throw error;
    } else {
      const { error } = await supabase.from("viewer_settings").insert([
        {
          permissions: validPermissions,
          updated_at: new Date().toISOString(),
        },
      ]);
      if (error) throw error;
    }

    return { success: true };
  } catch (err: unknown) {
    const e = err as Error;
    return { success: false, error: e.message || "Failed to update Viewer permissions." };
  }
}

/**
 * Locks the current Viewer session by clearing the unlock cookie.
 */
export async function lockViewerSession(): Promise<{ success: boolean }> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(VIEWER_SESSION_COOKIE);
    return { success: true };
  } catch {
    return { success: true };
  }
}
