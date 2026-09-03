"use client";

import { useMemo, useState } from "react";
import { FilterBar } from "@/components/FilterBar";
import { PlayerCard } from "@/components/PlayerCard";
import { SearchBar } from "@/components/SearchBar";
import type { PlayerProfile } from "@/types";

const filters = ["All", "NA", "EU", "APAC", "CN", "KR", "Radiant", "Immortal"];

type ExploreClientProps = {
  players: PlayerProfile[];
};

export function ExploreClient({ players }: ExploreClientProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");

  const filteredPlayers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return players.filter((player) => {
      const matchesQuery =
        !normalizedQuery ||
        [player.displayName, player.username, player.bio, player.role, player.team, player.gear.mouse.name, player.gear.keyboard.name]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      const matchesFilter =
        filter === "All" ||
        player.region === filter ||
        player.settings.rank.toLowerCase().includes(filter.toLowerCase());

      return matchesQuery && matchesFilter;
    });
  }, [filter, players, query]);

  return (
    <>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-[30px] font-bold leading-9 text-zinc-950 sm:text-4xl sm:leading-10">Explore</h1>
        <div className="w-full sm:w-80">
          <SearchBar tone="light" value={query} onChange={setQuery} placeholder="Search players, roles, or gear..." />
        </div>
      </header>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-600">Players</h2>
          <span className="text-xs text-zinc-500">{filteredPlayers.length} shown</span>
        </div>
        <FilterBar tone="light" options={filters} active={filter} onChange={setFilter} />
        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {filteredPlayers.map((player) => (
            <PlayerCard key={player.username} player={player} />
          ))}
        </div>
        {filteredPlayers.length === 0 ? (
          <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-500">
            No players match this search.
          </div>
        ) : null}
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-600">Regions</h2>
          <span className="text-xs text-zinc-500">Browse all</span>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {["CN", "NA", "EU", "APAC"].map((region) => (
          <div key={region} className="h-[118px] rounded-xl border border-zinc-200 bg-white p-4">
            <p className="text-lg font-semibold text-zinc-950">{region}</p>
              <p className="mt-1 text-xs text-zinc-500">
                {players.filter((player) => player.region === region).length} players indexed
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
