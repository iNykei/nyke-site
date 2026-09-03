import type { GearItem } from "@/types";

const preferredCategories = ["mouse", "keyboard", "monitor"];

export function CardLoadout({ activeGear }: { activeGear: GearItem[] }) {
  const loadout = preferredCategories.flatMap((category) => {
    const item = activeGear.find((gear) => gear.category === category && !gear.id.startsWith("not-configured-"));
    return item ? [item] : [];
  });

  return (
    <section className="relative z-10 mx-8 h-[92px] border-t border-zinc-200 py-4">
      {loadout.length > 0 ? (
        <div className={`grid h-full items-start gap-6 ${loadout.length === 1 ? "grid-cols-1" : loadout.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
          {loadout.map((item) => (
            <div key={item.id} className="min-w-0">
              <p className="text-[7px] font-bold uppercase tracking-[0.14em] text-rose-500">{item.category}</p>
              <p className="mt-2 truncate text-[12px] font-semibold leading-none text-zinc-950" title={`${item.maker} ${item.name}`}>{item.name}</p>
              <p className="mt-1.5 truncate text-[8px] text-zinc-500">{item.maker}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex h-full items-center"><p className="text-[9px] text-zinc-400">No published loadout</p></div>
      )}
    </section>
  );
}
