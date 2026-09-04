import { GearClient } from "./GearClient";
import { getGearCatalog } from "@/lib/gear";

export default async function GearPage({ searchParams }: { searchParams: Promise<{ search?: string | string[] }> }) {
  const params = await searchParams;
  const items = await getGearCatalog();
  const initialSearch = typeof params.search === "string" ? params.search.slice(0, 80) : "";

  return (
    <main className="page-light mx-auto min-h-[calc(100vh-57px)] max-w-[1280px] bg-[#fafafa] px-4 py-10 text-zinc-950 sm:px-6">
      <GearClient items={items} initialSearch={initialSearch} />
    </main>
  );
}
