import type { Metadata } from "next";
import { ExploreClient } from "./ExploreClient";
import { getExploreProfiles } from "@/lib/profiles";

export const metadata: Metadata = {
  title: "Discover FPS Player Profiles, Aim Settings & Gear — NYKE",
  description: "Explore public FPS player profiles, compare aim settings and gear, and discover shareable NYKE Cards.",
  alternates: { canonical: "/explore" },
  openGraph: {
    type: "website",
    title: "Discover FPS Player Profiles, Aim Settings & Gear — NYKE",
    description: "Explore public FPS player profiles, compare aim settings and gear, and discover shareable NYKE Cards.",
    url: "/explore",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Explore FPS player profiles on NYKE" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Discover FPS Player Profiles, Aim Settings & Gear — NYKE",
    description: "Explore public FPS player profiles, compare aim settings and gear, and discover shareable NYKE Cards.",
    images: ["/opengraph-image"],
  },
};

export default async function ExplorePage() {
  const players = await getExploreProfiles();

  return (
    <main className="page-light mx-auto min-h-[calc(100vh-57px)] max-w-[1280px] bg-[#fafafa] px-4 py-10 text-zinc-950 sm:px-6">
      <ExploreClient players={players} />
    </main>
  );
}
