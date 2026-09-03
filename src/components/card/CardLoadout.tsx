import { Headphones, Keyboard, Monitor, Mouse, Square, type LucideIcon } from "lucide-react";
import type { GearItem } from "@/types";

const preferredCategories = ["mouse", "mousepad", "keyboard", "headset", "monitor", "skates"];

const categoryIcons: Record<string, LucideIcon> = {
  mouse: Mouse,
  mousepad: Square,
  keyboard: Keyboard,
  headset: Headphones,
  monitor: Monitor,
};

export function CardLoadout({ activeGear }: { activeGear: GearItem[] }) {
  const loadout = preferredCategories.flatMap((category) => {
    const item = activeGear.find((gear) => gear.category === category && !gear.id.startsWith("not-configured-"));
    return item ? [item] : [];
  }).slice(0, 4);

  if (loadout.length === 0) {
    return null;
  }

  const layoutClass = loadout.length === 1
    ? "grid-cols-[170px]"
    : `grid-cols-[170px_170px] ${loadout.length === 3 ? "[&>li:last-child]:col-span-2 [&>li:last-child]:justify-self-center" : ""}`;

  return (
    <ul aria-label="Active loadout" className={`relative z-10 grid justify-center gap-x-12 gap-y-5 text-left ${layoutClass}`}>
      {loadout.map((item) => {
        const Icon = categoryIcons[item.category] ?? Square;
        return (
          <li key={item.id} className="flex w-[170px] min-w-0 items-center gap-3">
            <Icon aria-hidden="true" className="size-4 shrink-0 stroke-[1.5] text-zinc-600" />
            <div className="min-w-0">
              <p className="truncate text-[9px] font-semibold uppercase tracking-[0.1em] text-zinc-500">{item.maker}</p>
              <p className="truncate text-[13px] font-semibold leading-tight text-zinc-950" title={`${item.maker} ${item.name}`}>{item.name}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
