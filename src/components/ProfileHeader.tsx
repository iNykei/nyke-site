import type { PlayerProfile } from "@/types";
import { AvatarMark } from "./AvatarMark";
import { MediaImage } from "./MediaImage";
import { BadgeList } from "./profile/BadgeList";
import { MemberNumber } from "./profile/MemberNumber";
import { ProfileActions } from "./profile/ProfileActions";

type ProfileHeaderProps = { player: PlayerProfile; isOwner?: boolean };

export function ProfileHeader({ player, isOwner = false }: ProfileHeaderProps) {
  const metadata = [player.region, player.settings.game, player.settings.rank].filter(Boolean);

  return (
    <header className="profile-reveal nyke-surface-card overflow-hidden">
      <div className="relative aspect-[4/1] min-h-28 max-h-56 w-full overflow-hidden bg-zinc-100 sm:aspect-[5/1]">
        <MediaImage
          src={player.bannerUrl}
          alt={`${player.displayName} profile banner`}
          className="absolute inset-0 block h-full w-full max-w-none object-cover"
          fallback={<div className="profile-banner-fallback size-full" aria-hidden="true">
            <span className="profile-banner-lockup">
              <span className="profile-banner-wordmark">NYKE</span>
              <span className="profile-banner-dot">.</span>
            </span>
          </div>}
        />
      </div>
      <div className="relative px-4 pb-5 sm:px-7 sm:pb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:gap-5">
            <div className="-mt-10 size-24 shrink-0 overflow-hidden rounded-full border-4 border-white bg-zinc-950 shadow-sm ring-1 ring-zinc-200 sm:-mt-12 sm:size-28">
              <MediaImage
                src={player.avatarUrl}
                alt={`${player.displayName} avatar`}
                className="size-full object-cover"
                fallback={<AvatarMark seed={player.avatarSeed} size="xl" />}
              />
            </div>
            <div className="min-w-0 pb-1">
              <h1 className="break-words font-serif text-3xl font-black leading-none text-[var(--profile-text)] sm:text-4xl">{player.displayName}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-[var(--profile-muted)]">
                <span>@{player.username}</span>
                {metadata.map((item) => (
                  <span key={item} className="inline-flex items-center gap-2">
                    <span className="size-1 rounded-full bg-[var(--profile-accent)]" aria-hidden="true" />
                    {item}
                  </span>
                ))}
              </div>
              {player.memberNumber !== null || player.badges.length > 0 ? (
                <div className="mt-3 flex min-w-0 flex-col items-start gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3">
                  <MemberNumber value={player.memberNumber} />
                  <BadgeList badges={player.badges} />
                </div>
              ) : null}
            </div>
          </div>
          <div className="pb-1"><ProfileActions displayName={player.displayName} username={player.username} isOwner={isOwner} /></div>
        </div>
      </div>
      {player.bio || isOwner ? (
        <div className="border-t border-[var(--profile-border)] px-4 py-3 sm:px-7">
          <p className={`font-serif text-sm italic leading-6 ${player.bio ? "text-zinc-600" : "text-zinc-400"}`}>{player.bio || "Add a bio from Edit profile."}</p>
        </div>
      ) : null}
    </header>
  );
}
