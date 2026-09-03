import { CardActions } from "@/components/card/CardActions";
import { formatMemberNumber } from "@/lib/identity";
import { getCachedPublicProfileData } from "@/lib/profiles";

type PlayerCardPageProps = {
  params: Promise<{ username: string }>;
};

export default async function PlayerCardPage({ params }: PlayerCardPageProps) {
  const { username } = await params;
  const publicProfile = await getCachedPublicProfileData(username);
  if (!publicProfile) return null;
  const memberNumber = publicProfile.player.memberNumber === null ? null : formatMemberNumber(publicProfile.player.memberNumber);

  return (
    <section className="mx-auto mt-10 flex w-full max-w-3xl flex-col items-center sm:mt-12">
        <header className="mb-7 text-center">
          <h1 className="font-serif text-2xl font-black leading-none sm:text-3xl">NYKE Card</h1>
          <p className="mt-2 text-[10px] font-semibold text-zinc-500">@{publicProfile.player.username}{memberNumber ? ` · ${memberNumber}` : ""}</p>
        </header>
        <CardActions data={{ player: publicProfile.player, activeGear: publicProfile.activeGear }} />
    </section>
  );
}
