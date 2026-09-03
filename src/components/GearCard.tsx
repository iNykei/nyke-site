import { Star } from "lucide-react";
import type { GearItem } from "@/types";

type GearCardProps = {
  item: GearItem;
  compact?: boolean;
  tone?: "light" | "dark";
  profileCount?: number;
};

export function GearCard({ item, compact = false, tone = "light", profileCount }: GearCardProps) {
  const isLight = tone === "light";
  const count = profileCount ?? Number(item.specs.users ?? 0);

  return (
    <article
      className={`group h-[277px] overflow-hidden rounded-xl border transition duration-200 ${
        isLight
          ? "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50/40"
          : "border-zinc-700 bg-[#1b1b1f] hover:border-zinc-500 hover:bg-[#202024]"
      }`}
    >
      <div className={`grid ${compact ? "h-[116px]" : "h-[128px]"} place-items-center ${isLight ? "bg-zinc-50" : "bg-[#202024]"}`}>
        <div
          className={`h-[70px] w-[116px] rounded-md border ${isLight ? "border-zinc-200" : "border-zinc-700"} bg-gradient-to-br ${item.accent} opacity-75 shadow-sm transition group-hover:opacity-90`}
        />
      </div>
      <div className="px-3 py-3 sm:px-4">
        <p className={`text-[11px] uppercase leading-4 ${isLight ? "text-zinc-500" : "text-zinc-400"}`}>{item.category}</p>
        <h3 className={`mt-1 truncate text-sm font-semibold leading-5 ${isLight ? "text-zinc-950" : "text-zinc-50"}`}>{item.name}</h3>
        <p className={`mt-1 truncate text-xs ${isLight ? "text-zinc-500" : "text-zinc-400"}`}>{item.maker}</p>
        <div className="mt-2 flex flex-wrap gap-1">
          {Object.values(item.specs)
            .slice(0, 2)
            .map((value) => (
              <span
                key={value}
                className={`rounded border px-1.5 py-0.5 text-[10px] ${isLight ? "border-zinc-200 text-zinc-500" : "border-zinc-700 text-zinc-400"}`}
              >
                {value}
              </span>
            ))}
        </div>
        <div className={`mt-3 flex items-center gap-1 text-xs ${isLight ? "text-zinc-600" : "text-zinc-300"}`}>
          {Array.from({ length: 5 }).map((_, index) => (
            <Star key={index} size={13} className="fill-rose-300 text-rose-300" />
          ))}
          <span className="ml-1">4.{(item.id.length % 5) + 5}</span>
        </div>
        <p className={`mt-2 text-xs ${isLight ? "text-zinc-600" : "text-zinc-400"}`}>{count} profiles</p>
      </div>
    </article>
  );
}
