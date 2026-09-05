import Link from "next/link";
import { ProfileBadgeCollection } from "@/components/profile/ProfileBadgeCollection";
import { ProfileGearCard } from "@/components/profile/ProfileGearCard";
import { calculateCm360, calculateEdpi, formatNumber } from "@/lib/calculations";
import { getCachedPublicProfileData } from "@/lib/profiles";
import { sortGear } from "@/lib/gear-collection";

type PlayerProfilePageProps = { params: Promise<{ username: string }> };

function valueOrDash(value: number | null, digits = 0) {
  return value === null ? "—" : formatNumber(value, digits);
}

export function generateStaticParams() {
  return [{ username: "cyx" }];
}

export default async function PlayerProfilePage({ params }: PlayerProfilePageProps) {
  const { username } = await params;
  const data = await getCachedPublicProfileData(username);
  if (!data) return null;

  const { player, source, settings } = data;
  const edpi = calculateEdpi(player.settings.dpi, player.settings.sensitivity);
  const cm360 = calculateCm360(player.settings.dpi, player.settings.sensitivity);
  const hasAim = source === "demo" || Boolean(settings && [settings.dpi, settings.sensitivity, settings.resolution, settings.polling_rate].some((value) => value !== null && value !== ""));
  const metrics = [
    ["DPI", player.settings.dpi === null ? "—" : String(player.settings.dpi), false],
    ["Sensitivity", player.settings.sensitivity === null ? "—" : String(player.settings.sensitivity), false],
    ["eDPI", valueOrDash(edpi), true],
    ["cm / 360", cm360 === null ? "—" : `${valueOrDash(cm360, 2)} cm`, true],
  ] as const;
  const homeGear = sortGear(data.activeGear).slice(0, 6);

  return (
    <div className="mx-auto mt-10 max-w-5xl sm:mt-12">
      <section className="grid gap-4 md:grid-cols-[0.72fr_1.28fr]">
        <article className="nyke-surface-card p-5 sm:p-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--profile-muted)]">Player</p>
          <p className="mt-7 text-sm font-semibold uppercase text-zinc-500">{player.settings.game || "Not configured"}</p>
          <h2 className="mt-2 break-words font-serif text-3xl font-black leading-none text-[var(--profile-text)]">{player.settings.rank || "Unranked"}</h2>
          {player.region ? <p className="mt-6 text-xs text-[var(--profile-muted)]">Region {player.region}</p> : null}
        </article>

        <article className="nyke-surface-card p-5 sm:p-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--profile-muted)]">Aim</p>
          {hasAim ? (
            <>
              <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-6 sm:grid-cols-4">
                {metrics.map(([label, value, technical]) => (
                  <div key={label} className="min-w-0 border-l border-[var(--profile-border)] pl-3 first:border-l-0 first:pl-0">
                    <p className="text-[9px] font-bold uppercase text-[var(--profile-muted)]">{label}</p>
                    <p className={`mt-2 truncate font-mono text-base font-semibold tabular-nums ${technical && value !== "—" ? "text-[var(--profile-technical)]" : "text-[var(--profile-text)]"}`}>{value}</p>
                  </div>
                ))}
              </div>
              {[player.settings.resolution, player.settings.pollingRate].some(Boolean) ? (
                <p className="mt-6 border-t border-[var(--profile-border)] pt-4 font-mono text-[10px] text-[var(--profile-muted)]">{[player.settings.resolution, player.settings.pollingRate].filter(Boolean).join("  ·  ")}</p>
              ) : null}
            </>
          ) : <p className="mt-7 text-sm text-[var(--profile-muted)]">Aim settings have not been configured.</p>}
        </article>
      </section>

      <section className="mt-14 sm:mt-16" aria-labelledby="active-gear-heading">
        <header className="mb-6 text-center">
          <h2 id="active-gear-heading" className="font-serif text-2xl font-black text-[var(--profile-text)]">Active gear</h2>
          <span className="mx-auto mt-3 block h-px w-8 bg-rose-400" aria-hidden="true" />
        </header>
        {homeGear.length > 0 ? (
          <>
            <div className="flex flex-wrap justify-center gap-4">
              {homeGear.map((item) => <ProfileGearCard key={item.id} item={item} compact />)}
            </div>
          </>
        ) : (
          <div className="text-center">
            <p className="text-sm text-[var(--profile-muted)]">No active gear yet.</p>
            {data.isOwner ? <Link href="/settings/gear" className="mt-2 inline-block text-xs font-semibold text-rose-500 hover:text-rose-600">Add gear</Link> : null}
          </div>
        )}
        {data.gearCollection.length > homeGear.length ? <div className="mt-5 text-center"><Link href={`/${player.username}/gear`} className="text-xs font-semibold text-zinc-500 transition hover:text-rose-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2">View all gear →</Link></div> : null}
      </section>

      <section className="mt-14 sm:mt-16" aria-labelledby="badges-heading">
        <header className="mb-6 text-center">
          <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--profile-muted)]">NYKE identity achievements</p>
          <h2 id="badges-heading" className="mt-2 font-serif text-2xl font-black text-[var(--profile-text)]">Badges</h2>
          <span className="mx-auto mt-3 block h-px w-8 bg-rose-400" aria-hidden="true" />
        </header>
        <ProfileBadgeCollection badges={player.badges} />
      </section>

      <section className="nyke-surface-card mt-14 p-5 sm:mt-16 sm:p-6">
        <div className="flex items-center justify-between"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--profile-muted)]">Highlights</p><span className="size-1.5 rounded-full bg-[var(--profile-accent)]" /></div>
        {player.highlights.length > 0 ? (
          <ol className="mt-5 grid gap-px overflow-hidden rounded-md border border-[var(--profile-border)] bg-[var(--profile-border)] sm:grid-cols-3">
            {player.highlights.map((highlight, index) => <li key={highlight} className="bg-white p-4 text-sm font-medium leading-6 text-zinc-700"><span className="mr-3 font-mono text-[9px] text-rose-400">{String(index + 1).padStart(2, "0")}</span>{highlight}</li>)}
          </ol>
        ) : <p className="mt-5 text-sm text-[var(--profile-muted)]">No highlights yet.</p>}
      </section>
    </div>
  );
}
