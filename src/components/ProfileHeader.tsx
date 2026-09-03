import type { PlayerProfile } from "@/types";
import { AvatarMark } from "./AvatarMark";
import { ProfileActions } from "./profile/ProfileActions";

type ProfileHeaderProps = {
  player: PlayerProfile;
  isOwner?: boolean;
};

export function ProfileHeader({ player, isOwner = false }: ProfileHeaderProps) {
  const metadata = [player.settings.game, player.settings.rank, player.region].filter(Boolean);

  return (
    <section id="home" className="profile-reveal border-b border-zinc-200 pb-10 pt-4 sm:pb-14 sm:pt-8">
      <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-col gap-6 sm:flex-row sm:items-start">
          <div className="group/avatar size-24 shrink-0 overflow-hidden rounded-full border-4 border-white bg-zinc-950 shadow-lg shadow-zinc-300/60 ring-1 ring-zinc-200 transition duration-200 hover:ring-rose-300/70">
            {player.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={player.avatarUrl} alt="" className="size-full rounded-full object-cover" />
            ) : (
              <AvatarMark seed={player.avatarSeed} size="xl" />
            )}
          </div>
          <div className="min-w-0 pt-1">
            <p className="text-xs font-medium text-zinc-500">@{player.username}</p>
            <h1 className="mt-1 break-words font-serif text-4xl font-black leading-[1.05] text-zinc-950 sm:text-5xl">
              {player.displayName}
            </h1>
            {metadata.length > 0 ? (
              <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-zinc-600">
                {metadata.map((item, index) => (
                  <span key={`${item}-${index}`} className="inline-flex items-center gap-2">
                    {index > 0 ? <span className="size-1 rounded-full bg-rose-300" aria-hidden="true" /> : null}
                    {item}
                  </span>
                ))}
              </div>
            ) : null}
            {player.bio ? <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-600 sm:text-[15px]">{player.bio}</p> : null}
          </div>
        </div>
        <ProfileActions displayName={player.displayName} isOwner={isOwner} />
      </div>
    </section>
  );
}
