import { ProfileGearCard } from "@/components/profile/ProfileGearCard";
import { getCachedPublicProfileData } from "@/lib/profiles";

export default async function PlayerGearPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const data = await getCachedPublicProfileData(username);
  if (!data) return null;

  return (
    <section className="mx-auto mt-10 max-w-5xl sm:mt-12">
      <header className="mb-6 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--profile-muted)]">Current loadout</p>
        <h2 className="mt-2 font-serif text-3xl font-black text-[var(--profile-text)]">Active gear</h2>
      </header>
      {data.activeGear.length > 0 ? (
        <div className="flex flex-wrap justify-center gap-4">
          {data.activeGear.map((item) => <ProfileGearCard key={item.id} item={item} />)}
        </div>
      ) : (
        <div className="nyke-surface-card mx-auto max-w-xl px-6 py-12 text-center">
          <p className="text-sm font-semibold text-zinc-800">No active gear</p>
          <p className="mt-1 text-xs text-[var(--profile-muted)]">This player has not published a loadout.</p>
        </div>
      )}
    </section>
  );
}
