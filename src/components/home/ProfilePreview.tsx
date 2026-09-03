import Link from "next/link";
import { Activity, Crosshair, Keyboard, Monitor, Mouse, UserRound } from "lucide-react";
import type { ReactNode } from "react";
import { AvatarMark } from "@/components/AvatarMark";
import { calculateCm360, calculateEdpi, formatNumber } from "@/lib/calculations";
import { players } from "@/lib/mock-data";

function ActionDot({ children }: { children: ReactNode }) {
  return (
    <span className="grid size-6 place-items-center rounded-full border border-zinc-700 bg-[#18191d] text-zinc-300">
      {children}
    </span>
  );
}

export function ProfilePreview() {
  const player = players.find((item) => item.username === "cyx") ?? players[0];
  const gear = [player.gear.mouse, player.gear.mousepad];
  const edpi = calculateEdpi(player.settings.dpi, player.settings.sensitivity);
  const cm360 = calculateCm360(player.settings.dpi, player.settings.sensitivity);

  return (
    <div className="relative mx-auto w-full min-w-0 max-w-[612px]">
      <div className="absolute inset-0 translate-x-2 translate-y-3 rounded-xl border border-zinc-200 bg-white shadow-xl shadow-zinc-300/60 sm:translate-x-5 sm:translate-y-5" />
      <div className="relative w-full min-w-0 overflow-hidden rounded-xl border border-zinc-200 bg-[#f7f4f1] p-4 shadow-[0_28px_70px_rgba(24,24,27,0.24)]">
        <div className="mb-4 flex h-8 items-center gap-2">
          <span className="size-2.5 rounded-full bg-rose-400" />
          <span className="size-2.5 rounded-full bg-amber-300" />
          <span className="size-2.5 rounded-full bg-lime-400" />
          <div className="ml-3 flex h-7 min-w-0 flex-1 items-center rounded-md border border-zinc-200 bg-white px-3 text-[11px] text-zinc-500">
            <span className="truncate">
              nyke.life/<span className="text-rose-400">cyx</span>
            </span>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-zinc-800 bg-[#101114] text-zinc-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
          <div className="h-[58px] border-b border-zinc-800 bg-[radial-gradient(circle_at_78%_16%,rgba(190,242,100,.16),transparent_26%),repeating-linear-gradient(135deg,rgba(255,255,255,.045)_0_1px,transparent_1px_9px)]" />

          <div className="px-3 pb-3">
            <div className="-mt-5 grid grid-cols-[auto_1fr_auto] items-end gap-3">
              <div className="rounded-full border-4 border-[#101114]">
                <AvatarMark seed={player.avatarSeed} size="md" />
              </div>
              <div className="min-w-0 pb-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold leading-5 text-zinc-50">{player.displayName}</p>
                  <span className="rounded-full border border-rose-300/30 bg-rose-300/10 px-1.5 py-0.5 text-[9px] font-semibold text-rose-200">
                    first player
                  </span>
                </div>
                <p className="truncate text-[11px] leading-4 text-zinc-400">
                  @{player.username} / {player.region} / {player.settings.game} / {player.settings.rank}
                </p>
              </div>
              <div className="hidden items-center gap-1 sm:flex">
                <ActionDot>
                  <Crosshair size={12} />
                </ActionDot>
                <ActionDot>
                  <Activity size={12} />
                </ActionDot>
                <ActionDot>
                  <Monitor size={12} />
                </ActionDot>
              </div>
            </div>

            <p className="mt-2 truncate text-[11px] italic leading-4 text-zinc-400">
              Student / editor / FPS player. Built around aim, setup, and sharp little moments.
            </p>

            <div className="mt-4 flex items-center justify-between">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-300">active peripherals</h3>
              <span className="h-px flex-1 bg-zinc-800/90" />
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {gear.map((item) => (
                <div key={item.id} className="rounded-md border border-zinc-800 bg-[#16171b] p-2.5">
                  <div className="mb-1.5 flex items-center justify-between text-[10px]">
                    <span className="rounded-full border border-lime-300/30 bg-lime-300/10 px-1.5 py-0.5 text-lime-200">in use</span>
                    <span className="text-rose-200">+4.8</span>
                  </div>
                  <p className="flex items-center gap-1 text-[11px] text-zinc-400">
                    {item.category === "mouse" ? <Mouse size={11} /> : <Monitor size={11} />}
                    {item.category}
                  </p>
                  <p className="mt-1 truncate text-xs font-semibold leading-4 text-zinc-50">{item.name}</p>
                  <p className="truncate text-[10px] text-zinc-500">{item.maker}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-300">aim settings</h3>
              <span className="h-px flex-1 bg-zinc-800/90" />
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                ["dpi", player.settings.dpi?.toString() ?? "--"],
                ["sens", player.settings.sensitivity?.toString() ?? "--"],
                ["edpi", formatNumber(edpi, 0)],
                ["cm/360", formatNumber(cm360, 1)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-md border border-zinc-800 bg-[#16171b] px-2 py-2 text-center">
                  <p className="text-[9px] leading-3 text-zinc-500">{label}</p>
                  <p className="truncate text-[10px] font-semibold leading-4 text-lime-200">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-3 grid grid-cols-[1fr_auto] gap-2 rounded-md border border-zinc-800 bg-[#16171b] p-2.5">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.14em] text-zinc-500">latest PB</p>
                <p className="mt-1 truncate text-xs font-semibold text-zinc-50">Pressure clip / entry timing</p>
                <p className="mt-1 text-[11px] text-rose-200">240 eDPI / {player.settings.pollingRate}</p>
              </div>
              <span className="h-10 w-20 rounded-sm border border-zinc-800 bg-[linear-gradient(160deg,transparent_50%,rgba(244,114,182,.12)_51%),linear-gradient(to_top,rgba(190,242,100,.30)_1px,transparent_1px)]" />
            </div>

            <div className="mx-auto mt-3 flex h-8 w-fit items-center gap-1 rounded-lg border border-zinc-800 bg-[#16171b] p-1 text-[11px] text-zinc-400">
              {[
                ["Home", Crosshair],
                ["Gear", Mouse],
                ["Keys", Keyboard],
              ].map(([item, Icon], index) => {
                const IconComponent = Icon as typeof Crosshair;
                return (
                  <span key={item as string} className={`inline-flex items-center gap-1 rounded-md px-3 py-1 ${index === 0 ? "bg-rose-300/12 text-rose-200" : ""}`}>
                    <IconComponent size={10} />
                    {item as string}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        <Link
          href="/cyx"
          className="absolute inset-4 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/70"
          aria-label="Open cyx profile"
        >
          <span className="sr-only">Open cyx profile</span>
        </Link>
        <UserRound className="pointer-events-none absolute right-6 top-6 text-zinc-300" size={14} />
      </div>
    </div>
  );
}
