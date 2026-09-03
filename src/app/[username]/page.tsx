import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { GearCard } from "@/components/GearCard";
import { ProfileHeader } from "@/components/ProfileHeader";
import { calculateCm360, calculateEdpi, formatNumber } from "@/lib/calculations";
import { players } from "@/lib/mock-data";
import { getPublicProfileData } from "@/lib/profiles";

type PlayerProfilePageProps = {
  params: Promise<{ username: string }>;
};

export const dynamic = "force-dynamic";

function ProfileSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-12 sm:mt-16">
      <header className="mb-6 flex flex-col items-center gap-2 text-center">
        <h2 className="text-[22px] font-semibold leading-8 text-zinc-50 sm:text-2xl">{title}</h2>
        <span className="h-px w-10 bg-cyan-300/70" />
      </header>
      {children}
    </section>
  );
}

export function generateStaticParams() {
  return players.map((player) => ({ username: player.username }));
}

export default async function PlayerProfilePage({ params }: PlayerProfilePageProps) {
  const { username } = await params;
  const publicProfile = await getPublicProfileData(username);

  if (!publicProfile) {
    notFound();
  }

  const { player, isOwner } = publicProfile;
  const edpi = calculateEdpi(player.settings.dpi, player.settings.sensitivity);
  const cm360 = calculateCm360(player.settings.dpi, player.settings.sensitivity);
  const activeGear = [player.gear.mouse, player.gear.mousepad, player.gear.keyboard, player.gear.monitor, player.gear.headset, player.gear.skates];

  return (
    <main className="page-dark min-h-screen bg-[#111114] px-4 pb-24 pt-6 text-zinc-100 sm:px-6 sm:pt-8 lg:px-8">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,.08),transparent_35%)]" />
      <div className="mx-auto max-w-[1280px]">
        <ProfileHeader player={player} isOwner={isOwner} />

        <nav className="fixed bottom-4 left-1/2 z-30 flex h-[42px] max-w-[calc(100vw-32px)] -translate-x-1/2 gap-0.5 overflow-x-auto rounded-lg border border-zinc-700 bg-[#1b1b1f]/90 p-1.5 shadow-xl shadow-black/30 backdrop-blur">
          {["home", "gear", "settings", "notes"].map((item) => (
            <a key={item} href={`#${item}`} className="rounded-md px-4 py-1.5 text-xs leading-4 text-zinc-300 transition duration-150 hover:bg-zinc-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/40">
              {item}
            </a>
          ))}
        </nav>

        <ProfileSection title="active gear">
          <div id="gear" className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            {activeGear.map((item) => (
              <GearCard key={item.id} item={item} tone="dark" compact />
            ))}
          </div>
        </ProfileSection>

        <ProfileSection title="in-game settings">
          <div id="settings" className="mx-auto grid max-w-2xl grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              ["game", player.settings.game],
              ["rank", player.settings.rank],
              ["cm/360", `${formatNumber(cm360, 2)} cm`],
              ["sens", player.settings.sensitivity === null ? "--" : `${player.settings.sensitivity}`],
              ["dpi", player.settings.dpi === null ? "--" : `${player.settings.dpi}`],
              ["edpi", `${formatNumber(edpi, 0)}`],
              ["polling", player.settings.pollingRate],
              ["resolution", player.settings.resolution],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-zinc-700 bg-[#1b1b1f] px-4 py-3 text-center">
                <p className="text-[10px] text-zinc-400">{label}</p>
                <p className="mt-1 text-xs font-bold text-zinc-50">{value}</p>
              </div>
            ))}
          </div>
        </ProfileSection>

        <ProfileSection title="profile notes">
          <div id="notes" className="grid gap-4 sm:grid-cols-2">
            {player.highlights.map((highlight, index) => (
              <article key={highlight} className="rounded-xl border border-zinc-700 bg-[#1b1b1f] p-4">
                <p className="text-xs text-zinc-500">0{index + 1}</p>
                <h3 className="mt-2 text-sm font-semibold text-zinc-50">{highlight}</h3>
                <p className="mt-2 text-xs leading-5 text-zinc-400">Setup context saved for comparing player identity, rank, sensitivity, and equipment choices.</p>
              </article>
            ))}
          </div>
        </ProfileSection>
      </div>
    </main>
  );
}
