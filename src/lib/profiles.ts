import { createClient } from "@/lib/supabase/server";
import { getPlayerByUsername, players } from "@/lib/mock-data";
import type { GearItem, PlayerGear, PlayerProfile } from "@/types";
import type { GearItemRow, PlayerGearRow, PlayerSettingsRow, ProfileRow } from "@/types/database";

const gearCategories = ["mouse", "mousepad", "keyboard", "monitor", "headset", "skates"] as const;
type ServerSupabaseClient = NonNullable<Awaited<ReturnType<typeof createClient>>>;

function assertQuerySucceeded(error: { message: string } | null, message: string) {
  if (error) {
    throw new Error(message, { cause: error });
  }
}

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
  activeGear: GearItem[];
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

function getActiveGear(gear: PlayerGear) {
  return gearCategories.map((category) => gear[category]);
}

function buildRealPlayer(profile: ProfileRow, settings: PlayerSettingsRow | null, gearRows: GearItemRow[]): PlayerProfile {
  return {
    username: profile.username,
    displayName: profile.display_name || profile.username,
    avatarUrl: profile.avatar_url || undefined,
    avatarSeed: (profile.display_name || profile.username).slice(0, 2).toUpperCase(),
    bio: profile.bio || "",
    region: profile.region || "",
    role: "Player",
    team: "Independent",
    status: "offline",
    settings: {
      game: settings?.game || "",
      rank: settings?.rank || "",
      dpi: settings?.dpi ?? null,
      sensitivity: settings?.sensitivity === null || settings?.sensitivity === undefined ? null : Number(settings.sensitivity),
      resolution: settings?.resolution || "",
      pollingRate: settings?.polling_rate ? `${settings.polling_rate} Hz` : "",
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

  assertQuerySucceeded(error, "Could not load the profile.");

  return data;
}

export async function getCurrentUserAndProfile(client?: ServerSupabaseClient) {
  const supabase = client ?? await createClient();

  if (!supabase) {
    return { user: null, profile: null };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, profile: null };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, bio, region, created_at, updated_at")
    .eq("id", user.id)
    .maybeSingle();

  assertQuerySucceeded(profileError, "Could not load the signed-in profile.");

  return { user, profile };
}

export async function getPublicProfileData(username: string): Promise<PublicProfileData | null> {
  const supabase = await createClient();
  const demoPlayer = getPlayerByUsername(username);

  if (!supabase) {
    return demoPlayer
      ? { source: "demo", profile: null, settings: null, player: demoPlayer, activeGear: getActiveGear(demoPlayer.gear), isOwner: false }
      : null;
  }

  const [{ data: realProfile, error: realProfileError }, current] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, username, display_name, avatar_url, bio, region, created_at, updated_at")
      .eq("username", username.toLowerCase())
      .maybeSingle(),
    getCurrentUserAndProfile(supabase),
  ]);

  assertQuerySucceeded(realProfileError, "Could not load the public profile.");

  if (!realProfile) {
    return demoPlayer
      ? { source: "demo", profile: null, settings: null, player: demoPlayer, activeGear: getActiveGear(demoPlayer.gear), isOwner: false }
      : null;
  }

  const [{ data: settings, error: settingsError }, { data: playerGear, error: playerGearError }] = await Promise.all([
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

  assertQuerySucceeded(settingsError, "Could not load the player's settings.");
  assertQuerySucceeded(playerGearError, "Could not load the player's gear.");

  const gearIds = ((playerGear ?? []) as PlayerGearRow[]).map((row) => row.gear_item_id);
  const { data: gearRows, error: gearRowsError } = gearIds.length
    ? await supabase
        .from("gear_items")
        .select("id, brand, model, category, created_at")
        .in("id", gearIds)
    : { data: [], error: null };

  assertQuerySucceeded(gearRowsError, "Could not load the gear catalog.");

  const activeGear = gearCategories.flatMap((category) => {
    const row = ((gearRows ?? []) as GearItemRow[]).find((item) => item.category === category);
    return row ? [rowToGearItem(row)] : [];
  });

  return {
    source: "real",
    profile: realProfile,
    settings: settings ?? null,
    player: buildRealPlayer(realProfile, settings ?? null, (gearRows ?? []) as GearItemRow[]),
    activeGear,
    isOwner: current.user?.id === realProfile.id,
  };
}

export async function getEditableProfileData(): Promise<EditableProfileData | null> {
  const supabase = await createClient();

  if (!supabase) {
    return null;
  }

  const { user, profile } = await getCurrentUserAndProfile(supabase);

  if (!user || !profile) {
    return null;
  }

  const [
    { data: settings, error: settingsError },
    { data: gearItems, error: gearItemsError },
    { data: activeGearRows, error: activeGearError },
  ] = await Promise.all([
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

  assertQuerySucceeded(settingsError, "Could not load your settings.");
  assertQuerySucceeded(gearItemsError, "Could not load the gear catalog.");
  assertQuerySucceeded(activeGearError, "Could not load your selected gear.");

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
