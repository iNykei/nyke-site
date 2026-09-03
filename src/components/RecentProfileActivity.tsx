import { ArrowRight, Radio } from "lucide-react";
import Link from "next/link";
import { getPlayerByUsername } from "@/lib/mock-data";
import type { ProfileActivity } from "@/types";
import { AvatarMark } from "./AvatarMark";

type RecentProfileActivityProps = {
  activities: ProfileActivity[];
};

export function RecentProfileActivity({ activities }: RecentProfileActivityProps) {
  const rows = activities
    .map((activity) => {
      const player = getPlayerByUsername(activity.username);
      return player ? { activity, player } : null;
    })
    .filter(Boolean);

  const featured = rows.slice(0, 3);
  const streamRows = rows.slice(3, 15);

  return (
    <section className="mx-auto w-full max-w-5xl px-0 pb-20 sm:px-6">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-semibold leading-10 text-zinc-950 sm:text-4xl">Happening right now.</h2>
        <p className="mt-2 text-sm text-zinc-500">Recent setup changes and active profiles from the NYKE index.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="space-y-3">
          {featured.map((row, index) => {
            if (!row) {
              return null;
            }

            const { activity, player } = row;

            return (
              <Link
                key={activity.id}
                href={`/${player.username}`}
                className="group block overflow-hidden rounded-xl border border-zinc-200 bg-white transition duration-200 hover:border-zinc-300 hover:bg-zinc-50/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60"
              >
                <div className="h-[74px] bg-zinc-100">
                  <div className="h-full opacity-80 [background-image:radial-gradient(circle_at_82%_18%,rgba(34,211,238,.20),transparent_26%),repeating-linear-gradient(135deg,rgba(0,0,0,.06)_0_1px,transparent_1px_7px)]" />
                </div>
                <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-3">
                  <AvatarMark seed={player.avatarSeed} size="md" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold leading-5 text-zinc-950">@{player.username}</p>
                    <p className="truncate text-xs leading-5 text-zinc-500">
                      {activity.activity} / {player.settings.rank} / {player.region}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-violet-500 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                    {index === 0 ? <Radio size={10} /> : null}
                    {activity.relativeTime}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        <article className="rounded-xl border border-zinc-200 bg-white px-4 py-3">
          <div className="flex h-9 items-center justify-between border-b border-zinc-100">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-600">Profile activity</h3>
            <Link href="/explore" className="inline-flex items-center gap-1 text-xs text-zinc-500 transition hover:text-zinc-950">
              Explore
              <ArrowRight size={12} />
            </Link>
          </div>
          <div className="activity-mask mt-1 max-h-[294px] overflow-hidden">
            <div className="activity-scroll divide-y divide-zinc-100 hover:[animation-play-state:paused] focus-within:[animation-play-state:paused] motion-reduce:animate-none">
              {[...streamRows, ...streamRows].map((row, index) => {
                if (!row) {
                  return null;
                }

                const { activity, player } = row;

                return (
                  <Link
                    key={`${activity.id}-${index}`}
                    href={`/${player.username}`}
                    className="grid grid-cols-[auto_1fr_auto] items-center gap-3 py-2.5 transition duration-150 hover:bg-zinc-50 focus:outline-none focus-visible:bg-cyan-50"
                  >
                    <AvatarMark seed={player.avatarSeed} size="sm" />
                    <div className="min-w-0">
                      <p className="truncate text-sm leading-5 text-zinc-700">
                        <span className="font-semibold text-zinc-950">@{player.username}</span> {activity.activity}
                      </p>
                      <p className="truncate text-xs leading-4 text-zinc-400">
                        {player.settings.game} / {player.settings.rank} / {player.region}
                      </p>
                    </div>
                    <time className="text-xs text-zinc-400">{activity.relativeTime}</time>
                  </Link>
                );
              })}
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
