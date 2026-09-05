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
    : `grid-cols-[170px_170px] ${loadout.length === 3 ? "[&>li:last-child]:col-span-2" : ""}`;

  return (
    <ul aria-label="Active loadout" className={`relative z-10 grid shrink-0 justify-center gap-x-10 gap-y-6 text-left ${layoutClass}`}>
      {loadout.map((item, index) => {
        const Icon = categoryIcons[item.category] ?? Square;
        const isCentered = loadout.length === 1 || (loadout.length === 3 && index === 2);
        return (
          <li
            key={item.id}
            className={`grid w-[170px] min-w-0 grid-cols-[16px_minmax(0,1fr)] items-center gap-3.5 ${isCentered ? "justify-self-center" : ""}`}
          >
            <Icon aria-hidden="true" className="size-4 stroke-[1.5] text-zinc-600" />
            <div className="min-w-0">
              <p className="truncate text-[9px] font-medium uppercase leading-3 text-zinc-500">{item.maker}</p>
              <p className="truncate text-[14px] font-semibold leading-5 text-zinc-950" title={`${item.maker} ${item.name}`}>{item.name}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
