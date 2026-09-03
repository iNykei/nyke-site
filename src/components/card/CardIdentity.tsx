import { formatMemberNumber } from "@/lib/identity";
import type { PlayerProfile } from "@/types";

type CardIdentityProps = {
  player: PlayerProfile;
};

const badgeTones: Record<string, string> = {
  founder: "border-[#b69a68]/70 bg-[#f5ead4] text-[#5f4a25]",
  "first-10": "border-rose-300 bg-rose-50 text-rose-800",
  "early-100": "border-stone-300 bg-[#f5f1e9] text-stone-700",
  beta: "border-zinc-300 bg-zinc-100/80 text-zinc-700",
};

export function CardIdentity({ player }: CardIdentityProps) {
  const visibleBadges = player.badges.slice(0, 6);
  const hiddenCount = Math.max(0, player.badges.length - visibleBadges.length);

  return (
    <section className="relative z-10 flex min-h-[146px] gap-5 px-9 pb-5">
      <div className="nyke-card-avatar -mt-11 size-[104px] shrink-0 overflow-hidden rounded-full border-[5px] border-[#f8f3ea] bg-zinc-900 shadow-[0_10px_30px_rgba(39,39,42,0.15)]">
        {player.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={player.avatarUrl} alt={`${player.displayName} avatar`} crossOrigin="anonymous" className="size-full object-cover" />
        ) : (
          <span className="grid size-full place-items-center font-serif text-[31px] font-black text-[#fffaf1]">
            {player.avatarSeed}
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1 pt-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="truncate font-serif text-[34px] font-black leading-[0.98] text-zinc-950">{player.displayName}</h1>
            <p className="mt-1.5 truncate text-[12px] font-medium text-zinc-500">@{player.username}</p>
          </div>
          {player.memberNumber !== null ? (
            <div className="nyke-card-depth shrink-0 text-right">
              <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-zinc-400">Member</p>
              <p className="mt-1 font-mono text-[14px] font-semibold tabular-nums text-zinc-800">
                {formatMemberNumber(player.memberNumber)}
              </p>
            </div>
          ) : null}
        </div>

        {visibleBadges.length > 0 ? (
          <ul aria-label="NYKE identity badges" className="mt-3 flex max-h-[48px] flex-wrap gap-1.5 overflow-hidden">
            {visibleBadges.map((badge) => (
              <li
                key={badge.slug}
                className={`nyke-card-depth inline-flex h-[21px] items-center rounded-sm border px-2 text-[8px] font-bold uppercase leading-none ${badgeTones[badge.slug] ?? badgeTones["early-100"]}`}
              >
                {badge.name}
              </li>
            ))}
            {hiddenCount > 0 ? (
              <li className="inline-flex h-[21px] items-center rounded-sm border border-zinc-300 px-2 text-[8px] font-bold text-zinc-600">
                +{hiddenCount}
              </li>
            ) : null}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
