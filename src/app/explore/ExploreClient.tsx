"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FilterBar } from "@/components/FilterBar";
import { PlayerCard } from "@/components/PlayerCard";
import { SearchBar } from "@/components/SearchBar";
import type { PlayerProfile } from "@/types";

const filters = ["All", "NA", "EU", "APAC", "CN", "KR", "Radiant", "Immortal"];
const coreRegions = ["CN", "NA", "EU", "APAC", "KR"];

function isConfiguredGear(id: string) {
  return !id.startsWith("not-configured-");
}

type ExploreClientProps = {
  players: PlayerProfile[];
};

export function ExploreClient({ players }: ExploreClientProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");

  const filteredPlayers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return players.filter((player) => {
      const searchableGear = Object.values(player.gear)
        .filter((item) => isConfiguredGear(item.id))
        .flatMap((item) => [item.maker, item.name]);
      const matchesQuery =
        !normalizedQuery ||
        [
          player.displayName,
          player.username,
          player.bio,
          player.region,
          player.settings.game,
          player.settings.rank,
          ...searchableGear,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      const matchesFilter =
        filter === "All" ||
        player.region.trim().toUpperCase() === filter.toUpperCase() ||
        player.settings.rank.trim().toLowerCase().includes(filter.toLowerCase());

      return matchesQuery && matchesFilter;
    });
  }, [filter, players, query]);

  const regionStats = useMemo(() => {
    const counts = new Map<string, number>();

    players.forEach((player) => {
      const region = player.region.trim().toUpperCase();
      if (!region) return;
      counts.set(region, (counts.get(region) ?? 0) + 1);
    });

    const extraRegions = [...counts.keys()]
      .filter((region) => !coreRegions.includes(region))
      .sort((a, b) => a.localeCompare(b));

    return [...coreRegions, ...extraRegions]
      .filter((region) => counts.has(region))
      .map((region) => ({ region, count: counts.get(region) ?? 0 }));
  }, [players]);

  return (
    <>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-[30px] font-bold leading-9 text-zinc-950 sm:text-4xl sm:leading-10">Explore</h1>
        <div className="w-full sm:w-80">
          <SearchBar tone="light" value={query} onChange={setQuery} placeholder="Search players, games, or gear..." />
        </div>
      </header>

      {players.length === 0 ? (
        <section className="mt-8 rounded-xl border border-zinc-200 bg-white px-6 py-12 text-center">
          <h2 className="text-base font-semibold text-zinc-950">No players yet.</h2>
          <p className="mt-2 text-sm text-zinc-500">Create the first public player profile on NYKE.</p>
          <Link href="/settings/profile" className="mt-5 inline-flex h-9 items-center rounded-md bg-rose-400 px-4 text-sm font-semibold text-zinc-950 transition hover:bg-rose-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/60">
            Create your profile
          </Link>
        </section>
      ) : (
        <>
          <section className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-600">Players</h2>
              <span className="text-xs text-zinc-500">{filteredPlayers.length} shown</span>
            </div>
            <FilterBar tone="light" options={filters} active={filter} onChange={setFilter} />
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {filteredPlayers.map((player) => (
                <PlayerCard key={player.username} player={player} showMemberNumber />
              ))}
            </div>
            {filteredPlayers.length === 0 ? (
              <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-500">
                No players match this search.
              </div>
            ) : null}
          </section>

          {regionStats.length > 0 ? (
            <section className="mt-8">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-600">Regions</h2>
                <span className="text-xs text-zinc-500">{regionStats.length} indexed</span>
              </div>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {regionStats.map(({ region, count }) => (
                  <div key={region} className="h-[118px] rounded-xl border border-zinc-200 bg-white p-4">
                    <p className="text-lg font-semibold text-zinc-950">{region}</p>
                    <p className="mt-1 text-xs text-zinc-500">{count} {count === 1 ? "player" : "players"} indexed</p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </>
      )}
    </>
  );
}
