"use client";

import { ChevronDown } from "lucide-react";
import { FilterBar } from "@/components/FilterBar";
import { SearchBar } from "@/components/SearchBar";
import { gearCategoryPriority, getGearBrands } from "@/lib/gear-collection";
import type { GearItem } from "@/types";

export type GearFilterState = { query: string; category: string; brand: string };
export const initialGearFilters: GearFilterState = { query: "", category: "All", brand: "" };

export function GearFilters({ items, value, onChange, searchLabel }: {
  items: GearItem[];
  value: GearFilterState;
  onChange: (value: GearFilterState) => void;
  searchLabel: string;
}) {
  const brands = getGearBrands(items, value.category);
  const categoryLabels = ["All", ...gearCategoryPriority.map((category) => category[0].toUpperCase() + category.slice(1))];
  const categoryLabel = value.category[0].toUpperCase() + value.category.slice(1);

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_200px]">
        <SearchBar tone="light" value={value.query} onChange={(query) => onChange({ ...value, query })} placeholder={searchLabel} />
        <label className="relative min-w-0">
          <span className="sr-only">Filter by brand</span>
          <select value={brands.includes(value.brand) ? value.brand : ""} onChange={(event) => onChange({ ...value, brand: event.target.value })} className="h-9 w-full appearance-none rounded-md border border-zinc-200 bg-white pl-3 pr-8 text-xs text-zinc-700 focus:outline-2 focus:outline-rose-300">
            <option value="">All brands</option>
            {brands.map((brand) => <option key={brand} value={brand}>{brand}</option>)}
          </select>
          <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400" aria-hidden="true" />
        </label>
      </div>
      <FilterBar tone="light" options={categoryLabels} active={categoryLabel} onChange={(label) => {
        const category = label === "All" ? "All" : label.toLowerCase();
        const brand = getGearBrands(items, category).includes(value.brand) ? value.brand : "";
        onChange({ ...value, category, brand });
      }} />
    </div>
  );
}
