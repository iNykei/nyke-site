import { cache } from "react";
import { gearItemColumns, mapGearItemRow } from "@/lib/gear";
import { createClient } from "@/lib/supabase/server";
import { getPlayerByUsername, players } from "@/lib/mock-data";
import type { GearItem, PlayerGear, PlayerProfile, ProfileBadge } from "@/types";
import type { BadgeRow, GearItemRow, PlayerGearRow, PlayerSettingsRow, ProfileBadgeRow, ProfileRow } from "@/types/database";

const gearCategories = ["mouse", "mousepad", "keyboard", "monitor", "headset", "skates"] as const;
const identityProfileColumns = "id, username, display_name, avatar_url, banner_url, member_number, bio, region, created_at, updated_at";
const profileColumns = "id, username, display_name, avatar_url, banner_url, bio, region, created_at, updated_at";
const legacyProfileColumns = "id, username, display_name, avatar_url, bio, region, created_at, updated_at";
type ServerSupabaseClient = NonNullable<Awaited<ReturnType<typeof createClient>>>;

function assertQuerySucceeded(error: { message: string } | null, message: string) {
  if (error) {
    throw new Error(message, { cause: error });
  }
}

function isMissingColumn(error: { code?: string; message: string } | null, column: string) {
  return Boolean(
    error &&
      error.message.includes(column) &&
      (error.code === "42703" || error.code === "PGRST204"),
  );
}

async function queryProfile(
  supabase: ServerSupabaseClient,
  column: "id" | "username",
  value: string,
) {
  const identityResponse = await supabase.from("profiles").select(identityProfileColumns).eq(column, value).maybeSingle();

  if (!identityResponse.error) {
    return { data: identityResponse.data as ProfileRow | null, error: null };
  }

  if (!isMissingColumn(identityResponse.error, "member_number") && !isMissingColumn(identityResponse.error, "banner_url")) {
    return { data: null, error: identityResponse.error };
  }

  const response = await supabase.from("profiles").select(profileColumns).eq(column, value).maybeSingle();

  if (!response.error) {
    return {
      data: response.data ? ({ ...response.data, member_number: null } as ProfileRow) : null,
      error: null,
    };
  }

  if (!isMissingColumn(response.error, "banner_url")) {
    return { data: null, error: response.error };
  }

  const legacyResponse = await supabase.from("profiles").select(legacyProfileColumns).eq(column, value).maybeSingle();

  return {
    data: legacyResponse.data ? ({ ...legacyResponse.data, banner_url: null, member_number: null } as ProfileRow) : null,
    error: legacyResponse.error,
  };
}

async function queryProfiles(supabase: ServerSupabaseClient) {
  const identityResponse = await supabase
    .from("profiles")
    .select(identityProfileColumns)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false });

  if (!identityResponse.error) {
    return { data: (identityResponse.data ?? []) as ProfileRow[], error: null };
  }

  if (!isMissingColumn(identityResponse.error, "member_number") && !isMissingColumn(identityResponse.error, "banner_url")) {
    return { data: [] as ProfileRow[], error: identityResponse.error };
  }

  const response = await supabase
    .from("profiles")
    .select(profileColumns)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false });

  if (!response.error) {
    return {
      data: (response.data ?? []).map((row) => ({ ...row, member_number: null }) as ProfileRow),
      error: null,
    };
  }

  if (!isMissingColumn(response.error, "banner_url")) {
    return { data: [] as ProfileRow[], error: response.error };
  }

  const legacyResponse = await supabase
    .from("profiles")
    .select(legacyProfileColumns)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false });

  return {
    data: (legacyResponse.data ?? []).map((row) => ({ ...row, banner_url: null, member_number: null }) as ProfileRow),
    error: legacyResponse.error,
  };
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

function rowToProfileBadge(row: BadgeRow): ProfileBadge {
  return {
    slug: row.slug,
    name: row.name,
    description: row.description || undefined,
  };
}

