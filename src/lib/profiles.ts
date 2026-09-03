import { createClient } from "@/lib/supabase/server";
import { getPlayerByUsername, players } from "@/lib/mock-data";
import type { GearItem, PlayerGear, PlayerProfile } from "@/types";
import type { GearItemRow, PlayerGearRow, PlayerSettingsRow, ProfileRow } from "@/types/database";

const gearCategories = ["mouse", "mousepad", "keyboard", "monitor", "headset", "skates"] as const;

export type EditableProfileData = {
  profile: ProfileRow;
  settings: PlayerSettingsRow | null;
  gearItems: GearItemRow[];
  activeGear: Record<string, string>;
};

export type PublicProfileData = {
  source: "real" | "demo";
  profile: ProfileRow | null;
  settings: PlayerSettingsRow | null;
  player: PlayerProfile;
  isOwner: boolean;
};

function placeholderGear(category: string): GearItem {
  return {
    id: `not-configured-${category}`,
    name: "Not configured",
    maker: "--",
    category: category as GearItem["category"],
    summary: "No gear selected yet.",
    accent: "from-zinc-800 to-zinc-700",
    specs: {},
  };
}

function rowToGearItem(row: GearItemRow): GearItem {
  return {
    id: row.id,
    name: row.model,
    maker: row.brand,
    category: row.category as GearItem["category"],
    summary: `${row.brand} ${row.model}`,
    accent: "from-zinc-600 to-lime-300/30",
    specs: {},
  };
}

function buildGear(rows: GearItemRow[]): PlayerGear {
  const byCategory = new Map(rows.map((row) => [row.category, rowToGearItem(row)]));

  return {
    mouse: byCategory.get("mouse") ?? placeholderGear("mouse"),
    mousepad: byCategory.get("mousepad") ?? placeholderGear("mousepad"),
    keyboard: byCategory.get("keyboard") ?? placeholderGear("keyboard"),
    monitor: byCategory.get("monitor") ?? placeholderGear("monitor"),
    headset: byCategory.get("headset") ?? placeholderGear("headset"),
    skates: byCategory.get("skates") ?? placeholderGear("skates"),
  };
}

function buildRealPlayer(profile: ProfileRow, settings: PlayerSettingsRow | null, gearRows: GearItemRow[]): PlayerProfile {
  return {
    username: profile.username,
    displayName: profile.display_name || profile.username,
    avatarUrl: profile.avatar_url || undefined,
    avatarSeed: (profile.display_name || profile.username).slice(0, 2).toUpperCase(),
    bio: profile.bio || "No bio yet.",
    region: profile.region || "Not configured",
    role: "Player",
    team: "Independent",
    status: "offline",
    settings: {
      game: settings?.game || "Not configured",
      rank: settings?.rank || "Not configured",
      dpi: settings?.dpi ?? null,
      sensitivity: settings?.sensitivity === null || settings?.sensitivity === undefined ? null : Number(settings.sensitivity),
      resolution: settings?.resolution || "Not configured",
      pollingRate: settings?.polling_rate ? `${settings.polling_rate} Hz` : "Not configured",
    },
    gear: buildGear(gearRows),
    highlights: [],
  };
}

export async function getProfileByUsername(username: string): Promise<ProfileRow | null> {
  const supabase = await createClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, bio, region, created_at, updated_at")
    .eq("username", username.toLowerCase())
    .maybeSingle();

  if (error) {
    return null;
  }

  return data;
}

export async function getCurrentUserAndProfile() {
  const supabase = await createClient();

  if (!supabase) {
    return { user: null, profile: null };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, profile: null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, bio, region, created_at, updated_at")
    .eq("id", user.id)
    .maybeSingle();

  return { user, profile };
}

export async function getPublicProfileData(username: string): Promise<PublicProfileData | null> {
  const supabase = await createClient();
  const demoPlayer = getPlayerByUsername(username);

  if (!supabase) {
    return demoPlayer
      ? { source: "demo", profile: null, settings: null, player: demoPlayer, isOwner: false }
      : null;
  }

  const [{ data: realProfile }, current] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, username, display_name, avatar_url, bio, region, created_at, updated_at")
      .eq("username", username.toLowerCase())
      .maybeSingle(),
    getCurrentUserAndProfile(),
  ]);

  if (!realProfile) {
    return demoPlayer
      ? { source: "demo", profile: null, settings: null, player: demoPlayer, isOwner: false }
      : null;
  }

  const [{ data: settings }, { data: playerGear }] = await Promise.all([
    supabase
      .from("player_settings")
      .select("id, user_id, game, rank, dpi, sensitivity, resolution, polling_rate, created_at, updated_at")
      .eq("user_id", realProfile.id)
      .maybeSingle(),
    supabase
      .from("player_gear")
      .select("id, user_id, gear_item_id, category, is_active, created_at")
      .eq("user_id", realProfile.id)
      .eq("is_active", true),
  ]);

  const gearIds = ((playerGear ?? []) as PlayerGearRow[]).map((row) => row.gear_item_id);
  const { data: gearRows } = gearIds.length
    ? await supabase
        .from("gear_items")
        .select("id, brand, model, category, created_at")
        .in("id", gearIds)
    : { data: [] };

  return {
    source: "real",
    profile: realProfile,
    settings: settings ?? null,
    player: buildRealPlayer(realProfile, settings ?? null, (gearRows ?? []) as GearItemRow[]),
    isOwner: current.user?.id === realProfile.id,
  };
}

export async function getEditableProfileData(): Promise<EditableProfileData | null> {
  const supabase = await createClient();

  if (!supabase) {
    return null;
  }

  const { user, profile } = await getCurrentUserAndProfile();

  if (!user || !profile) {
    return null;
  }

  const [{ data: settings }, { data: gearItems }, { data: activeGearRows }] = await Promise.all([
    supabase
      .from("player_settings")
      .select("id, user_id, game, rank, dpi, sensitivity, resolution, polling_rate, created_at, updated_at")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("gear_items")
      .select("id, brand, model, category, created_at")
      .order("category")
      .order("brand")
      .order("model"),
    supabase
      .from("player_gear")
      .select("id, user_id, gear_item_id, category, is_active, created_at")
      .eq("user_id", user.id)
      .eq("is_active", true),
  ]);

  return {
    profile,
    settings: settings ?? null,
    gearItems: (gearItems ?? []) as GearItemRow[],
    activeGear: Object.fromEntries(
      gearCategories.map((category) => [
        category,
        ((activeGearRows ?? []) as PlayerGearRow[]).find((row) => row.category === category)?.gear_item_id ?? "",
      ]),
    ),
  };
}

export function getDemoProfiles() {
  return players;
}
