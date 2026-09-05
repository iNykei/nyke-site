import { redirect } from "next/navigation";
import { GearManager } from "@/components/gear/GearManager";
import { getGearManagerData } from "@/lib/profiles";

export default async function SettingsGearPage() {
  const data = await getGearManagerData();
  if (!data) redirect("/login?next=%2Fsettings%2Fgear");
  return (
    <main className="page-light min-h-[calc(100vh-57px)] bg-[#fafafa] px-4 py-8 text-zinc-950 sm:px-6 sm:py-10 lg:px-8">
      <GearManager data={data} />
    </main>
  );
}
