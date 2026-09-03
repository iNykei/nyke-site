import Link from "next/link";
import { Footer } from "@/components/Footer";
import { GearCard } from "@/components/GearCard";
import { Hero } from "@/components/home/Hero";
import { ProfileStream } from "@/components/home/ProfileStream";
import { PlayerCard } from "@/components/PlayerCard";
import { RecentProfileActivity } from "@/components/RecentProfileActivity";
import { gearItems, getTrendingGear, players, profileActivities } from "@/lib/mock-data";

export default function Home() {
  const trendingGear = getTrendingGear(["mouse", "mousepad", "keyboard", "monitor"]);

  return (
    <main className="page-light min-h-screen bg-[#fbfaf8] text-zinc-950">
      <div className="relative w-full px-4 sm:px-6 lg:px-8">
        <Hero />

        <ProfileStream />

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
