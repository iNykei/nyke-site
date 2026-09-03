import type { GearItem } from "@/types";

type ProfileGearCardProps = {
  item: GearItem;
};

export function ProfileGearCard({ item }: ProfileGearCardProps) {
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
