import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { ProfileHeader } from "@/components/ProfileHeader";
import { ProfileGearCard } from "@/components/profile/ProfileGearCard";
import { calculateCm360, calculateEdpi, formatNumber } from "@/lib/calculations";
import { players } from "@/lib/mock-data";
import { getPublicProfileData } from "@/lib/profiles";

type PlayerProfilePageProps = {
  params: Promise<{ username: string }>;
};

type ProfileSectionProps = {
  id?: string;
  title: string;
  children: ReactNode;
};

export const dynamic = "force-dynamic";

function ProfileSection({ id, title, children }: ProfileSectionProps) {
  return (
    <section id={id} className="profile-section mt-16 scroll-mt-24 sm:mt-20">
      <header className="mb-6 flex items-end justify-between gap-4 border-b border-zinc-200 pb-4 sm:mb-8">
        <h2 className="font-serif text-3xl font-black leading-none text-zinc-950 sm:text-[34px]">{title}</h2>
        <span className="mb-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-300" aria-hidden="true" />
      </header>
      {children}
    </section>
  );
}

function metricValue(value: number | null, digits: number, suffix = "") {
  return value === null ? "\u2014" : `${formatNumber(value, digits)}${suffix}`;
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

  const { player, isOwner, source, settings, activeGear } = publicProfile;
  const edpi = calculateEdpi(player.settings.dpi, player.settings.sensitivity);
  const cm360 = calculateCm360(player.settings.dpi, player.settings.sensitivity);
  const hasSettings =
    source === "demo" ||
    Boolean(
      settings &&
        [settings.dpi, settings.sensitivity, settings.resolution, settings.polling_rate].some((value) => value !== null && value !== ""),
    );
  const aimSettings = [
    ["DPI", player.settings.dpi === null ? "\u2014" : player.settings.dpi.toString(), false],
    ["Sensitivity", player.settings.sensitivity === null ? "\u2014" : player.settings.sensitivity.toString(), false],
    ["eDPI", metricValue(edpi, 0), true],
    ["cm/360", metricValue(cm360, 2, cm360 === null ? "" : " cm"), true],
    ["Resolution", player.settings.resolution || "\u2014", false],
    ["Polling", player.settings.pollingRate || "\u2014", false],
  ] as const;

  return (
    <main className="profile-page page-light min-h-[calc(100vh-57px)] bg-[#fbfaf8] px-4 pb-24 pt-8 text-zinc-950 sm:px-6 sm:pt-10 lg:px-8 lg:pt-12">
      <div className="mx-auto w-full max-w-6xl">
        <ProfileHeader player={player} isOwner={isOwner} />

        <ProfileSection id="settings" title="Aim settings">
          {hasSettings ? (
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-zinc-200 bg-zinc-200 shadow-sm sm:grid-cols-3 lg:grid-cols-6">
              {aimSettings.map(([label, value, isMetric]) => (
                <div key={label} className="group bg-white px-4 py-5 transition-colors duration-200 hover:bg-rose-50/40">
                  <p className="text-[10px] font-semibold uppercase text-zinc-500">{label}</p>
                  <p className={`mt-2 truncate text-sm font-semibold leading-5 transition-colors duration-200 ${isMetric && value !== "\u2014" ? "text-lime-700 group-hover:text-lime-600" : "text-zinc-950"}`}>
                    {value}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex min-h-32 items-center justify-center rounded-lg border border-dashed border-zinc-200 bg-white/60 px-6 text-center">
              <div>
                <p className="text-sm font-semibold text-zinc-800">No aim settings yet</p>
                <p className="mt-1 text-xs leading-5 text-zinc-500">Sensitivity and display details will appear here.</p>
              </div>
            </div>
          )}
        </ProfileSection>

        {activeGear.length > 0 ? (
          <ProfileSection id="gear" title="Active gear">
            <div className="flex flex-wrap justify-center gap-4">
              {activeGear.map((item) => (
                <ProfileGearCard key={item.id} item={item} />
              ))}
            </div>
          </ProfileSection>
        ) : null}

        <ProfileSection id="highlights" title="Highlights">
          {player.highlights.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {player.highlights.map((highlight, index) => (
                <article key={highlight} className="profile-highlight rounded-lg border border-zinc-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-lg hover:shadow-zinc-200/60">
                  <p className="text-[10px] font-semibold uppercase text-rose-400">{String(index + 1).padStart(2, "0")}</p>
                  <h3 className="mt-8 text-[15px] font-semibold leading-6 text-zinc-950">{highlight}</h3>
                </article>
              ))}
            </div>
          ) : (
            <div className="flex min-h-[220px] items-center justify-center rounded-lg border border-dashed border-zinc-200 bg-white/60 px-6 py-10 text-center">
              <div className="max-w-sm">
                <p className="text-[10px] font-semibold uppercase text-zinc-500">Highlights</p>
                <h3 className="mt-3 font-serif text-2xl font-black text-zinc-950">No highlights yet</h3>
                <p className="mt-3 text-sm leading-6 text-zinc-500">Clips, achievements, and setup notes will appear here.</p>
              </div>
            </div>
          )}
        </ProfileSection>
      </div>
    </main>
  );
}
