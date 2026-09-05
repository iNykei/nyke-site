"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { PlayerGearRow } from "@/types/database";

export type GearMutationInput = { operation: "add" | "activate" | "remove"; gearItemId: string };
export type GearMutationResult =
  | { status: "success"; message: string; rows: PlayerGearRow[] }
  | { status: "error"; message: string };

export async function updateGearCollection(input: GearMutationInput): Promise<GearMutationResult> {
  if (!input || !["add", "activate", "remove"].includes(input.operation) ||
      typeof input.gearItemId !== "string" || !/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(input.gearItemId)) {
    return { status: "error", message: "Choose a valid gear item." };
  }

  try {
    const supabase = await createClient();
    if (!supabase) return { status: "error", message: "Gear is unavailable right now." };
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { status: "error", message: "Sign in to manage your gear." };

    // Resolve identity on the server; no client-supplied user ID or username is used.
    const { data: profile, error: profileError } = await supabase.from("profiles").select("username").eq("id", user.id).single();
    if (profileError || !profile) return { status: "error", message: "Your profile could not be loaded." };

    let mutationError: { code?: string; message: string } | null = null;
    if (input.operation === "add") {
      const { data: item, error } = await supabase.from("gear_items").select("id, category").eq("id", input.gearItemId).single();
      if (error || !item) return { status: "error", message: "This gear is no longer in the catalog." };
      const result = await supabase.from("player_gear").upsert({
        user_id: user.id, gear_item_id: item.id, category: item.category, is_active: false,
      }, { onConflict: "user_id,gear_item_id", ignoreDuplicates: true });
      mutationError = result.error;
    } else if (input.operation === "activate") {
      const result = await supabase.rpc("set_active_player_gear", { p_gear_item_id: input.gearItemId });
      mutationError = result.error;
    } else {
      const result = await supabase.from("player_gear").delete().eq("user_id", user.id).eq("gear_item_id", input.gearItemId);
      mutationError = result.error;
    }

    if (mutationError) {
      if (["42P10", "42883", "PGRST202"].includes(mutationError.code ?? "")) {
        return { status: "error", message: "Gear collection updates are not available yet. Please try again after the database update." };
      }
      return { status: "error", message: input.operation === "activate" ? "Gear could not be activated. Your previous loadout was kept." : "Your collection could not be updated. Please try again." };
    }

    revalidatePath(`/${profile.username}`, "layout");
    revalidatePath("/settings/gear");
    revalidatePath("/settings/profile");
    revalidatePath("/gear");
    revalidatePath("/explore");
    revalidatePath("/");

    const { data: rows, error } = await supabase.from("player_gear")
      .select("id, user_id, gear_item_id, category, is_active, created_at").eq("user_id", user.id);
    if (error) return { status: "error", message: "The update was saved, but your collection could not be refreshed. Reload this page." };
    const isSaved = rows.some((row) => row.gear_item_id === input.gearItemId);
    const isActive = rows.some((row) => row.gear_item_id === input.gearItemId && row.is_active);
    if ((input.operation === "add" && !isSaved) || (input.operation === "activate" && !isActive) || (input.operation === "remove" && isSaved)) {
      return { status: "error", message: "Your collection changed before this update finished. Reload and try again." };
    }
    return {
      status: "success", rows,
      message: input.operation === "add" ? "Added to your collection." : input.operation === "activate" ? "Active loadout updated." : "Removed from your collection.",
    };
  } catch {
    return { status: "error", message: "Gear is unavailable right now. Reload to check your collection before trying again." };
  }
}
