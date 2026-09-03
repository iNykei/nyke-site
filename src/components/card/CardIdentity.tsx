import { formatMemberNumber } from "@/lib/identity";
import type { PlayerProfile } from "@/types";

const badgeTones: Record<string, string> = {
  founder: "border-[#a58b5b] text-[#6b5734]",
  "first-10": "border-rose-300 text-rose-700",
  "early-100": "border-zinc-300 text-zinc-600",
  beta: "border-zinc-300 text-zinc-700",
};

export function CardIdentity({ player }: { player: PlayerProfile }) {
  const visibleBadges = player.badges.slice(0, 6);
  const hiddenCount = Math.max(0, player.badges.length - visibleBadges.length);

  return (
    <section className="relative z-10 h-[132px] px-8">
      <div className="nyke-card-avatar absolute -top-[57px] left-8 size-[116px] overflow-hidden rounded-full border-[5px] border-white bg-zinc-950 ring-1 ring-zinc-200">
        {player.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={player.avatarUrl} alt={`${player.displayName} avatar`} crossOrigin="anonymous" className="size-full object-cover" />
        ) : (
          <span className="grid size-full place-items-center font-serif text-[34px] font-black text-white">{player.avatarSeed}</span>
        )}
      </div>

      {player.memberNumber !== null ? (
        <div className="absolute right-8 top-0 -translate-y-1/2 rounded-md border border-zinc-200 bg-white px-4 py-2 text-right">
          <p className="text-[7px] font-bold uppercase tracking-[0.16em] text-zinc-400">NYKE member</p>
          <p className="mt-0.5 font-mono text-[17px] font-bold tabular-nums tracking-[0.04em] text-zinc-950">{formatMemberNumber(player.memberNumber)}</p>
        </div>
      ) : null}

      <div className="ml-[132px] min-w-0 pt-5 pr-1">
        <h1 className="truncate font-serif text-[34px] font-black leading-none text-zinc-950">{player.displayName}</h1>
        <p className="mt-1.5 truncate text-[11px] font-medium text-zinc-500">@{player.username}</p>
        {visibleBadges.length > 0 ? (
          <ul aria-label="NYKE identity badges" className="mt-3 flex max-h-[42px] flex-wrap gap-x-3 gap-y-1.5 overflow-hidden">
            {visibleBadges.map((badge) => (
              <li key={badge.slug} className={`inline-flex h-4 items-center border-l pl-1.5 text-[7px] font-bold uppercase tracking-[0.08em] ${badgeTones[badge.slug] ?? badgeTones["early-100"]}`}>
                {badge.name}
              </li>
            ))}
            {hiddenCount > 0 ? <li className="text-[8px] font-bold text-zinc-500">+{hiddenCount}</li> : null}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
