import { CardActions } from "@/components/card/CardActions";
import { getCachedPublicProfileData } from "@/lib/profiles";

type PlayerCardPageProps = {
  params: Promise<{ username: string }>;
};

export default async function PlayerCardPage({ params }: PlayerCardPageProps) {
  const { username } = await params;
  const publicProfile = await getCachedPublicProfileData(username);
  if (!publicProfile) return null;

  return (
    <section className="mx-auto mt-10 flex w-full max-w-3xl flex-col items-center sm:mt-12">
        <header className="mb-7 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-rose-500">Player identity</p>
          <h1 className="mt-2 font-serif text-3xl font-black leading-none sm:text-4xl">{publicProfile.player.displayName}&apos;s NYKE Card</h1>
        </header>
        <CardActions data={{ player: publicProfile.player, activeGear: publicProfile.activeGear }} />
    </section>
  );
}
