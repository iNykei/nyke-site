import type { GearItem } from "@/types";

const preferredCategories = ["mouse", "keyboard", "monitor"];

export function CardLoadout({ activeGear, prominent = false }: { activeGear: GearItem[]; prominent?: boolean }) {
  const loadout = preferredCategories.flatMap((category) => {
    const item = activeGear.find((gear) => gear.category === category && !gear.id.startsWith("not-configured-"));
    return item ? [item] : [];
  });

  if (loadout.length === 0) {
    return null;
  }

  return (
    <section className={`relative z-10 mx-8 border-t border-zinc-200 ${prominent ? "flex-none py-6" : "flex-1 py-4"}`}>
      <div className={`grid w-full items-start gap-6 ${loadout.length === 1 ? "grid-cols-1" : loadout.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
        {loadout.map((item) => (
          <div key={item.id} className="min-w-0">
            <p className="text-[7px] font-bold uppercase tracking-[0.14em] text-rose-500">{item.category}</p>
            <p className={`truncate font-semibold leading-none text-zinc-950 ${prominent ? "mt-3 text-[15px]" : "mt-2 text-[12px]"}`} title={`${item.maker} ${item.name}`}>{item.name}</p>
            <p className={`truncate text-zinc-500 ${prominent ? "mt-2 text-[9px]" : "mt-1.5 text-[8px]"}`}>{item.maker}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
