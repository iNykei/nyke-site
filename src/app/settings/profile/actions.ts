"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isReservedUsername, isValidUsername, normalizeUsername } from "@/lib/validation";

export type SaveProfileState = {
  status: "idle" | "success" | "error";
  message: string;
  username?: string;
};

const gearCategories = ["mouse", "mousepad", "keyboard", "monitor", "headset", "skates"];

function optionalText(value: FormDataEntryValue | null, maxLength: number) {
  const text = String(value ?? "").trim();
  return text ? text.slice(0, maxLength) : null;
}

function optionalInteger(value: FormDataEntryValue | null, min: number, max: number) {
  const text = String(value ?? "").trim();
  if (!text) {
    return null;
  }

  const parsed = Number(text);
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
    return undefined;
  }

  return parsed;
}

function optionalPositiveNumber(value: FormDataEntryValue | null, max: number) {
  const text = String(value ?? "").trim();
  if (!text) {
    return null;
  }

  const parsed = Number(text);
  if (!Number.isFinite(parsed) || parsed <= 0 || parsed > max) {
    return undefined;
  }

  return parsed;
}

export async function saveProfile(_previousState: SaveProfileState, formData: FormData): Promise<SaveProfileState> {
  const supabase = await createClient();

  if (!supabase) {
    return { status: "error", message: "Supabase is not configured." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "You must be signed in to edit your profile." };
  }

  const username = normalizeUsername(String(formData.get("username") ?? ""));
  const displayName = optionalText(formData.get("display_name"), 60);
  const bio = optionalText(formData.get("bio"), 240);
  const region = optionalText(formData.get("region"), 32);
  const avatarUrl = optionalText(formData.get("avatar_url"), 500);
  const game = optionalText(formData.get("game"), 60);
  const rank = optionalText(formData.get("rank"), 60);
  const resolution = optionalText(formData.get("resolution"), 32);
  const dpi = optionalInteger(formData.get("dpi"), 100, 12800);
  const pollingRate = optionalInteger(formData.get("polling_rate"), 125, 8000);
  const sensitivity = optionalPositiveNumber(formData.get("sensitivity"), 20);

  if (isReservedUsername(username)) {
    return { status: "error", message: "That username is reserved. Choose another username." };
  }

  if (!isValidUsername(username)) {
    return { status: "error", message: "Username must be 3-20 lowercase letters, numbers, underscore, or hyphen." };
  }

  if (bio && bio.length > 240) {
    return { status: "error", message: "Bio must be 240 characters or fewer." };
  }

  if (dpi === undefined) {
    return { status: "error", message: "DPI must be a whole number between 100 and 12800." };
  }

  if (pollingRate === undefined) {
    return { status: "error", message: "Polling rate must be a whole number between 125 and 8000." };
  }

  if (sensitivity === undefined) {
    return { status: "error", message: "Sensitivity must be a positive number." };
  }

  const { data: existingUsername, error: usernameLookupError } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .neq("id", user.id)
    .maybeSingle();

  if (usernameLookupError) {
    return { status: "error", message: "Username availability could not be checked." };
  }

  if (existingUsername) {
    return { status: "error", message: "That username is already taken." };
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      username,
      display_name: displayName,
      bio,
      region,
      avatar_url: avatarUrl,
    })
    .eq("id", user.id)
    .select("id")
    .single();

  if (profileError) {
    return { status: "error", message: "Profile could not be saved." };
  }

  const { error: settingsError } = await supabase
    .from("player_settings")
    .upsert(
      {
        user_id: user.id,
        game,
        rank,
        dpi,
        sensitivity,
        resolution,
        polling_rate: pollingRate,
      },
      { onConflict: "user_id" },
    )
    .select("id")
    .single();

  if (settingsError) {
    return { status: "error", message: "Game settings could not be saved." };
  }

  const selectedGearIds = gearCategories
    .map((category) => String(formData.get(`gear_${category}`) ?? "").trim())
    .filter(Boolean);

  const { data: validGearRows, error: gearLookupError } = selectedGearIds.length
    ? await supabase
        .from("gear_items")
        .select("id, category")
        .in("id", selectedGearIds)
    : { data: [], error: null };

  if (gearLookupError) {
    return { status: "error", message: "Selected gear could not be verified." };
  }

  const validGearById = new Map((validGearRows ?? []).map((row) => [row.id, row.category]));

  if (selectedGearIds.some((id) => !validGearById.has(id))) {
    return { status: "error", message: "Selected gear is not available." };
  }

  for (const category of gearCategories) {
    const gearItemId = String(formData.get(`gear_${category}`) ?? "").trim();

    if (gearItemId && validGearById.get(gearItemId) !== category) {
      return { status: "error", message: "Selected gear category does not match." };
    }

    const { error: clearError } = await supabase
      .from("player_gear")
      .delete()
      .eq("user_id", user.id)
      .eq("category", category);

    if (clearError) {
      return { status: "error", message: "Gear could not be saved." };
    }

    if (gearItemId) {
      const { error: gearError } = await supabase
        .from("player_gear")
        .insert({
          user_id: user.id,
          gear_item_id: gearItemId,
          category,
          is_active: true,
        })
        .select("id")
        .single();

      if (gearError) {
        return { status: "error", message: "Gear could not be saved." };
      }
    }
  }

  revalidatePath(`/${username}`);
  revalidatePath("/settings/profile");

  return { status: "success", message: "Saved.", username };
}
