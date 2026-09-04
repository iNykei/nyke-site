import { Crown, FlaskConical, Gem } from "lucide-react";
import type { ProfileBadge } from "@/types";

function BadgeMark({ slug }: { slug: string }) {
  if (slug === "founder") return <Crown size={17} aria-hidden="true" />;
  if (slug === "first-10") return <span aria-hidden="true" className="font-mono text-xs font-black">10</span>;
  if (slug === "early-100") return <span aria-hidden="true" className="font-mono text-[10px] font-black">100</span>;
  if (slug === "beta") return <FlaskConical size={16} aria-hidden="true" />;
  return <Gem size={16} aria-hidden="true" />;
}

const markTone: Record<string, string> = {
  founder: "border-amber-200 bg-amber-50 text-amber-800",
  "first-10": "border-rose-200 bg-rose-50 text-rose-600",
  "early-100": "border-zinc-200 bg-zinc-100 text-zinc-600",
  beta: "border-stone-200 bg-stone-100 text-stone-600",
};

export function ProfileBadgeCollection({ badges }: { badges: ProfileBadge[] }) {
  if (badges.length === 0) {
    return <p className="text-center text-sm text-[var(--profile-muted)]">No badges yet.</p>;
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="NYKE badges and identity achievements">
      {badges.map((badge) => (
        <li key={badge.slug} className="nyke-surface-card nyke-surface-card--item flex min-w-0 gap-3 p-4">
          <span className={`grid size-9 shrink-0 place-items-center rounded-md border ${markTone[badge.slug] ?? markTone["early-100"]}`}><BadgeMark slug={badge.slug} /></span>
          <div className="min-w-0 pt-0.5">
            <h3 className="text-sm font-semibold text-zinc-950">{badge.name}</h3>
            {badge.description ? <p className="mt-1 text-[11px] leading-4 text-zinc-500">{badge.description}</p> : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
