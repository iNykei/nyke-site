import { ArrowRight, Check, Compass, Crosshair, Gamepad2, Keyboard, Monitor, Mouse, Settings2, UserRound } from "lucide-react";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { GearCard } from "@/components/GearCard";
import { PlayerCard } from "@/components/PlayerCard";
import { RecentProfileActivity } from "@/components/RecentProfileActivity";
import { gearItems, getTrendingGear, players, profileActivities } from "@/lib/mock-data";

const streamHandles = [
  { href: "cyx", label: "cyx", seed: "CX", active: true },
  { href: "mako", label: "mako", seed: "MK", active: true },
  { href: "sable", label: "sable", seed: "SB", active: false },
  { href: "rune", label: "rune", seed: "RN", active: true },
  { href: "stride", label: "stride", seed: "ST", active: false },
  { href: "lynx", label: "lynx", seed: "LX", active: true },
  { href: "frost", label: "frost", seed: "FR", active: false },
  { href: "echo", label: "echo", seed: "EC", active: true },
  { href: "kai", label: "kai", seed: "KI", active: false },
  { href: "mono", label: "mono", seed: "MO", active: true },
  { href: "zero", label: "zero", seed: "Z0", active: false },
  { href: "asher", label: "asher", seed: "AS", active: true },
  { href: "vex", label: "vex", seed: "VX", active: true },
  { href: "pixel", label: "pixel", seed: "PX", active: false },
];

function ProfileStreamRow({ reverse = false }: { reverse?: boolean }) {
  const items = reverse ? [...streamHandles].reverse() : streamHandles;

  return (
    <div className={`profile-stream-track flex w-max gap-3 ${reverse ? "profile-stream-track-reverse" : ""}`}>
      {[...items, ...items, ...items].map((item, index) => (
        <Link
          key={`${item.href}-${index}-${reverse ? "reverse" : "forward"}`}
          href={`/${item.href}`}
          className="inline-flex h-8 items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 pr-4 text-xs font-medium text-zinc-600 shadow-sm shadow-zinc-200/40 transition duration-200 hover:border-zinc-300 hover:text-zinc-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60"
        >
          <span className="grid size-6 place-items-center overflow-hidden rounded-full bg-zinc-100 text-[10px] font-bold text-zinc-700">{item.seed}</span>
          <span>{item.label}</span>
          {item.active ? (
            <span className="grid size-4 place-items-center rounded-full bg-sky-400 text-white">
              <Check size={10} strokeWidth={3} />
            </span>
          ) : null}
        </Link>
      ))}
    </div>
  );
}

function ActionDot({ children }: { children: React.ReactNode }) {
  return (
    <span className="grid size-6 place-items-center rounded-full border border-zinc-200 bg-white text-zinc-700">
      {children}
    </span>
  );
}

