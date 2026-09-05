import type { ProfileBadge } from "@/types";
import { BadgeIcon } from "./BadgeIcon";

export function ProfileBadgeCollection({ badges }: { badges: ProfileBadge[] }) {
  if (badges.length === 0) {
    return <p className="text-center text-sm text-[var(--profile-muted)]">No badges yet.</p>;
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="NYKE badges and identity achievements">
      {badges.map((badge) => (
        <li key={badge.slug} className="nyke-surface-card nyke-surface-card--item flex min-w-0 gap-3 p-4">
          <div className="min-w-0 pt-0.5">
            <h3 className="flex items-center gap-1 text-sm font-semibold text-zinc-950"><BadgeIcon slug={badge.slug} /><span>{badge.name}</span></h3>
            {badge.description ? <p className="mt-1 text-[11px] leading-4 text-zinc-500">{badge.description}</p> : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
