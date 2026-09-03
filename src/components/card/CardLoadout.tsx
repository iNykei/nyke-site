import type { GearItem } from "@/types";

type CardLoadoutProps = {
  activeGear: GearItem[];
};

const preferredCategories = ["mouse", "keyboard", "monitor"];

export function CardLoadout({ activeGear }: CardLoadoutProps) {
  const loadout = preferredCategories.flatMap((category) => {
    const item = activeGear.find((gear) => gear.category === category && !gear.id.startsWith("not-configured-"));
    return item ? [item] : [];
  });

  if (loadout.length === 0) {
    return (
      <section className="mx-9 flex min-h-[91px] items-center border-b border-zinc-300/80 py-4">
        <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-zinc-400">Loadout not configured</p>
      </section>
    );
  }

  return (
    <section className={`mx-9 grid min-h-[91px] border-b border-zinc-300/80 py-4 ${loadout.length === 1 ? "grid-cols-1" : loadout.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
      {loadout.map((item, index) => (
        <div key={item.id} className={`min-w-0 ${index > 0 ? "border-l border-zinc-300 pl-4" : "pr-4"}`}>
          <p className="text-[8px] font-bold uppercase tracking-[0.13em] text-zinc-400">{item.category}</p>
          <p className="mt-2 truncate text-[12px] font-semibold leading-tight text-zinc-900" title={`${item.maker} ${item.name}`}>
            {item.name}
          </p>
          <p className="mt-1 truncate text-[9px] text-zinc-500">{item.maker}</p>
        </div>
      ))}
    </section>
  );
}
