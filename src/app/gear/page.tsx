import { GearClient } from "./GearClient";
import { getGearCatalog } from "@/lib/gear";

export default async function GearPage() {
  const items = await getGearCatalog();

  return (
    <main className="page-light mx-auto min-h-[calc(100vh-57px)] max-w-[1280px] bg-[#fafafa] px-4 py-10 text-zinc-950 sm:px-6">
      <GearClient items={items} />
    </main>
  );
}
