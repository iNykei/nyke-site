import type { PlayerProfile } from "@/types";
import { MediaImage } from "@/components/MediaImage";
import { BadgeIcon } from "@/components/profile/BadgeIcon";

const badgeTones: Record<string, string> = {
  founder: "text-[#8a6038]",
  "first-10": "text-rose-600",
  "early-100": "text-zinc-500",
  beta: "text-zinc-500",
};

export function CardIdentity({ player }: { player: PlayerProfile }) {
  const visibleBadges = player.badges.slice(0, 6);
  const hiddenCount = Math.max(0, player.badges.length - visibleBadges.length);

  return (
    <section className="relative z-10 shrink-0 px-8 pb-3 text-center">
      <div className="nyke-card-avatar absolute -top-[50px] left-1/2 ml-[-50px] size-[100px]">
        <svg aria-hidden="true" viewBox="0 0 102 102" className="absolute -inset-px size-[102px]" focusable="false">
          <circle cx="51" cy="51" r="50.5" fill="#ffffff" stroke="#e4e4e7" />
        </svg>
        <div className="absolute inset-1 overflow-hidden rounded-full bg-zinc-950">
          <MediaImage
            src={player.avatarUrl}
            alt={`${player.displayName} avatar`}
            crossOrigin="anonymous"
            className="size-full object-cover"
            fallback={<span className="grid size-full place-items-center font-serif text-[30px] font-black text-white">{player.avatarSeed}</span>}
          />
        </div>
      </div>

      <div className="mx-auto max-w-[430px] pt-[64px]">
        <h1 className="truncate font-serif text-[34px] font-black leading-none text-zinc-950">{player.displayName}</h1>
        <p className="mt-2 truncate font-mono text-[12px] font-medium leading-4 text-zinc-500">@{player.username}</p>
        {visibleBadges.length > 0 ? (
          <ul aria-label="NYKE identity badges" className="mt-3 flex max-h-9 flex-wrap justify-center gap-y-1 overflow-hidden text-[10px] font-bold uppercase leading-4">
            {visibleBadges.map((badge, index) => (
              <li key={badge.slug} className={`inline-flex items-center whitespace-nowrap ${badgeTones[badge.slug] ?? badgeTones["early-100"]}`}>
                {index > 0 ? <span className="mx-1.5 text-zinc-300">·</span> : null}
                <span className="inline-flex items-center gap-1"><BadgeIcon slug={badge.slug} size={12} />{badge.name}</span>
              </li>
            ))}
            {hiddenCount > 0 ? <li className="ml-1.5 text-zinc-500">+{hiddenCount}</li> : null}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
