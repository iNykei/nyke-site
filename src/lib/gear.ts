import { createClient } from "@/lib/supabase/server";
import { gearItems, getGearProfileCounts } from "@/lib/mock-data";
import type { GearCatalogItem, GearItem } from "@/types";
import type { GearItemRow, PlayerGearRow } from "@/types/database";

export const gearItemColumns = "id, brand, model, category, image_url, specs, source_url, created_at";
const categoryOrder = ["mouse", "keyboard", "mousepad", "monitor", "headset", "skates"];

function normalizeSpecs(specs: Record<string, unknown> | null | undefined) {
  return Object.fromEntries(
    Object.entries(specs ?? {}).flatMap(([key, value]) => {
      if (typeof value === "string" && value.trim()) return [[key, value.trim()]];
      if (typeof value === "number" || typeof value === "boolean") return [[key, String(value)]];
      return [];
    }),
  );
}

export function mapGearItemRow(row: GearItemRow): GearItem {
  return {
    id: row.id,
    name: row.model,
    maker: row.brand,
    category: row.category as GearItem["category"],
    summary: `${row.brand} ${row.model}`,
    accent: "from-zinc-100 to-zinc-200",
    specs: normalizeSpecs(row.specs),
    imageUrl: row.image_url || undefined,
    sourceUrl: row.source_url || undefined,
  };
}

function getDevelopmentCatalog(): GearCatalogItem[] {
  const counts = getGearProfileCounts();
  return gearItems.map((item) => ({ ...item, profileCount: counts.get(item.id) ?? 0 }));
}

export async function getGearCatalog(): Promise<GearCatalogItem[]> {
  const supabase = await createClient();

  if (!supabase) {
    if (process.env.NODE_ENV === "development") return getDevelopmentCatalog();
    throw new Error("Gear catalog data is unavailable.");
  }

  const [catalogResponse, usageResponse] = await Promise.all([
    supabase
      .from("gear_items")
      .select(gearItemColumns)
      .order("category")
      .order("brand")
      .order("model"),
    supabase
      .from("player_gear")
      .select("user_id, gear_item_id")
      .eq("is_active", true),
  ]);

  if (catalogResponse.error) {
    throw new Error("Could not load the gear catalog.", { cause: catalogResponse.error });
  }

  if (usageResponse.error) {
    throw new Error("Could not load gear usage.", { cause: usageResponse.error });
  }

  const usersByGear = new Map<string, Set<string>>();
  for (const row of (usageResponse.data ?? []) as Pick<PlayerGearRow, "user_id" | "gear_item_id">[]) {
    const users = usersByGear.get(row.gear_item_id) ?? new Set<string>();
    users.add(row.user_id);
    usersByGear.set(row.gear_item_id, users);
  }

  return ((catalogResponse.data ?? []) as GearItemRow[])
    .map((row) => ({
      ...mapGearItemRow(row),
      profileCount: usersByGear.get(row.id)?.size ?? 0,
    }))
    .sort((a, b) => {
      const categoryDifference = categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category);
      if (categoryDifference !== 0) return categoryDifference;
      return `${a.maker} ${a.name}`.localeCompare(`${b.maker} ${b.name}`);
    });
}
