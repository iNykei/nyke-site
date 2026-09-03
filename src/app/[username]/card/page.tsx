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
    <section className="mx-auto mt-5 flex w-full max-w-3xl flex-col items-center sm:mt-6">
      <CardActions data={{ player: publicProfile.player, activeGear: publicProfile.activeGear }} />
    </section>
  );
}
