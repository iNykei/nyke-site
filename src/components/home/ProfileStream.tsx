import { Check } from "lucide-react";
import Link from "next/link";
import { AvatarMark } from "@/components/AvatarMark";
import { players } from "@/lib/mock-data";

const streamHandles = players.slice(0, 14).map((player) => ({
  href: player.username,
  label: player.username,
  seed: player.avatarSeed,
  active: player.status !== "offline",
  founder: player.username === "cyx",
  source: "demo" as const,
}));

function ProfileStreamRow({ reverse = false }: { reverse?: boolean }) {
  const items = reverse ? [...streamHandles].reverse() : streamHandles;

  return (
    <div className={`profile-stream-track flex w-max gap-3 ${reverse ? "profile-stream-track-reverse" : ""}`}>
      {[...items, ...items, ...items].map((item, index) => (
        <Link
          key={`${item.href}-${index}-${reverse ? "reverse" : "forward"}`}
          href={`/${item.href}`}
          className="inline-flex h-8 items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 pr-4 text-xs font-medium text-zinc-600 shadow-sm shadow-zinc-200/40 transition duration-200 hover:border-rose-200 hover:text-zinc-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/70"
          data-source={item.source}
        >
          <AvatarMark seed={item.seed} size="sm" />
          <span>{item.label}</span>
          {item.founder ? (
            <span className="rounded-full bg-rose-100 px-1.5 py-0.5 text-[9px] font-bold text-rose-500">first</span>
          ) : item.active ? (
            <span className="grid size-4 place-items-center rounded-full bg-lime-400 text-zinc-950">
              <Check size={10} strokeWidth={3} />
            </span>
          ) : null}
        </Link>
      ))}
    </div>
  );
}

export function ProfileStream() {
  return (
    <section className="profile-stream-mask -mx-4 overflow-hidden border-y border-zinc-200 bg-white py-5 sm:-mx-6 lg:-mx-8">
      <div className="space-y-3">
        <ProfileStreamRow />
        <ProfileStreamRow reverse />
      </div>
    </section>
  );
}
