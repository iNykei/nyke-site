import type { ProfileBadge } from "@/types";
import { BadgeIcon } from "./BadgeIcon";

type BadgeListProps = {
  badges: ProfileBadge[];
};

const badgeTones: Record<string, string> = {
  founder: "border-amber-300/80 bg-amber-50 text-amber-950",
  "first-10": "border-rose-300/80 bg-rose-50 text-rose-800",
  "early-100": "border-zinc-300 bg-white text-zinc-700",
  beta: "border-stone-300 bg-stone-100/70 text-stone-700",
};

export function BadgeList({ badges }: BadgeListProps) {
  if (badges.length === 0) {
    return null;
  }

  return (
    <ul aria-label="NYKE identity badges" className="flex flex-wrap gap-1.5">
      {badges.map((badge) => (
        <li
          key={badge.slug}
          title={badge.description}
          className={`inline-flex min-h-6 items-center gap-1 rounded-sm border px-2 py-1 text-[10px] font-semibold uppercase leading-none ${badgeTones[badge.slug] ?? badgeTones["early-100"]}`}
        >
          <BadgeIcon slug={badge.slug} size={12} />
          {badge.name}
        </li>
      ))}
    </ul>
  );
}
