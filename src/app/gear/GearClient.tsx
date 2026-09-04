"use client";

import { useMemo, useState } from "react";
import { FilterBar } from "@/components/FilterBar";
import { GearCard } from "@/components/GearCard";
import { SearchBar } from "@/components/SearchBar";
import type { GearCatalogItem } from "@/types";

const filters = ["All", "mouse", "mousepad", "keyboard", "headset", "monitor", "skates"];

type GearClientProps = {
  items: GearCatalogItem[];
};

export function GearClient({ items }: GearClientProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return items.filter((item) => {
      const matchesQuery =
        !normalizedQuery ||
        [item.name, item.maker, item.summary, item.category, ...Object.values(item.specs)]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      const matchesFilter = filter === "All" || item.category === filter;

      return matchesQuery && matchesFilter;
    });
  }, [filter, items, query]);

  return (
    <>
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <h1 className="text-[30px] font-bold leading-9 text-zinc-950 sm:text-4xl sm:leading-10">Gear</h1>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <FilterBar tone="light" options={filters} active={filter} onChange={setFilter} />
          <div className="w-full lg:w-64">
            <SearchBar tone="light" value={query} onChange={setQuery} placeholder="Search gear..." />
          </div>
        </div>
      </header>
      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {filteredItems.map((item) => (
          <GearCard key={item.id} item={item} profileCount={item.profileCount} />
        ))}
      </div>
      {items.length === 0 ? (
        <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-500">
          No gear yet.
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-500">
          No gear matches this search.
        </div>
      ) : null}
    </>
  );
}
