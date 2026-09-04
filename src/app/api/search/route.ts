import { createClient } from "@/lib/supabase/server";
import type { GearItemRow, PlayerSettingsRow, ProfileRow } from "@/types/database";
import type { GearSearchResult, GlobalSearchResponse, PlayerSearchResult } from "@/types/search";

const emptyResults: GlobalSearchResponse = { players: [], gear: [] };

function normalized(value: unknown) {
  return typeof value === "string" ? value.trim().toLocaleLowerCase() : "";
}

function matchRank(query: string, values: unknown[]) {
  const searchable = values.map(normalized).filter(Boolean);
  if (searchable.some((value) => value === query)) return 0;
  if (searchable.some((value) => value.startsWith(query))) return 1;
  if (searchable.some((value) => value.includes(query))) return 2;
  return Number.POSITIVE_INFINITY;
}

function firstSpecValue(specs: Record<string, unknown> | null) {
  for (const value of Object.values(specs ?? {})) {
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }
  return null;
}

export async function GET(request: Request) {
  const query = normalized(new URL(request.url).searchParams.get("q")).slice(0, 80);

  if (query.length < 2) {
    return Response.json(emptyResults, { headers: { "Cache-Control": "no-store" } });
  }

  const supabase = await createClient();
  if (!supabase) {
    return Response.json({ error: "Search is unavailable right now." }, { status: 503 });
  }

  const [profilesResponse, settingsResponse, gearResponse] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, username, display_name, avatar_url, bio, region"),
    supabase
      .from("player_settings")
      .select("user_id, game, rank"),
    supabase
      .from("gear_items")
      .select("brand, model, category, image_url, specs"),
  ]);

  if (profilesResponse.error || settingsResponse.error || gearResponse.error) {
    return Response.json({ error: "Search is unavailable right now." }, { status: 503 });
  }

  const settingsByUser = new Map(
    ((settingsResponse.data ?? []) as Pick<PlayerSettingsRow, "user_id" | "game" | "rank">[])
      .map((settings) => [settings.user_id, settings]),
  );

  const players = ((profilesResponse.data ?? []) as Pick<ProfileRow, "id" | "username" | "display_name" | "avatar_url" | "bio" | "region">[])
    .map((profile) => {
      const settings = settingsByUser.get(profile.id);
      const rank = matchRank(query, [
        profile.username,
        profile.display_name,
        profile.bio,
        profile.region,
        settings?.game,
        settings?.rank,
      ]);
      const result: PlayerSearchResult = {
        username: profile.username,
        displayName: profile.display_name || profile.username,
        avatarUrl: profile.avatar_url,
        region: profile.region,
        game: settings?.game ?? null,
        rank: settings?.rank ?? null,
      };
      return { rank, result };
    })
    .filter(({ rank }) => Number.isFinite(rank))
    .sort((left, right) => left.rank - right.rank || left.result.username.localeCompare(right.result.username))
    .slice(0, 5)
    .map(({ result }) => result);

  const gear = ((gearResponse.data ?? []) as Pick<GearItemRow, "brand" | "model" | "category" | "image_url" | "specs">[])
    .map((item) => {
      const specValues = Object.values(item.specs ?? {});
      const rank = matchRank(query, [item.model, `${item.brand} ${item.model}`, item.brand, item.category, ...specValues]);
      const result: GearSearchResult = {
        brand: item.brand,
        model: item.model,
        category: item.category,
        imageUrl: item.image_url,
        spec: firstSpecValue(item.specs),
      };
      return { rank, result };
    })
    .filter(({ rank }) => Number.isFinite(rank))
    .sort((left, right) => left.rank - right.rank || `${left.result.brand} ${left.result.model}`.localeCompare(`${right.result.brand} ${right.result.model}`))
    .slice(0, 6)
    .map(({ result }) => result);

  return Response.json({ players, gear } satisfies GlobalSearchResponse, {
    headers: { "Cache-Control": "no-store" },
  });
}
