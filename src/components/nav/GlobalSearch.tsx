"use client";

import { CircleDot, Footprints, Headphones, Keyboard, Monitor, Mouse, Search, SquareDashed, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { AvatarMark } from "@/components/AvatarMark";
import type { GearSearchResult, GlobalSearchResponse, PlayerSearchResult } from "@/types/search";

type GlobalSearchProps = {
  onClose: () => void;
};

type SearchItem =
  | { kind: "player"; key: string; href: string; player: PlayerSearchResult }
  | { kind: "gear"; key: string; href: string; gear: GearSearchResult };

function GearIcon({ category }: { category: string }) {
  const className = "size-5 stroke-[1.5]";
  if (category === "mouse") return <Mouse className={className} aria-hidden="true" />;
  if (category === "keyboard") return <Keyboard className={className} aria-hidden="true" />;
  if (category === "monitor") return <Monitor className={className} aria-hidden="true" />;
  if (category === "headset") return <Headphones className={className} aria-hidden="true" />;
  if (category === "mousepad") return <SquareDashed className={className} aria-hidden="true" />;
  if (category === "skates") return <Footprints className={className} aria-hidden="true" />;
  return <CircleDot className={className} aria-hidden="true" />;
}

function PlayerAvatar({ player }: { player: PlayerSearchResult }) {
  const [failed, setFailed] = useState(false);

  if (!player.avatarUrl || failed) {
    return (
      <span className="overflow-hidden rounded-full">
        <AvatarMark seed={player.displayName.slice(0, 2).toUpperCase()} size="md" />
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={player.avatarUrl}
      alt=""
      className="size-11 shrink-0 rounded-full bg-zinc-100 object-cover"
      onError={() => setFailed(true)}
    />
  );
}

function GearThumb({ item }: { item: GearSearchResult }) {
  const [failed, setFailed] = useState(false);

  if (!item.imageUrl || failed) {
    return (
      <span className="grid size-11 shrink-0 place-items-center rounded-md bg-zinc-100 text-zinc-500">
        <GearIcon category={item.category} />
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={item.imageUrl}
      alt=""
      className="size-11 shrink-0 rounded-md bg-zinc-50 object-contain p-1.5"
      onError={() => setFailed(true)}
    />
  );
}

export function GlobalSearch({ onClose }: GlobalSearchProps) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GlobalSearchResponse>({ players: [], gear: [] });
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [activeIndex, setActiveIndex] = useState(-1);
  const normalizedQuery = query.trim();

  const items = useMemo<SearchItem[]>(() => [
    ...results.players.map((player) => ({
      kind: "player" as const,
      key: `player-${player.username}`,
      href: `/${player.username}`,
      player,
    })),
    ...results.gear.map((gear) => ({
      kind: "gear" as const,
      key: `gear-${gear.category}-${gear.brand}-${gear.model}`,
      href: `/gear?search=${encodeURIComponent(`${gear.brand} ${gear.model}`)}`,
      gear,
    })),
  ], [results]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => inputRef.current?.focus());
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    if (normalizedQuery.length < 2) return;

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(normalizedQuery.slice(0, 80))}`, {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!response.ok) throw new Error("Search request failed");
        const data = await response.json() as GlobalSearchResponse;
        if (controller.signal.aborted) return;
        setResults(data);
        setStatus("ready");
        setActiveIndex(data.players.length + data.gear.length > 0 ? 0 : -1);
      } catch (error) {
        if (controller.signal.aborted || (error instanceof DOMException && error.name === "AbortError")) return;
        setStatus("error");
      }
    }, 180);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [normalizedQuery]);

  function handleQueryChange(value: string) {
    const nextQuery = value.slice(0, 80);
    setQuery(nextQuery);
    setResults({ players: [], gear: [] });
    setActiveIndex(-1);
    setStatus(nextQuery.trim().length >= 2 ? "loading" : "idle");
  }

  function navigateTo(href: string) {
    onClose();
    router.push(href);
  }

  function openItem(item: SearchItem) {
    navigateTo(item.href);
  }

  function handleKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }

    if (event.key === "ArrowDown" && items.length > 0) {
      event.preventDefault();
      setActiveIndex((current) => current < 0 ? 0 : (current + 1) % items.length);
      return;
    }

    if (event.key === "ArrowUp" && items.length > 0) {
      event.preventDefault();
      setActiveIndex((current) => current <= 0 ? items.length - 1 : current - 1);
      return;
    }

    if (event.key === "Enter" && activeIndex >= 0 && items[activeIndex]) {
      event.preventDefault();
      openItem(items[activeIndex]);
      return;
    }

    if (event.key === "Tab" && dialogRef.current) {
      const focusable = [...dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )];
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-zinc-950/10 px-3 pt-[10vh] sm:px-4 sm:pt-[14vh]" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="global-search-title"
        className="w-full max-w-[600px] overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-[0_18px_55px_rgba(24,24,27,0.16),0_3px_12px_rgba(24,24,27,0.08)]"
        onKeyDown={handleKeyDown}
      >
        <h2 id="global-search-title" className="sr-only">Search NYKE</h2>
        <div className="flex h-14 items-center gap-3 border-b border-zinc-200 px-4">
          <Search className="size-4 shrink-0 text-zinc-400" aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => handleQueryChange(event.target.value)}
            placeholder="Search players or gear..."
            aria-label="Search players or gear"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded="true"
            aria-controls="global-search-results"
            aria-activedescendant={activeIndex >= 0 ? `global-search-result-${activeIndex}` : undefined}
            autoComplete="off"
            className="h-full min-w-0 flex-1 bg-transparent text-sm text-zinc-950 outline-none placeholder:text-zinc-400"
          />
          <button
            type="button"
            onClick={onClose}
            className="grid size-8 shrink-0 place-items-center rounded-md text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/70"
            aria-label="Close search"
          >
            <X size={16} />
          </button>
        </div>

        <div id="global-search-results" className="max-h-[min(62vh,560px)] overflow-y-auto p-2" role="listbox" aria-label="Search results">
          {normalizedQuery.length < 2 ? (
            <p className="px-3 py-8 text-center text-sm text-zinc-500">Type at least 2 characters to search.</p>
          ) : status === "loading" ? (
            <p className="px-3 py-8 text-center text-sm text-zinc-500">Searching...</p>
          ) : status === "error" ? (
            <div className="px-3 py-8 text-center">
              <p className="text-sm text-zinc-600">Search is unavailable right now.</p>
              <p className="mt-1 text-xs text-zinc-400">You can still browse Explore and Gear.</p>
            </div>
          ) : status === "ready" && items.length === 0 ? (
            <div className="px-3 py-8 text-center">
              <p className="text-sm text-zinc-600">No players or gear found.</p>
              <div className="mt-4 flex justify-center gap-4 text-xs font-medium">
                <button type="button" onClick={() => navigateTo("/explore")} className="text-zinc-500 hover:text-zinc-950">Explore players</button>
                <button type="button" onClick={() => navigateTo("/gear")} className="text-zinc-500 hover:text-zinc-950">Browse gear</button>
              </div>
            </div>
          ) : (
            <>
              {results.players.length > 0 ? (
                <section role="group" aria-labelledby="player-results-heading">
                  <h3 id="player-results-heading" className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase text-zinc-400">Players</h3>
                  {results.players.map((player, index) => {
                    const metadata = [player.region, player.game, player.rank].filter(Boolean).join(" · ");
                    return (
                      <button
                        id={`global-search-result-${index}`}
                        key={player.username}
                        type="button"
                        role="option"
                        aria-selected={activeIndex === index}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => openItem(items[index])}
                        className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition ${activeIndex === index ? "bg-rose-50" : "hover:bg-zinc-50"}`}
                      >
                        <PlayerAvatar player={player} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-zinc-950">{player.displayName}</span>
                          <span className="block truncate text-xs text-zinc-500">@{player.username}{metadata ? ` · ${metadata}` : ""}</span>
                        </span>
                      </button>
                    );
                  })}
                </section>
              ) : null}

              {results.gear.length > 0 ? (
                <section role="group" className={results.players.length > 0 ? "mt-2 border-t border-zinc-100 pt-2" : ""} aria-labelledby="gear-results-heading">
                  <h3 id="gear-results-heading" className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase text-zinc-400">Gear</h3>
                  {results.gear.map((gear, gearIndex) => {
                    const index = results.players.length + gearIndex;
                    return (
                      <button
                        id={`global-search-result-${index}`}
                        key={`${gear.category}-${gear.brand}-${gear.model}`}
                        type="button"
                        role="option"
                        aria-selected={activeIndex === index}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => openItem(items[index])}
                        className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition ${activeIndex === index ? "bg-rose-50" : "hover:bg-zinc-50"}`}
                      >
                        <GearThumb item={gear} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[10px] font-semibold uppercase text-zinc-400">{gear.brand}</span>
                          <span className="block truncate text-sm font-semibold text-zinc-950">{gear.model}</span>
                          <span className="block truncate text-xs capitalize text-zinc-500">{gear.category}{gear.spec ? ` · ${gear.spec}` : ""}</span>
                        </span>
                      </button>
                    );
                  })}
                </section>
              ) : null}
            </>
          )}
        </div>

        {normalizedQuery.length >= 2 && status !== "error" ? (
          <div className="flex items-center justify-between border-t border-zinc-100 px-4 py-2.5 text-[11px] text-zinc-400">
            <span>Use ↑ ↓ to navigate · Enter to open</span>
            <span>Esc to close</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
