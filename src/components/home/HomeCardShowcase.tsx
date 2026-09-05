import Link from "next/link";
import { NYKECard } from "@/components/card/NYKECard";
import type { PublicProfileData } from "@/lib/profiles";
import type { GearCategory, GearItem, PlayerProfile } from "@/types";

type HomeCardShowcaseProps = {
  data: Pick<PublicProfileData, "player" | "activeGear"> | null;
};

function emptyGear(category: GearCategory): GearItem {
  return {
    id: `not-configured-${category}`,
    name: "Not configured",
    maker: "--",
    category,
    summary: "",
    specs: {},
    accent: "from-zinc-100 to-zinc-200",
  };
}

const neutralPlayer: PlayerProfile = {
  username: "your-name",
  displayName: "Your profile",
  memberNumber: null,
  badges: [],
  avatarSeed: "NY",
  bio: "",
  region: "",
  role: "Player",
  team: "Independent",
  status: "offline",
  settings: {
    game: "",
    rank: "",
    dpi: null,
    sensitivity: null,
    resolution: "",
    pollingRate: "",
  },
  gear: {
    mouse: emptyGear("mouse"),
    mousepad: emptyGear("mousepad"),
    keyboard: emptyGear("keyboard"),
    monitor: emptyGear("monitor"),
    headset: emptyGear("headset"),
    skates: emptyGear("skates"),
  },
  highlights: [],
};

export function HomeCardShowcase({ data }: HomeCardShowcaseProps) {
  const cardData = data ?? { player: neutralPlayer, activeGear: [] };

  return (
    <div className="mx-auto w-full max-w-[440px] min-w-0">
      <NYKECard data={cardData} />
      <div className="mt-4 flex items-center justify-center text-xs text-zinc-500">
        {data ? (
          <Link
            href={`/${data.player.username}/card`}
            className="rounded-sm transition hover:text-zinc-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/70"
          >
            View @{data.player.username}&apos;s Card
          </Link>
        ) : (
          <span>Your profile becomes a shareable Card.</span>
        )}
      </div>
    </div>
  );
}
