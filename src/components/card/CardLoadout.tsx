import type { GearItem } from "@/types";

const preferredCategories = ["mouse", "keyboard", "monitor"];

export function CardLoadout({ activeGear }: { activeGear: GearItem[] }) {
  const loadout = preferredCategories.flatMap((category) => {
    const item = activeGear.find((gear) => gear.category === category && !gear.id.startsWith("not-configured-"));
    return item ? [item] : [];
  });

  if (loadout.length === 0) {
    return null;
  }

  return (
    <ul aria-label="Active loadout" className="relative z-10 flex max-w-[470px] flex-nowrap justify-center gap-4 text-center">
      {loadout.map((item) => (
        <li key={item.id} className="w-[140px] min-w-0 flex-none">
          <p className="text-[9px] font-bold uppercase tracking-[0.13em] text-rose-500">{item.category}</p>
          <p className="mt-1 truncate text-[16px] font-semibold leading-tight text-zinc-950" title={`${item.maker} ${item.name}`}>{item.name}</p>
        </li>
      ))}
    </ul>
  );
}
