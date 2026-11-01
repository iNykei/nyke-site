import type { Metadata } from "next";
import { GearClient } from "./GearClient";
import { getGearCatalog } from "@/lib/gear";

export const metadata: Metadata = {
  title: "FPS Gaming Gear Database — Mice, Keyboards, Monitors & More | NYKE",
  description: "Browse FPS gaming gear on NYKE, including mice, keyboards, monitors, mousepads and headsets used in competitive setups.",
  alternates: { canonical: "/gear" },
  openGraph: {
    type: "website",
    title: "FPS Gaming Gear Database — NYKE",
    description: "Browse mice, keyboards, monitors, mousepads and headsets for competitive FPS setups.",
    url: "/gear",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "FPS gaming gear database on NYKE" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "FPS Gaming Gear Database — NYKE",
    description: "Browse mice, keyboards, monitors, mousepads and headsets for competitive FPS setups.",
    images: ["/opengraph-image"],
  },
};

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
