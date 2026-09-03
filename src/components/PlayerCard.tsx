import { Crosshair, Mouse, Radio } from "lucide-react";
import Link from "next/link";
import { calculateCm360, calculateEdpi, formatNumber } from "@/lib/calculations";
import type { PlayerProfile } from "@/types";
import { AvatarMark } from "./AvatarMark";

type PlayerCardProps = {
  player: PlayerProfile;
  tone?: "light" | "dark";
};

export function PlayerCard({ player, tone = "light" }: PlayerCardProps) {
  const edpi = calculateEdpi(player.settings.dpi, player.settings.sensitivity);
  const cm360 = calculateCm360(player.settings.dpi, player.settings.sensitivity);
  const isLight = tone === "light";

  return (
    <Link
      href={`/${player.username}`}
      className={`group block h-[260px] overflow-hidden rounded-xl border transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60 ${
        isLight
          ? "border-zinc-200 bg-white text-zinc-950 hover:border-zinc-300 hover:bg-zinc-50/40"
          : "border-zinc-700 bg-[#1b1b1f] text-zinc-100 hover:border-zinc-500 hover:bg-[#202024]"
      }`}
    >
      <div className={`h-[98px] ${isLight ? "bg-zinc-100" : "bg-zinc-800"}`}>
        <div className="h-full w-full opacity-80 [background-image:radial-gradient(circle_at_80%_15%,rgba(34,211,238,.20),transparent_24%),repeating-linear-gradient(135deg,rgba(0,0,0,.07)_0_1px,transparent_1px_7px)]" />
      </div>
      <div className="relative px-3 pb-3 pt-8 sm:px-4">
        <div className="absolute -top-8 left-4">
          <AvatarMark seed={player.avatarSeed} size="lg" />
        </div>
        <div className="absolute right-3 top-3">
          {player.status !== "offline" ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-violet-500 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
              <Radio size={10} />
              {player.status === "online" ? "live" : "scrim"}
            </span>
          ) : null}
        </div>
        <div className="min-w-0 pr-14">
          <h3 className={`truncate text-sm font-semibold leading-5 ${isLight ? "text-zinc-900" : "text-zinc-50"}`}>{player.displayName}</h3>
          <p className={`truncate text-[11px] leading-4 ${isLight ? "text-zinc-500" : "text-zinc-400"}`}>@{player.username}</p>
        </div>
        <p className={`mt-2 line-clamp-2 h-9 text-xs leading-[18px] ${isLight ? "text-zinc-600" : "text-zinc-400"}`}>
          {player.bio}
        </p>
        <div className={`mt-2 border-t pt-2 ${isLight ? "border-zinc-100" : "border-zinc-700"}`}>
          <div className={`flex items-center gap-1.5 text-[11px] leading-4 ${isLight ? "text-zinc-500" : "text-zinc-400"}`}>
            <Crosshair size={11} className={isLight ? "text-zinc-400" : "text-zinc-500"} />
            <span className="truncate">{player.settings.game}</span>
            <span>/</span>
            <span className="truncate font-medium text-current">{player.settings.rank}</span>
            <span>/</span>
            <span>{player.region}</span>
          </div>
          <div className={`mt-2 grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] leading-4 sm:grid-cols-4 ${isLight ? "text-zinc-500" : "text-zinc-400"}`}>
            <span>{player.settings.dpi ?? "--"} dpi</span>
            <span>{player.settings.sensitivity ?? "--"} sens</span>
            <span>{formatNumber(edpi, 0)} edpi</span>
            <span>{formatNumber(cm360, 1)} cm</span>
          </div>
          <div className={`mt-2 flex min-w-0 items-center gap-1 text-[11px] leading-4 ${isLight ? "text-zinc-500" : "text-zinc-400"}`}>
            <span className="inline-flex items-center gap-1">
              <Mouse size={11} />
              <span className="truncate">{player.gear.mouse.maker} {player.gear.mouse.name}</span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
