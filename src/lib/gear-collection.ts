import type { GearCollectionItem, GearItem } from "@/types";
import type { PlayerGearRow } from "@/types/database";

export const gearCategoryPriority = ["mouse", "keyboard", "monitor", "mousepad", "headset", "skates"] as const;

export function sortGear<T extends GearItem>(items: T[]): T[] {
  return [...items].sort((a, b) =>
    gearCategoryPriority.indexOf(a.category) - gearCategoryPriority.indexOf(b.category) ||
    `${a.maker} ${a.name}`.localeCompare(`${b.maker} ${b.name}`),
  );
}

export function buildGearCollection(rows: PlayerGearRow[], items: GearItem[]): GearCollectionItem[] {
  const byId = new Map(items.map((item) => [item.id, item]));
  return sortGear(rows.map((row) => {
    const item = byId.get(row.gear_item_id);
    if (!item) throw new Error("A saved gear item could not be loaded.");
    return { ...item, collectionId: row.id, isActive: row.is_active };
  }));
}

export function getGearBrands(items: GearItem[], category: string) {
  return [...new Set(items.filter((item) => category === "All" || item.category === category).map((item) => item.maker))]
    .sort((a, b) => a.localeCompare(b));
}

export function filterGear<T extends GearItem>(items: T[], query: string, category: string, brand: string): T[] {
  const search = query.trim().toLowerCase();
  return items.filter((item) =>
    (category === "All" || item.category === category) &&
    (!brand || item.maker === brand) &&
    (!search || [item.maker, item.name, item.category, ...Object.values(item.specs)].join(" ").toLowerCase().includes(search)),
  );
}
