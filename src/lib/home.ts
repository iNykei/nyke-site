import { getGearCatalog } from "@/lib/gear";
import { getCurrentUserAndProfile, getExploreProfiles, type PublicProfileData } from "@/lib/profiles";
import type { GearCatalogItem, GearItem, PlayerProfile } from "@/types";

export type HomeStats = {
  players: number;
  gear: number;
  regions: number;
  games: number;
};

export type HomeData = {
  featuredProfiles: PlayerProfile[];
  recentProfiles: PlayerProfile[];
  streamProfiles: PlayerProfile[];
  popularGear: GearCatalogItem[];
  stats: HomeStats;
  cardShowcase: Pick<PublicProfileData, "player" | "activeGear"> | null;
  gearHeading: "Popular gear" | "Explore gear";
  viewerUsername: string | null;
  errors: {
    profiles: boolean;
    gear: boolean;
  };
};

function configuredGear(player: PlayerProfile): GearItem[] {
  return Object.values(player.gear).filter((item) => !item.id.startsWith("not-configured-"));
}

function completenessScore(player: PlayerProfile) {
  const aimConfigured = player.settings.dpi !== null && player.settings.sensitivity !== null;

  return [
    player.avatarUrl ? 2 : 0,
    player.bannerUrl ? 2 : 0,
    player.settings.game ? 1 : 0,
    player.settings.rank ? 1 : 0,
    aimConfigured ? 2 : 0,
    Math.min(3, configuredGear(player).length),
  ].reduce((total, value) => total + value, 0);
}

function uniqueValueCount(values: string[]) {
  return new Set(values.map((value) => value.trim().toLocaleLowerCase()).filter(Boolean)).size;
}

export async function getHomeData(): Promise<HomeData> {
  const [profilesResult, gearResult, viewerResult] = await Promise.allSettled([
    getExploreProfiles({ includeBadges: true }),
    getGearCatalog(),
    getCurrentUserAndProfile(),
  ]);
  const profiles = profilesResult.status === "fulfilled" ? profilesResult.value : [];
  const gear = gearResult.status === "fulfilled" ? gearResult.value : [];
  const rankedProfiles = profiles
    .map((player, recentIndex) => ({ player, recentIndex, score: completenessScore(player) }))
    .sort((left, right) => right.score - left.score || left.recentIndex - right.recentIndex);
  const cardPlayer = rankedProfiles[0]?.player ?? null;
  const popularGear = [...gear]
    .sort((left, right) => right.profileCount - left.profileCount || `${left.maker} ${left.name}`.localeCompare(`${right.maker} ${right.name}`))
    .slice(0, 4);

  return {
    featuredProfiles: rankedProfiles.slice(0, 8).map(({ player }) => player),
    recentProfiles: profiles.slice(0, 8),
    streamProfiles: profiles.slice(0, 16),
    popularGear,
    stats: {
      players: profiles.length,
      gear: gear.length,
      regions: uniqueValueCount(profiles.map((player) => player.region)),
      games: uniqueValueCount(profiles.map((player) => player.settings.game)),
    },
    cardShowcase: cardPlayer ? { player: cardPlayer, activeGear: configuredGear(cardPlayer) } : null,
    gearHeading: gear.some((item) => item.profileCount > 0) ? "Popular gear" : "Explore gear",
    viewerUsername: viewerResult.status === "fulfilled" ? viewerResult.value.profile?.username ?? null : null,
    errors: {
      profiles: profilesResult.status === "rejected",
      gear: gearResult.status === "rejected",
    },
  };
}
