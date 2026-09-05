"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { FilterBar } from "@/components/FilterBar";
import { GearCard } from "@/components/GearCard";
import { SearchBar } from "@/components/SearchBar";
import type { GearCatalogItem } from "@/types";

const filters = ["All", "mouse", "keyboard", "mousepad", "monitor", "headset", "skates"];

type GearClientProps = {
  items: GearCatalogItem[];
  initialSearch?: string;
};

export function GearClient({ items, initialSearch = "" }: GearClientProps) {
  const [query, setQuery] = useState(initialSearch);
  const [filter, setFilter] = useState("All");
  const [brand, setBrand] = useState("All brands");

  const brandOptions = useMemo(() => {
    const categoryItems = filter === "All" ? items : items.filter((item) => item.category === filter);
    const brands = [...new Set(categoryItems.map((item) => item.maker))].sort((left, right) =>
      left.localeCompare(right),
    );

    return ["All brands", ...brands];
  }, [filter, items]);

  function handleFilterChange(nextFilter: string) {
    setFilter(nextFilter);
    if (brand === "All brands") return;

    const nextCategoryHasBrand = items.some(
      (item) => (nextFilter === "All" || item.category === nextFilter) && item.maker === brand,
    );
    if (!nextCategoryHasBrand) setBrand("All brands");
  }

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
      const matchesBrand = brand === "All brands" || item.maker === brand;

      return matchesQuery && matchesFilter && matchesBrand;
    });
  }, [brand, filter, items, query]);

  return (
    <>
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <h1 className="text-[30px] font-bold leading-9 text-zinc-950 sm:text-4xl sm:leading-10">Gear</h1>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <FilterBar tone="light" options={filters} active={filter} onChange={handleFilterChange} />
          <label className="relative block min-w-0 lg:w-44">
            <span className="sr-only">Filter by brand</span>
            <select
              value={brandOptions.includes(brand) ? brand : "All brands"}
              onChange={(event) => setBrand(event.target.value)}
              className="h-10 w-full appearance-none rounded-md border border-zinc-200 bg-white px-3 pr-8 text-sm text-zinc-700 outline-none transition-colors hover:border-zinc-300 focus:border-coral focus:ring-2 focus:ring-coral/15"
            >
              {brandOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
          </label>
          <div className="w-full lg:w-64">
            <SearchBar tone="light" value={query} onChange={setQuery} placeholder="Search gear..." />
          </div>
        </div>
      </header>
      <p className="mt-5 text-xs font-medium uppercase text-zinc-500">
        {filteredItems.length} gear shown
      </p>
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
