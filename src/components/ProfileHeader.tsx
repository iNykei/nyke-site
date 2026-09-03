import Link from "next/link";
import { ExternalLink, MoreHorizontal, Radio, Settings, UserPlus } from "lucide-react";
import type { PlayerProfile } from "@/types";
import { AvatarMark } from "./AvatarMark";

type ProfileHeaderProps = {
  player: PlayerProfile;
  isOwner?: boolean;
};

const actions = [Radio, ExternalLink, Settings, UserPlus, MoreHorizontal];

export function ProfileHeader({ player, isOwner = false }: ProfileHeaderProps) {
  return (
    <section id="home" className="overflow-hidden rounded-lg border border-zinc-700 bg-[#1b1b1f] shadow-2xl shadow-black/20">
      <div className="h-[190px] bg-zinc-100 sm:h-[240px]">
        <div className="h-full w-full opacity-85 [background-image:radial-gradient(circle_at_78%_16%,rgba(190,242,100,.16),transparent_24%),linear-gradient(135deg,rgba(255,255,255,.10),rgba(244,114,182,.12)),repeating-linear-gradient(135deg,rgba(0,0,0,.07)_0_1px,transparent_1px_8px)]" />
      </div>
      <div className="relative bg-[#1b1b1f]/95 px-4 pb-4 pt-8 sm:px-5">
        <div className="absolute -top-12 left-5">
          <div className="rounded-full border-4 border-[#1b1b1f]">
            {player.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={player.avatarUrl}
                alt=""
                className="size-24 rounded-full object-cover"
              />
            ) : (
              <AvatarMark seed={player.avatarSeed} size="xl" />
            )}
          </div>
        </div>
        <div className="flex flex-col gap-4 pt-12 sm:ml-28 sm:flex-row sm:items-start sm:justify-between sm:pt-0">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold leading-[25px] text-zinc-50">{player.displayName}</h1>
              <span className="rounded-full bg-lime-300/15 px-1.5 py-0.5 text-[10px] font-bold text-lime-200">
                {player.settings.rank}
              </span>
            </div>
            <p className="mt-1 text-xs leading-5 text-zinc-300">
              @{player.username} / {player.region} / {player.role} / {player.settings.game} / {player.status}
            </p>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">{player.bio}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {isOwner ? (
              <Link
                href="/settings/profile"
                className="inline-flex h-9 items-center rounded-md border border-rose-300/40 bg-rose-300/10 px-3 text-xs font-semibold text-rose-100 transition duration-200 hover:border-rose-200 hover:bg-rose-300/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/40"
              >
                Edit profile
              </Link>
            ) : null}
            {actions.map((Icon, index) => (
              <button
                key={index}
                type="button"
                className="grid size-9 place-items-center rounded-md border border-zinc-600 bg-zinc-800 text-zinc-300 transition duration-200 hover:border-rose-300/40 hover:bg-zinc-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/40"
                aria-label={`Profile action ${index + 1}`}
              >
                <Icon size={15} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
