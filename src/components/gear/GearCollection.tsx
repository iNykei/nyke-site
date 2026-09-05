"use client";

import { useState } from "react";
import { GearCard } from "@/components/GearCard";
import { filterGear } from "@/lib/gear-collection";
import type { GearCollectionItem } from "@/types";
import { ActiveGearMark } from "./ActiveGearMark";
import { GearFilters, initialGearFilters } from "./GearFilters";

export function GearCollection({ items }: { items: GearCollectionItem[] }) {
  const [filters, setFilters] = useState(initialGearFilters);
  const filtered = filterGear(items, filters.query, filters.category, filters.brand);
  if (items.length === 0) return <p className="py-6 text-center text-sm text-zinc-500">This player hasn&apos;t added any gear yet.</p>;

  return (
    <>
      <GearFilters items={items} value={filters} onChange={setFilters} searchLabel="Search this collection..." />
      <p className="mt-4 text-xs text-zinc-500" aria-live="polite">{filtered.length} gear shown</p>
      <div className="mt-5 grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-4">
        {filtered.map((item) => <GearCard key={item.collectionId} item={item} compact status={item.isActive ? <ActiveGearMark /> : undefined} />)}
      </div>
      {filtered.length === 0 ? <p className="py-8 text-center text-sm text-zinc-500">No gear matches this search.</p> : null}
    </>
  );
}
