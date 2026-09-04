import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Footer } from "@/components/Footer";
import { GearCard } from "@/components/GearCard";
import { Hero } from "@/components/home/Hero";
import { HowNYKEWorks } from "@/components/home/HowNYKEWorks";
import { ProfileStream } from "@/components/home/ProfileStream";
import { PlayerCard } from "@/components/PlayerCard";
import { getHomeData } from "@/lib/home";

export const metadata: Metadata = {
  title: "NYKE — FPS Profiles, Aim Settings & Gear",
  description: "Build and share your FPS profile with aim settings, active gear and your NYKE Card.",
};

function SectionHeader({ title, titleId, description, href, linkLabel }: { title: string; titleId: string; description: string; href: string; linkLabel: string }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-5">
      <div>
        <h2 id={titleId} className="font-serif text-2xl font-black text-zinc-950 sm:text-3xl">{title}</h2>
        <p className="mt-1 text-sm text-zinc-500">{description}</p>
      </div>
      <Link
        href={href}
        className="hidden shrink-0 items-center gap-1 rounded-sm text-xs font-medium text-zinc-500 transition hover:text-zinc-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/70 sm:inline-flex"
      >
        {linkLabel}
        <ArrowRight size={13} aria-hidden="true" />
      </Link>
    </div>
  );
}

function DataNotice({ children, actionHref, actionLabel }: { children: string; actionHref: string; actionLabel: string }) {
  return (
    <div className="nyke-surface-card border-dashed px-5 py-9 text-center">
      <p className="text-sm text-zinc-500">{children}</p>
      <Link
        href={actionHref}
        className="mt-4 inline-flex h-9 items-center justify-center rounded-md bg-rose-300 px-4 text-sm font-semibold text-zinc-950 transition hover:bg-rose-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/70"
      >
        {actionLabel}
      </Link>
    </div>
  );
}

function profileGridClass(count: number) {
  if (count === 1) return "mx-auto grid max-w-[300px] grid-cols-1 gap-4";
  if (count === 2) return "mx-auto grid max-w-[620px] grid-cols-1 gap-4 sm:grid-cols-2";
  if (count === 3) return "mx-auto grid max-w-[960px] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3";
  return "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4";
}

export default async function Home() {
  const data = await getHomeData();
  const primaryHref = data.viewerUsername ? `/${data.viewerUsername}` : "/register";
  const primaryLabel = data.viewerUsername ? "View your profile" : "Claim your profile";

  return (
    <main className="page-light min-h-screen bg-[#fafafa] text-zinc-950">
      <div className="relative w-full px-4 sm:px-6 lg:px-8">
        <Hero cardShowcase={data.cardShowcase} viewerUsername={data.viewerUsername} />

        <ProfileStream players={data.streamProfiles} />

        <section className="mx-auto grid w-full max-w-5xl grid-cols-2 gap-8 py-14 text-center sm:grid-cols-4 sm:px-6 sm:py-16" aria-label="NYKE index statistics">
          {[
            [data.stats.players.toLocaleString(), "players"],
            [data.stats.gear.toLocaleString(), "gear indexed"],
            [data.stats.regions.toLocaleString(), "regions"],
            [data.stats.games.toLocaleString(), "games"],
          ].map(([value, label]) => (
            <div key={label}>
              <p className="font-serif text-4xl font-black leading-none text-zinc-950">{value}</p>
              <p className="mt-2 text-xs text-zinc-500">{label}</p>
            </div>
          ))}
        </section>

        <HowNYKEWorks />

        <section className="mx-auto w-full max-w-[1280px] py-12 sm:px-6" aria-labelledby="featured-profiles">
          <SectionHeader title="Featured profiles" titleId="featured-profiles" description="Players building their public FPS identity on NYKE." href="/explore" linkLabel="Browse all" />
          {data.errors.profiles ? (
            <DataNotice actionHref="/" actionLabel="Try again">NYKE couldn&apos;t load the player index right now.</DataNotice>
          ) : data.featuredProfiles.length > 0 ? (
            <div className={profileGridClass(data.featuredProfiles.length)}>
              {data.featuredProfiles.map((player) => (
                <PlayerCard key={player.username} player={player} showMemberNumber />
              ))}
            </div>
          ) : (
            <DataNotice actionHref="/register" actionLabel="Claim your profile">Be the first player on NYKE.</DataNotice>
          )}
        </section>

        {data.recentProfiles.length > 0 ? (
          <section className="mx-auto w-full max-w-[1280px] py-12 sm:px-6" aria-labelledby="new-on-nyke">
            <SectionHeader title="New on NYKE" titleId="new-on-nyke" description="Recently created player profiles." href="/explore" linkLabel="Explore players" />
            <div className={profileGridClass(Math.min(4, data.recentProfiles.length))}>
              {data.recentProfiles.slice(0, 4).map((player) => (
                <PlayerCard key={player.username} player={player} showMemberNumber />
              ))}
            </div>
          </section>
        ) : null}

        <section className="mx-auto w-full max-w-[1280px] py-12 sm:px-6" aria-labelledby="home-gear">
          <SectionHeader
            title={data.gearHeading}
            titleId="home-gear"
            description={data.gearHeading === "Popular gear" ? "Equipment currently used across NYKE profiles." : "Browse the FPS gear indexed on NYKE."}
            href="/gear"
            linkLabel="Browse all"
          />
          {data.errors.gear ? (
            <DataNotice actionHref="/" actionLabel="Try again">NYKE couldn&apos;t load the gear index right now.</DataNotice>
          ) : data.popularGear.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {data.popularGear.map((item) => (
                <GearCard key={item.id} item={item} profileCount={item.profileCount} />
              ))}
            </div>
          ) : (
            <DataNotice actionHref="/gear" actionLabel="Explore gear">No gear has been indexed yet.</DataNotice>
          )}
        </section>

        <section className="-mx-4 mt-8 border-y border-zinc-200 bg-white px-4 py-16 sm:-mx-6 sm:px-6 sm:py-20 lg:-mx-8 lg:px-8">
          <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-8 text-center md:flex-row md:text-left">
            <div>
              <h2 className="font-serif text-3xl font-black text-zinc-950 sm:text-4xl">Build your NYKE profile.</h2>
              <p className="mt-3 max-w-xl text-base leading-7 text-zinc-500">Your aim, settings and gear. One profile. One shareable Card.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href={primaryHref}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-rose-300 px-6 text-sm font-semibold text-zinc-950 shadow-sm transition hover:bg-rose-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/70"
              >
                {primaryLabel}
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
              <Link
                href="/explore"
                className="inline-flex h-10 items-center justify-center rounded-md border border-zinc-200 bg-white px-6 text-sm font-semibold text-zinc-700 transition hover:border-zinc-300 hover:text-zinc-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/70"
              >
                Explore players
              </Link>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
