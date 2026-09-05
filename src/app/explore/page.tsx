import { ExploreClient } from "./ExploreClient";
import { getExploreProfiles } from "@/lib/profiles";

export default async function ExplorePage() {
  const players = await getExploreProfiles();

  return (
    <main className="page-light mx-auto min-h-[calc(100vh-57px)] max-w-[1280px] bg-[#fafafa] px-4 py-10 text-zinc-950 sm:px-6">
      <ExploreClient players={players} />
    </main>
  );
}
