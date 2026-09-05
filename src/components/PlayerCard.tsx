import { Crosshair, Mouse, Radio } from "lucide-react";
import Link from "next/link";
import { calculateCm360, calculateEdpi, formatNumber } from "@/lib/calculations";
import { formatMemberNumber } from "@/lib/identity";
import type { PlayerProfile } from "@/types";
import { AvatarMark } from "./AvatarMark";

type PlayerCardProps = {
  player: PlayerProfile;
  tone?: "light" | "dark";
  showMemberNumber?: boolean;
};

export function PlayerCard({ player, tone = "light", showMemberNumber = false }: PlayerCardProps) {
  const edpi = calculateEdpi(player.settings.dpi, player.settings.sensitivity);
  const cm360 = calculateCm360(player.settings.dpi, player.settings.sensitivity);
  const isLight = tone === "light";
  const metadata = [player.settings.game, player.settings.rank, player.region].map((value) => value.trim()).filter(Boolean);
  const aimValues = [
    player.settings.dpi && player.settings.dpi > 0 ? `${player.settings.dpi} dpi` : null,
    player.settings.sensitivity && player.settings.sensitivity > 0
      ? `${showMemberNumber ? formatNumber(player.settings.sensitivity, 3) : player.settings.sensitivity} sens`
      : null,
    edpi !== null ? `${formatNumber(edpi, 0)} edpi` : null,
    cm360 !== null ? `${formatNumber(cm360, 1)} cm` : null,
  ].filter((value): value is string => Boolean(value));
  const mouse = player.gear.mouse.id.startsWith("not-configured-") ? null : player.gear.mouse;
  const memberNumber = showMemberNumber && player.memberNumber !== null ? formatMemberNumber(player.memberNumber) : null;
  const hasStatus = player.status !== "offline";

  return (
    <Link
      href={`/${player.username}`}
      className={`group block overflow-hidden rounded-xl border transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/60 ${showMemberNumber ? "h-[282px] sm:h-[260px]" : "h-[260px]"} ${
        isLight
          ? `border-zinc-200 bg-white text-zinc-950 hover:border-zinc-300 hover:bg-zinc-50/40 ${showMemberNumber ? "hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(24,24,27,0.06)]" : ""}`
          : "border-zinc-700 bg-[#1b1b1f] text-zinc-100 hover:border-zinc-500 hover:bg-[#202024]"
      }`}
    >
      <div className={`h-[98px] overflow-hidden ${isLight ? "bg-zinc-100" : "bg-zinc-800"}`}>
        {player.bannerUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={player.bannerUrl} alt="" loading="lazy" decoding="async" className="size-full object-cover" />
        ) : (
          <div className="h-full w-full opacity-80 [background-image:radial-gradient(circle_at_80%_15%,rgba(253,164,175,.20),transparent_24%),repeating-linear-gradient(135deg,rgba(0,0,0,.07)_0_1px,transparent_1px_7px)]" />
        )}
      </div>
      <div className="relative px-3 pb-3 pt-8 sm:px-4">
        <div className="absolute -top-8 left-4">
          {player.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={player.avatarUrl} alt="" loading="lazy" decoding="async" className="size-16 rounded-full border-2 border-white bg-zinc-100 object-cover shadow-sm" />
          ) : (
            <AvatarMark seed={player.avatarSeed} size="lg" />
          )}
        </div>
        <div className="absolute right-3 top-3">
          {hasStatus ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-lime-400 px-2 py-0.5 text-[10px] font-bold uppercase text-zinc-950">
              <Radio size={10} />
              {player.status === "online" ? "live" : "scrim"}
            </span>
          ) : null}
        </div>
        <div className={`min-w-0 ${showMemberNumber ? (hasStatus ? "pr-14" : "") : "pr-14"}`}>
          <h3 className={`truncate text-sm font-semibold leading-5 ${isLight ? "text-zinc-900" : "text-zinc-50"}`}>{player.displayName}</h3>
          <p className={`flex min-w-0 items-center gap-1.5 truncate text-[11px] leading-4 ${isLight ? "text-zinc-500" : "text-zinc-400"}`}>
            <span className="truncate">@{player.username}</span>
            {memberNumber ? <span className="shrink-0 font-mono text-[9px] tabular-nums text-zinc-400">{memberNumber}</span> : null}
          </p>
        </div>
        {player.bio ? (
          <p className={`mt-2 line-clamp-2 h-9 text-xs leading-[18px] ${isLight ? "text-zinc-600" : "text-zinc-400"}`}>{player.bio}</p>
        ) : null}
        <div className={`mt-2 border-t pt-2 ${isLight ? "border-zinc-100" : "border-zinc-700"}`}>
          {metadata.length > 0 ? (
            <div className={`flex min-w-0 items-center gap-1.5 text-[11px] leading-4 ${isLight ? "text-zinc-500" : "text-zinc-400"}`}>
              <Crosshair size={11} className={`shrink-0 ${isLight ? "text-zinc-400" : "text-zinc-500"}`} />
              <span className="truncate">{metadata.join(showMemberNumber ? " · " : " / ")}</span>
            </div>
          ) : null}
          {aimValues.length > 0 ? (
            <div className={`mt-2 grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] leading-4 sm:grid-cols-4 ${isLight ? "text-zinc-500" : "text-zinc-400"}`}>
              {aimValues.map((value) => <span key={value} className="truncate">{value}</span>)}
            </div>
          ) : null}
          {mouse ? (
            <div className={`mt-2 flex min-w-0 items-center gap-1 text-[11px] leading-4 ${isLight ? "text-zinc-500" : "text-zinc-400"}`}>
              <Mouse size={11} className="shrink-0" />
              <span className="truncate">{mouse.maker} {mouse.name}</span>
            </div>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
