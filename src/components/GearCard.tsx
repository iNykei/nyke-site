"use client";

import Image from "next/image";
import { CircleDot, Footprints, Headphones, Keyboard, Monitor, Mouse, SquareDashed } from "lucide-react";
import { useState, type ReactNode } from "react";
import type { GearItem } from "@/types";

type GearCardProps = {
  item: GearItem;
  compact?: boolean;
  tone?: "light" | "dark";
  profileCount?: number;
  status?: ReactNode;
  actions?: ReactNode;
};

const specPriority: Record<GearItem["category"], string[]> = {
  mouse: ["weight", "polling_rate", "sensor"],
  keyboard: ["layout", "switch_type", "polling_rate"],
  mousepad: ["surface", "size", "thickness"],
  monitor: ["refresh_rate", "resolution", "panel"],
  headset: ["connection", "battery_life", "weight"],
  skates: ["material", "format", "style"],
};

function CategoryIcon({ category, className }: Pick<GearItem, "category"> & { className: string }) {
  if (category === "mouse") return <Mouse className={className} aria-hidden="true" />;
  if (category === "keyboard") return <Keyboard className={className} aria-hidden="true" />;
  if (category === "monitor") return <Monitor className={className} aria-hidden="true" />;
  if (category === "headset") return <Headphones className={className} aria-hidden="true" />;
  if (category === "mousepad") return <SquareDashed className={className} aria-hidden="true" />;
  if (category === "skates") return <Footprints className={className} aria-hidden="true" />;
  return <CircleDot className={className} aria-hidden="true" />;
}

function getVisibleSpecs(item: GearItem) {
  const priority = specPriority[item.category];
  return Object.entries(item.specs)
    .filter(([, value]) => Boolean(value?.trim()))
    .sort(([a], [b]) => {
      const aIndex = priority.indexOf(a);
      const bIndex = priority.indexOf(b);
      return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex);
    })
    .slice(0, 2);
}

export function GearCard({ item, compact = false, tone = "light", profileCount, status, actions }: GearCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const isLight = tone === "light";
  const specs = getVisibleSpecs(item);
  const hasImage = Boolean(item.imageUrl && !imageFailed);
  const count = profileCount ?? 0;

  return (
    <article
      className={`group flex h-full min-h-[276px] flex-col overflow-hidden rounded-lg border transition duration-200 ${
        isLight
          ? "nyke-surface-card nyke-surface-card--item nyke-surface-card--interactive border-zinc-200 bg-white"
          : "border-zinc-700 bg-[#1b1b1f] hover:border-zinc-500"
      }`}
    >
      <div className={`relative grid ${compact ? "h-[116px]" : "h-[140px]"} shrink-0 place-items-center overflow-hidden ${isLight ? "bg-zinc-50" : "bg-[#202024]"}`}>
        {hasImage ? (
          <Image
            src={item.imageUrl!}
            alt={`${item.maker} ${item.name}`}
            fill
            sizes="(max-width: 767px) 50vw, (max-width: 1023px) 50vw, 25vw"
            className="object-contain p-4 transition duration-200 group-hover:scale-[1.015]"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className={`flex flex-col items-center gap-2 ${isLight ? "text-zinc-400" : "text-zinc-500"}`}>
            <CategoryIcon category={item.category} className="size-7 stroke-[1.25]" />
            <span className="font-serif text-sm font-semibold italic">NYKE<span className="text-rose-400">.</span></span>
          </div>
        )}
        {status ? <div className="absolute right-2 top-2">{status}</div> : null}
      </div>

      <div className="flex flex-1 flex-col px-3 py-3 sm:px-4 sm:py-4">
        <p className={`text-[10px] font-semibold uppercase leading-4 tracking-[0.08em] ${isLight ? "text-zinc-500" : "text-zinc-400"}`}>{item.category}</p>
        <h3 className={`mt-1 line-clamp-2 text-sm font-semibold leading-5 ${isLight ? "text-zinc-950" : "text-zinc-50"}`}>{item.name}</h3>
        <p className={`mt-1 truncate text-xs ${isLight ? "text-zinc-500" : "text-zinc-400"}`}>{item.maker}</p>

        {specs.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1">
            {specs.map(([key, value]) => (
              <span
                key={key}
                className={`rounded border px-1.5 py-0.5 text-[10px] ${isLight ? "border-zinc-200 text-zinc-500" : "border-zinc-700 text-zinc-400"}`}
              >
                {value}
              </span>
            ))}
          </div>
        ) : null}

        {count > 0 ? (
          <p className={`mt-auto pt-3 text-xs ${isLight ? "text-zinc-600" : "text-zinc-400"}`}>
            {count.toLocaleString()} {count === 1 ? "profile" : "profiles"}
          </p>
        ) : null}
      </div>
      {actions ? <div className="border-t border-zinc-100 px-3 py-3 sm:px-4">{actions}</div> : null}
    </article>
  );
}
