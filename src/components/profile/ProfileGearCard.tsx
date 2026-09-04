import type { GearItem } from "@/types";
import { CircleDot, Footprints, Headphones, Keyboard, Monitor, Mouse, SquareDashed } from "lucide-react";

type ProfileGearCardProps = {
  compact?: boolean;
  item: GearItem;
};

function CategoryIcon({ category }: Pick<GearItem, "category">) {
  const className = "size-4 text-zinc-500";
  if (category === "mouse") return <Mouse className={className} aria-hidden="true" />;
  if (category === "keyboard") return <Keyboard className={className} aria-hidden="true" />;
  if (category === "monitor") return <Monitor className={className} aria-hidden="true" />;
  if (category === "headset") return <Headphones className={className} aria-hidden="true" />;
  if (category === "mousepad") return <SquareDashed className={className} aria-hidden="true" />;
  if (category === "skates") return <Footprints className={className} aria-hidden="true" />;
  return <CircleDot className={className} aria-hidden="true" />;
}

export function ProfileGearCard({ compact = false, item }: ProfileGearCardProps) {
  const metadata = Object.values(item.specs).filter(Boolean).slice(0, 3);

  if (!compact) {
    return (
      <article className="profile-gear-card group flex min-h-32 basis-full flex-col justify-between rounded-lg border border-zinc-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-lg hover:shadow-zinc-200/60 sm:basis-[calc(50%-0.5rem)] lg:basis-[calc(33.333%-0.667rem)] xl:basis-[calc(25%-0.75rem)]">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[10px] font-semibold uppercase text-zinc-500">{item.category}</p>
          <span className="size-1.5 rounded-full bg-lime-400/80 transition-transform duration-200 group-hover:scale-125" aria-hidden="true" />
        </div>
        <div className="mt-7 min-w-0">
          <h3 className="truncate text-[15px] font-semibold leading-5 text-zinc-950">{item.name}</h3>
          <p className="mt-1 truncate text-xs leading-5 text-zinc-500">{item.maker}</p>
        </div>
      </article>
    );
  }

  return (
    <article className="profile-gear-card group flex min-h-40 basis-full flex-col justify-between rounded-lg border border-zinc-200 bg-white p-5 shadow-[0_8px_24px_rgba(24,24,27,0.035)] transition duration-200 hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-[0_12px_28px_rgba(24,24,27,0.07)] sm:basis-[calc(50%-0.5rem)] lg:basis-[calc(25%-0.75rem)]">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <CategoryIcon category={item.category} />
          <p className="truncate text-[10px] font-semibold uppercase tracking-[0.08em] text-zinc-500">{item.category}</p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-2 py-1 text-[8px] font-bold uppercase tracking-[0.08em] text-rose-600"><span className="size-1 rounded-full bg-rose-400" />In use</span>
      </div>
      <div className="mt-8 min-w-0">
        <p className="truncate text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-400">{item.maker}</p>
        <h3 className="mt-1 truncate text-[15px] font-semibold leading-5 text-zinc-950">{item.name}</h3>
        {metadata.length > 0 ? <p className="mt-3 line-clamp-2 text-[10px] leading-4 text-zinc-500">{metadata.join(" · ")}</p> : null}
      </div>
    </article>
  );
}
