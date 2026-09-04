import type { Metadata } from "next";
import { CardActions } from "@/components/card/CardActions";
import { getCachedPublicProfileData } from "@/lib/profiles";

type PlayerCardPageProps = {
  params: Promise<{ username: string }>;
};

export async function generateMetadata({ params }: PlayerCardPageProps): Promise<Metadata> {
  const { username } = await params;
  const data = await getCachedPublicProfileData(username);
  if (!data) return { title: "Card not found — NYKE", robots: { index: false, follow: false } };

  const title = `@${data.player.username}'s NYKE Card — NYKE`;
  const description = "Aim settings, gear and player identity on NYKE.";
  return {
    title,
    description,
    alternates: { canonical: `/${data.player.username}/card` },
    openGraph: { title, description, url: `/${data.player.username}/card` },
    twitter: { card: "summary_large_image", title, description },
  };
}

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
