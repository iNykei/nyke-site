"use client";

import Link from "next/link";
import { useState } from "react";
import { AvatarMark } from "@/components/AvatarMark";
import { formatMemberNumber } from "@/lib/identity";
import type { PlayerProfile } from "@/types";

function StreamAvatar({ player, decorative }: { player: PlayerProfile; decorative: boolean }) {
  const [failed, setFailed] = useState(false);

  if (!player.avatarUrl || failed) {
    return <AvatarMark seed={player.avatarSeed} size="sm" />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={player.avatarUrl}
      alt={decorative ? "" : `@${player.username} avatar`}
      loading="lazy"
      decoding="async"
      className="size-8 shrink-0 rounded-full bg-zinc-100 object-cover"
      onError={() => setFailed(true)}
    />
  );
}

function ProfileStreamRow({ players, reverse = false, decorative = false }: { players: PlayerProfile[]; reverse?: boolean; decorative?: boolean }) {
  const items = reverse ? [...players].reverse() : players;

  return (
    <div
      className={`profile-stream-track flex w-max gap-3 ${reverse ? "profile-stream-track-reverse" : ""}`}
      aria-hidden={decorative || undefined}
    >
      {[...items, ...items, ...items].map((player, index) => {
        const isDuplicate = decorative || index >= items.length;
        const memberNumber = player.memberNumber === null ? null : formatMemberNumber(player.memberNumber);
        const isFounder = player.badges.some((badge) => badge.slug === "founder");

        return (
          <Link
            key={`${player.username}-${index}-${reverse ? "reverse" : "forward"}`}
            href={`/${player.username}`}
            tabIndex={isDuplicate ? -1 : undefined}
            aria-hidden={isDuplicate || undefined}
            className="inline-flex h-9 items-center gap-2 rounded-full border border-zinc-200 bg-white px-2 pr-3 text-xs font-medium text-zinc-600 shadow-sm shadow-zinc-200/40 transition duration-200 hover:border-rose-200 hover:text-zinc-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/70"
          >
            <StreamAvatar player={player} decorative={isDuplicate} />
            <span>@{player.username}</span>
            {memberNumber ? <span className="font-mono text-[9px] tabular-nums text-zinc-400">{memberNumber}</span> : null}
            {isFounder ? <span className="text-[9px] font-bold uppercase text-[#8a6038]">Founder</span> : null}
          </Link>
        );
      })}
    </div>
  );
}

export function ProfileStream({ players }: { players: PlayerProfile[] }) {
  if (players.length === 0) return null;

  return (
    <section
      className="profile-stream-mask -mx-4 overflow-hidden border-y border-zinc-200 bg-white py-5 sm:-mx-6 lg:-mx-8"
      aria-label="Players on NYKE"
    >
      <div className="space-y-3">
        <ProfileStreamRow players={players} />
        <ProfileStreamRow players={players} reverse decorative />
      </div>
    </section>
  );
}