function ProfilePreview() {
  const player = players[0];
  const gear = [player.gear.mouse, player.gear.mousepad];

  return (
    <div className="relative mx-auto w-full max-w-[588px]">
      <div className="absolute inset-0 translate-x-5 translate-y-5 rounded-xl border border-zinc-200 bg-white shadow-xl shadow-zinc-300/50" />
      <div className="relative overflow-hidden rounded-xl border border-zinc-200 bg-[#f7f7f7] p-4 shadow-[0_24px_60px_rgba(24,24,27,0.22)]">
        <div className="mb-7 flex h-8 items-center gap-2">
          <span className="size-2.5 rounded-full bg-red-400" />
          <span className="size-2.5 rounded-full bg-amber-300" />
          <span className="size-2.5 rounded-full bg-emerald-500" />
          <div className="ml-3 flex h-7 min-w-0 flex-1 items-center rounded-md border border-zinc-200 bg-white px-3 text-[11px] text-zinc-500">
            <span className="truncate">nyke.local/<span className="text-rose-400">you</span></span>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-3">
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
            <div className="grid size-10 place-items-center rounded-full bg-zinc-100 text-zinc-700">
              <UserRound size={18} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold leading-5 text-zinc-950">you <span className="text-rose-400">+</span></p>
              <p className="truncate text-[11px] leading-4 text-zinc-500">
                @{player.username} / joined 2026 / {player.region} / 843 hrs / 96 followers
              </p>
            </div>
            <div className="hidden items-center gap-1 sm:flex">
              <ActionDot><Crosshair size={12} /></ActionDot>
              <ActionDot><Gamepad2 size={12} /></ActionDot>
              <ActionDot><Monitor size={12} /></ActionDot>
              <span className="ml-1 rounded-md border border-zinc-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-zinc-800">Follow</span>
            </div>
          </div>
          <p className="mt-3 truncate text-[11px] italic text-zinc-500">&quot;Small changes, saved in public.&quot;</p>
        </div>

        <h3 className="mt-5 text-center text-sm font-bold leading-5 text-zinc-950">active peripherals</h3>
        <div className="mx-auto mt-2 h-px w-8 bg-rose-300" />
        <div className="mt-4 grid grid-cols-2 gap-3">
          {gear.map((item, index) => (
            <div key={item.id} className="rounded-lg border border-zinc-200 bg-white p-3">
              <div className="mb-2 flex items-center justify-between text-[10px]">
                <span className="rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-rose-400">in use</span>
                <span className="text-amber-400">+ 4.{index + 8}</span>
              </div>
              <p className="flex items-center gap-1 text-[11px] text-zinc-500">
                {item.category === "mouse" ? <Mouse size={11} /> : <Monitor size={11} />}
                {item.category}
              </p>
              <p className="mt-1 truncate text-sm font-semibold leading-5 text-zinc-950">{item.name}</p>
              <p className="truncate text-[11px] text-zinc-500">{item.maker} / tuned</p>
            </div>
          ))}
        </div>

        <h3 className="mt-6 text-center text-sm font-bold leading-5 text-zinc-950">in-game settings</h3>
        <div className="mx-auto mt-2 h-px w-8 bg-rose-300" />
        <div className="mx-auto mt-4 grid max-w-[302px] grid-cols-4 gap-2">
          {[
            ["sens", "54.43cm/360"],
            ["dpi", "800"],
            ["polling", "8000hz"],
            ["grip", "claw"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-zinc-200 bg-white px-2 py-2 text-center">
              <p className="text-[9px] leading-3 text-zinc-400">{label}</p>
              <p className="truncate text-[10px] font-semibold leading-4 text-zinc-950">{value}</p>
            </div>
          ))}
        </div>

        <h3 className="mt-5 text-center text-sm font-bold leading-5 text-zinc-950">latest PB</h3>
        <div className="mx-auto mt-2 h-px w-8 bg-rose-300" />
        <div className="mt-4 grid grid-cols-2 gap-3">
          {["VT Multiclick", "Strafe Control"].map((title, index) => (
            <div key={title} className="rounded-lg border border-zinc-200 bg-white p-3">
              <p className="text-[10px] leading-3 text-zinc-400">09/03/2026, 19:{12 + index}</p>
              <p className="mt-1 truncate text-xs font-semibold text-zinc-950">{title}</p>
              <div className="mt-1 flex items-end justify-between gap-2">
                <p className="text-[11px] text-rose-400">{1245 - index * 353} / #{87 + index * 325}</p>
                <span className="h-7 w-16 rounded-sm bg-[linear-gradient(160deg,transparent_50%,rgba(251,113,133,.16)_51%),linear-gradient(to_top,rgba(251,113,133,.35)_1px,transparent_1px)]" />
              </div>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-4 flex h-8 w-fit items-center gap-1 rounded-lg border border-zinc-200 bg-white p-1 text-[11px] text-zinc-500">
          {[
            ["Home", Crosshair],
            ["Peripherals", Mouse],
            ["Card", Keyboard],
          ].map(([item, Icon], index) => {
            const IconComponent = Icon as typeof Crosshair;
            return (
              <span key={item as string} className={`inline-flex items-center gap-1 rounded-md px-3 py-1 ${index === 0 ? "bg-rose-100 text-rose-500" : ""}`}>
                <IconComponent size={10} />
                {item as string}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const trendingGear = getTrendingGear(["mouse", "mousepad", "keyboard", "monitor"]);

  return (
    <main className="page-light min-h-screen bg-[#fbfaf8] text-zinc-950">
      <div className="relative w-full px-4 sm:px-6 lg:px-8">
        <section className="relative mx-auto w-full max-w-6xl px-0 pb-12 pt-[76px] sm:px-6 sm:pt-[118px] lg:pt-[132px]">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
            <div className="text-center lg:text-left">
              <div className="mb-5 inline-flex h-8 items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-600 shadow-sm">
                <Settings2 size={14} className="text-cyan-400" />
                Public FPS profile index
              </div>
              <h1 className="mx-auto max-w-[500px] font-serif text-[40px] font-black leading-[1.04] tracking-[-0.012em] text-zinc-950 sm:text-[60px] sm:leading-[66px] lg:mx-0">
                A portfolio for players who <span className="text-rose-300">tune</span> their gear.
              </h1>
              <p className="mx-auto mt-7 max-w-[500px] text-lg leading-8 text-zinc-600 lg:mx-0">
                Build a public NYKE profile, track your benchmarks, and keep your FPS setup in one place.
              </p>
              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
                <Link href="/explore" className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-rose-300 px-7 text-sm font-semibold text-zinc-950 shadow-lg shadow-rose-200/70 transition hover:bg-rose-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60">
                  Claim your profile
                  <ArrowRight size={15} />
                </Link>
                <Link href="/explore" className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-zinc-200 bg-white px-6 text-sm font-semibold text-zinc-800 transition hover:border-zinc-300 hover:text-zinc-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60">
                  <Compass size={15} />
                  Browse profiles
                </Link>
              </div>
            </div>
            <ProfilePreview />
          </div>
        </section>

        <section className="profile-stream-mask -mx-4 overflow-hidden border-y border-zinc-200 bg-white py-5 sm:-mx-6 lg:-mx-8">
          <div className="space-y-3">
            <ProfileStreamRow />
            <ProfileStreamRow reverse />
          </div>
        </section>

        <section className="mx-auto grid w-full max-w-5xl grid-cols-2 gap-8 px-0 py-16 text-center sm:grid-cols-4 sm:px-6">
          {[
            [players.length.toLocaleString(), "players"],
            [profileActivities.length.toLocaleString(), "updates"],
            [gearItems.length.toLocaleString(), "peripherals"],
            ["4", "games"],
          ].map(([value, label]) => (
            <div key={label}>
              <p className="font-serif text-4xl font-black leading-none text-zinc-950">{value}</p>
              <p className="mt-2 text-xs text-zinc-500">{label}</p>
            </div>
          ))}
        </section>

        <RecentProfileActivity activities={profileActivities} />

        <section className="mx-auto w-full max-w-[1280px] px-0 py-10 sm:px-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-600">Featured profiles</h2>
            <Link href="/explore" className="text-xs text-zinc-500 transition hover:text-zinc-950">
              Browse all -&gt;
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {players.slice(0, 4).map((player) => (
              <PlayerCard key={player.username} player={player} />
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-[1280px] px-0 pb-16 sm:px-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-600">Popular gear</h2>
            <Link href="/gear" className="text-xs text-zinc-500 transition hover:text-zinc-950">
              Browse all -&gt;
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {trendingGear.map((item) => (
              <GearCard key={item.id} item={item} profileCount={item.profileCount} />
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
