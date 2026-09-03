import type { TrendingGearItem } from "@/types";

type TrendingGearProps = {
  items: TrendingGearItem[];
};

export function TrendingGear({ items }: TrendingGearProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <article key={item.id} className="border border-white/10 bg-[#101115] p-4">
          <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-600">{item.category}</p>
          <div className="mt-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold text-zinc-50">{item.name}</h3>
              <p className="mt-1 text-sm text-zinc-500">{item.maker}</p>
            </div>
            <span className="shrink-0 text-sm font-semibold text-zinc-200">{item.profileCount}</span>
          </div>
          <div className="mt-4 h-px bg-white/10" />
          <p className="mt-3 text-xs text-zinc-500">{item.profileCount} linked profiles</p>
        </article>
      ))}
    </div>
  );
}
