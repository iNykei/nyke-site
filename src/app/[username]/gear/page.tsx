import { ProfileGearCard } from "@/components/profile/ProfileGearCard";
import { GearCollection } from "@/components/gear/GearCollection";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { getCachedPublicProfileData } from "@/lib/profiles";

export default async function PlayerGearPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const data = await getCachedPublicProfileData(username);
  if (!data) return null;

  return (
    <div className="mx-auto mt-10 max-w-5xl space-y-10 sm:mt-12">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 pb-5">
        <p className="text-xs font-semibold uppercase text-zinc-500">{data.gearCollection.length} gear items <span className="mx-2 text-zinc-300">/</span>{data.activeGear.length} active</p>
        {data.isOwner ? <Link href="/settings/gear" className="inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-700 hover:border-rose-300">Manage gear <ArrowRight size={14} /></Link> : null}
      </header>
      <section aria-labelledby="public-loadout-heading">
        <h2 id="public-loadout-heading" className="mb-5 font-serif text-2xl font-bold text-zinc-950">Active Loadout</h2>
        {data.activeGear.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-4">
            {data.activeGear.map((item) => <ProfileGearCard key={item.id} item={item} />)}
          </div>
        ) : (
          <p className="py-3 text-sm text-zinc-500">No active gear yet.</p>
        )}
      </section>
      <section aria-labelledby="public-collection-heading">
        <h2 id="public-collection-heading" className="mb-5 font-serif text-2xl font-bold text-zinc-950">Gear Collection</h2>
        <GearCollection items={data.gearCollection} />
      </section>
    </div>
  );
}