function buildGear(rows: GearItemRow[]): PlayerGear {
  const byCategory = new Map(rows.map((row) => [row.category, mapGearItemRow(row)]));

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

function buildRealPlayer(
  profile: ProfileRow,
  settings: PlayerSettingsRow | null,
  gearRows: GearItemRow[],
  badges: ProfileBadge[],
): PlayerProfile {
  return {
    username: profile.username,
    displayName: profile.display_name || profile.username,
    memberNumber: profile.member_number,
    badges,
    avatarUrl: profile.avatar_url || undefined,
    bannerUrl: profile.banner_url || undefined,
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

export async function getExploreProfiles(): Promise<PlayerProfile[]> {
  const supabase = await createClient();

  if (!supabase) {
    if (process.env.NODE_ENV === "development") {
      return getDemoProfiles();
    }

    throw new Error("Explore data is unavailable.");
  }

  const { data: profiles, error: profilesError } = await queryProfiles(supabase);

  assertQuerySucceeded(profilesError, "Could not load Explore profiles.");

  if (profiles.length === 0) {
    return [];
  }

  const profileIds = profiles.map((profile) => profile.id);
  const [settingsResponse, playerGearResponse] = await Promise.all([
    supabase
      .from("player_settings")
      .select("id, user_id, game, rank, dpi, sensitivity, resolution, polling_rate, created_at, updated_at")
      .in("user_id", profileIds),
    supabase
      .from("player_gear")
      .select("id, user_id, gear_item_id, category, is_active, created_at")
      .in("user_id", profileIds)
      .eq("is_active", true),
  ]);

  assertQuerySucceeded(settingsResponse.error, "Could not load Explore player settings.");
  assertQuerySucceeded(playerGearResponse.error, "Could not load Explore player gear.");

  const settingsRows = (settingsResponse.data ?? []) as PlayerSettingsRow[];
  const playerGearRows = (playerGearResponse.data ?? []) as PlayerGearRow[];
  const gearIds = [...new Set(playerGearRows.map((row) => row.gear_item_id))];
  const gearResponse = gearIds.length
    ? await supabase
        .from("gear_items")
        .select(gearItemColumns)
        .in("id", gearIds)
    : { data: [] as GearItemRow[], error: null };

  assertQuerySucceeded(gearResponse.error, "Could not load the Explore gear catalog.");

  const settingsByUser = new Map(settingsRows.map((row) => [row.user_id, row]));
  const gearById = new Map(((gearResponse.data ?? []) as GearItemRow[]).map((row) => [row.id, row]));
  const gearByUser = new Map<string, GearItemRow[]>();

  playerGearRows.forEach((row) => {
    const gearItem = gearById.get(row.gear_item_id);
    if (!gearItem) return;
    const current = gearByUser.get(row.user_id) ?? [];
    current.push(gearItem);
    gearByUser.set(row.user_id, current);
  });

  return profiles.map((profile) =>
    buildRealPlayer(
      profile,
      settingsByUser.get(profile.id) ?? null,
      gearByUser.get(profile.id) ?? [],
      [],
    ),
  );
}

export async function getProfileByUsername(username: string): Promise<ProfileRow | null> {
  const supabase = await createClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await queryProfile(supabase, "username", username.toLowerCase());

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

  const { data: profile, error: profileError } = await queryProfile(supabase, "id", user.id);

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
    queryProfile(supabase, "username", username.toLowerCase()),
    getCurrentUserAndProfile(supabase),
  ]);

  assertQuerySucceeded(realProfileError, "Could not load the public profile.");

  if (!realProfile) {
    return demoPlayer
      ? { source: "demo", profile: null, settings: null, player: demoPlayer, activeGear: getActiveGear(demoPlayer.gear), isOwner: false }
      : null;
  }

  const profileBadgesPromise = realProfile.member_number === null
    ? Promise.resolve({ data: [] as ProfileBadgeRow[], error: null })
    : supabase
        .from("profile_badges")
        .select("profile_id, badge_id, awarded_at")
        .eq("profile_id", realProfile.id);

  const [
    { data: settings, error: settingsError },
    { data: playerGear, error: playerGearError },
    { data: profileBadges, error: profileBadgesError },
  ] = await Promise.all([
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
    profileBadgesPromise,
  ]);

  assertQuerySucceeded(settingsError, "Could not load the player's settings.");
  assertQuerySucceeded(playerGearError, "Could not load the player's gear.");
  assertQuerySucceeded(profileBadgesError, "Could not load the player's badges.");

  const gearIds = ((playerGear ?? []) as PlayerGearRow[]).map((row) => row.gear_item_id);
  const badgeIds = ((profileBadges ?? []) as ProfileBadgeRow[]).map((row) => row.badge_id);
  const [
    { data: gearRows, error: gearRowsError },
    { data: badgeRows, error: badgeRowsError },
  ] = await Promise.all([
    gearIds.length
      ? supabase
          .from("gear_items")
          .select(gearItemColumns)
          .in("id", gearIds)
      : Promise.resolve({ data: [] as GearItemRow[], error: null }),
    badgeIds.length
      ? supabase
          .from("badges")
          .select("id, slug, name, description, display_order, created_at")
          .in("id", badgeIds)
          .order("display_order", { ascending: true })
      : Promise.resolve({ data: [] as BadgeRow[], error: null }),
  ]);

  assertQuerySucceeded(gearRowsError, "Could not load the gear catalog.");
  assertQuerySucceeded(badgeRowsError, "Could not load badge definitions.");

  const activeGear = gearCategories.flatMap((category) => {
    const row = ((gearRows ?? []) as GearItemRow[]).find((item) => item.category === category);
    return row ? [mapGearItemRow(row)] : [];
  });
  const badges = ((badgeRows ?? []) as BadgeRow[]).map(rowToProfileBadge);

  return {
    source: "real",
    profile: realProfile,
    settings: settings ?? null,
    player: buildRealPlayer(realProfile, settings ?? null, (gearRows ?? []) as GearItemRow[], badges),
    activeGear,
    isOwner: current.user?.id === realProfile.id,
  };
}

export const getCachedPublicProfileData = cache(getPublicProfileData);

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
      .select(gearItemColumns)
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
