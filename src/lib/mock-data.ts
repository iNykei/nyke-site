import type { GearCategory, GearItem, PlayerProfile, ProfileActivity, TrendingGearItem } from "@/types";

export const gearItems: GearItem[] = [
  {
    id: "razer-viper-v3-pro",
    name: "Viper V3 Pro",
    maker: "Razer",
    category: "mouse",
    summary: "Lightweight wireless shape with a tournament-focused sensor package.",
    accent: "from-zinc-700 to-rose-300/60",
    specs: { weight: "54g", sensor: "Focus Pro 35K", connection: "2.4 GHz" },
  },
  {
    id: "logitech-g-pro-x-superlight-2",
    name: "G Pro X Superlight 2",
    maker: "Logitech G",
    category: "mouse",
    summary: "Safe symmetrical shell used across high-level tac FPS setups.",
    accent: "from-zinc-600 to-zinc-300",
    specs: { weight: "60g", sensor: "Hero 2", polling: "4K" },
  },
  {
    id: "zowie-u2-dw",
    name: "U2-DW",
    maker: "ZOWIE",
    category: "mouse",
    summary: "Compact wireless shell with controlled side curves for claw grip.",
    accent: "from-red-400/70 to-zinc-700",
    specs: { weight: "60g", shape: "Symmetrical", connection: "2.4 GHz" },
  },
  {
    id: "artisan-zero-soft-xl",
    name: "Zero Soft XL",
    maker: "ARTISAN",
    category: "mousepad",
    summary: "Control-leaning cloth pad with clean micro-adjustment feedback.",
    accent: "from-zinc-500 to-lime-300/30",
    specs: { size: "490 x 420mm", surface: "Control", base: "Soft" },
  },
  {
    id: "steelseries-qck-heavy",
    name: "QcK Heavy",
    maker: "SteelSeries",
    category: "mousepad",
    summary: "Thick cloth control pad for stable low-sens aim.",
    accent: "from-zinc-800 to-zinc-400",
    specs: { size: "450 x 400mm", surface: "Control", thickness: "6mm" },
  },
  {
    id: "lgg-saturn-pro",
    name: "Saturn Pro",
    maker: "Lethal Gaming Gear",
    category: "mousepad",
    summary: "Balanced surface for tac FPS tracking and flick recovery.",
    accent: "from-emerald-300/70 to-zinc-700",
    specs: { size: "500 x 500mm", surface: "Balanced", base: "Poron" },
  },
  {
    id: "wooting-60he",
    name: "60HE",
    maker: "Wooting",
    category: "keyboard",
    summary: "Analog 60 percent keyboard with rapid trigger tuning.",
    accent: "from-rose-300/70 to-zinc-800",
    specs: { layout: "60%", switch: "Hall effect", feature: "Rapid trigger" },
  },
  {
    id: "drunkdeer-a75",
    name: "A75",
    maker: "DrunkDeer",
    category: "keyboard",
    summary: "Hall effect keyboard with compact arrow-key layout.",
    accent: "from-rose-200/70 to-zinc-800",
    specs: { layout: "75%", switch: "Magnetic", polling: "8K" },
  },
  {
    id: "asus-xg27acdng",
    name: "XG27ACDNG",
    maker: "ASUS",
    category: "monitor",
    summary: "High-refresh OLED display tuned for competitive clarity.",
    accent: "from-zinc-600 to-lime-200/60",
    specs: { size: "27 in", refresh: "360 Hz", panel: "OLED" },
  },
  {
    id: "zowie-xl2566k",
    name: "XL2566K",
    maker: "ZOWIE",
    category: "monitor",
    summary: "24.5-inch esports monitor with motion clarity modes.",
    accent: "from-red-300/70 to-zinc-800",
    specs: { size: "24.5 in", refresh: "360 Hz", panel: "TN" },
  },
  {
    id: "hyperx-cloud-iii",
    name: "Cloud III",
    maker: "HyperX",
    category: "headset",
    summary: "Closed-back headset with simple positional audio tuning.",
    accent: "from-red-300/60 to-zinc-700",
    specs: { type: "Closed back", mic: "Detachable", weight: "320g" },
  },
  {
    id: "g-pro-x-2-headset",
    name: "Pro X 2",
    maker: "Logitech G",
    category: "headset",
    summary: "Wireless headset with familiar esports fit.",
    accent: "from-zinc-500 to-lime-300/40",
    specs: { type: "Wireless", driver: "Graphene", weight: "345g" },
  },
  {
    id: "corepad-pro-dots",
    name: "Pro Dots",
    maker: "Corepad",
    category: "skates",
    summary: "PTFE dot skates for custom glide and base coverage.",
    accent: "from-white to-zinc-400",
    specs: { material: "PTFE", style: "Dots", pack: "40 pcs" },
  },
  {
    id: "tiger-ice-v2",
    name: "ICE V2",
    maker: "Esports Tiger",
    category: "skates",
    summary: "Fast replacement skates for low-friction pad movement.",
    accent: "from-lime-200 to-zinc-600",
    specs: { material: "PTFE", style: "Full fit", glide: "Fast" },
  },
];

const gearById = Object.fromEntries(gearItems.map((item) => [item.id, item])) as Record<string, GearItem>;

function gear(id: string) {
  return gearById[id];
}

export const players: PlayerProfile[] = [
  {
    username: "cyx",
    displayName: "cyx",
    avatarSeed: "CX",
    bio: "Student, editor, and FPS player turning old NYKELIFE energy into a public aim profile.",
    region: "CN",
    role: "Flex",
    team: "Unsigned",
    status: "online",
    settings: {
      game: "VALORANT",
      rank: "Immortal",
      dpi: 800,
      sensitivity: 0.3,
      resolution: "2560 x 1440",
      pollingRate: "8000 Hz",
    },
    gear: {
      mouse: gear("razer-viper-v3-pro"),
      mousepad: gear("artisan-zero-soft-xl"),
      keyboard: gear("wooting-60he"),
      monitor: gear("asus-xg27acdng"),
      headset: gear("hyperx-cloud-iii"),
      skates: gear("corepad-pro-dots"),
    },
    highlights: ["VALORANT pressure plays", "240 eDPI baseline", "NYKELIFE clips and setup notes"],
  },
  {
    username: "nova",
    displayName: "Nova",
    avatarSeed: "NV",
    bio: "Entry aimer focused on clean first-contact mechanics and low-noise setups.",
    region: "NA",
    role: "Duelist",
    team: "Unsigned",
    status: "online",
    settings: { game: "VALORANT", rank: "Radiant", dpi: 800, sensitivity: 0.32, resolution: "1920 x 1080", pollingRate: "4000 Hz" },
    gear: { mouse: gear("razer-viper-v3-pro"), mousepad: gear("artisan-zero-soft-xl"), keyboard: gear("wooting-60he"), monitor: gear("zowie-xl2566k"), headset: gear("g-pro-x-2-headset"), skates: gear("tiger-ice-v2") },
    highlights: ["High impact opener", "Low sensitivity control", "VOD review routine"],
  },
  {
    username: "vex",
    displayName: "Vex",
    avatarSeed: "VX",
    bio: "Sentinel player cataloging compact gear and repeatable crosshair placement.",
    region: "EU",
    role: "Sentinel",
    team: "Free agent",
    status: "scrimming",
    settings: { game: "VALORANT", rank: "Immortal 3", dpi: 1600, sensitivity: 0.18, resolution: "1728 x 1080", pollingRate: "8000 Hz" },
    gear: { mouse: gear("logitech-g-pro-x-superlight-2"), mousepad: gear("lgg-saturn-pro"), keyboard: gear("drunkdeer-a75"), monitor: gear("asus-xg27acdng"), headset: gear("hyperx-cloud-iii"), skates: gear("corepad-pro-dots") },
    highlights: ["Anchor utility", "Hybrid pad testing", "Fast keyboard tuning"],
  },
  {
    username: "orbit",
    displayName: "Orbit",
    avatarSeed: "OB",
    bio: "Controller main sharing practical setups for ranked consistency.",
    region: "APAC",
    role: "Controller",
    team: "Community",
    status: "offline",
    settings: { game: "VALORANT", rank: "Ascendant 2", dpi: 800, sensitivity: 0.41, resolution: "1920 x 1080", pollingRate: "1000 Hz" },
    gear: { mouse: gear("zowie-u2-dw"), mousepad: gear("steelseries-qck-heavy"), keyboard: gear("wooting-60he"), monitor: gear("zowie-xl2566k"), headset: gear("hyperx-cloud-iii"), skates: gear("tiger-ice-v2") },
    highlights: ["Lineup library", "Consistent warmup", "Desk fit notes"],
  },
  {
    username: "mako",
    displayName: "Mako",
    avatarSeed: "MK",
    bio: "Calm mid-round controller with measured sens and classic monitor preferences.",
    region: "KR",
    role: "Controller",
    team: "Trial",
    status: "online",
    settings: { game: "VALORANT", rank: "Radiant", dpi: 400, sensitivity: 0.58, resolution: "1920 x 1080", pollingRate: "4000 Hz" },
    gear: { mouse: gear("logitech-g-pro-x-superlight-2"), mousepad: gear("artisan-zero-soft-xl"), keyboard: gear("wooting-60he"), monitor: gear("zowie-xl2566k"), headset: gear("g-pro-x-2-headset"), skates: gear("corepad-pro-dots") },
    highlights: ["Low-noise crosshair", "Utility timing", "Control pad notes"],
  },
  {
    username: "sable",
    displayName: "Sable",
    avatarSeed: "SB",
    bio: "EU initiator comparing magnetic boards and balanced pads.",
    region: "EU",
    role: "Initiator",
    team: "Community",
    status: "scrimming",
    settings: { game: "VALORANT", rank: "Immortal 2", dpi: 800, sensitivity: 0.27, resolution: "1920 x 1080", pollingRate: "2000 Hz" },
    gear: { mouse: gear("razer-viper-v3-pro"), mousepad: gear("lgg-saturn-pro"), keyboard: gear("drunkdeer-a75"), monitor: gear("asus-xg27acdng"), headset: gear("hyperx-cloud-iii"), skates: gear("corepad-pro-dots") },
    highlights: ["Flash timing", "Balanced sens", "Magnetic actuation"],
  },
  {
    username: "rune",
    displayName: "Rune",
    avatarSeed: "RN",
    bio: "NA Chamber specialist testing faster skates on control cloth.",
    region: "NA",
    role: "Sentinel",
    team: "Unsigned",
    status: "offline",
    settings: { game: "VALORANT", rank: "Immortal", dpi: 800, sensitivity: 0.36, resolution: "1440 x 1080", pollingRate: "4000 Hz" },
    gear: { mouse: gear("zowie-u2-dw"), mousepad: gear("steelseries-qck-heavy"), keyboard: gear("wooting-60he"), monitor: gear("zowie-xl2566k"), headset: gear("g-pro-x-2-headset"), skates: gear("tiger-ice-v2") },
    highlights: ["Operator angles", "Fast skate notes", "4:3 stretch"],
  },
  {
    username: "pixel",
    displayName: "Pixel",
    avatarSeed: "PX",
    bio: "APAC ranked grinder documenting fingertip mouse fit and OLED motion clarity.",
    region: "APAC",
    role: "Duelist",
    team: "Community",
    status: "online",
    settings: { game: "VALORANT", rank: "Ascendant 3", dpi: 1600, sensitivity: 0.15, resolution: "2560 x 1440", pollingRate: "8000 Hz" },
    gear: { mouse: gear("razer-viper-v3-pro"), mousepad: gear("lgg-saturn-pro"), keyboard: gear("wooting-60he"), monitor: gear("asus-xg27acdng"), headset: gear("hyperx-cloud-iii"), skates: gear("corepad-pro-dots") },
    highlights: ["Fingertip notes", "OLED review", "Daily ranked log"],
  },
  {
    username: "stride",
    displayName: "Stride",
    avatarSeed: "ST",
    bio: "CS2 rifler keeping a simple 400 DPI desk setup.",
    region: "NA",
    role: "Rifler",
    team: "Community",
    status: "scrimming",
    settings: { game: "Counter-Strike 2", rank: "Faceit 10", dpi: 400, sensitivity: 1.9, resolution: "1280 x 960", pollingRate: "1000 Hz" },
    gear: { mouse: gear("logitech-g-pro-x-superlight-2"), mousepad: gear("steelseries-qck-heavy"), keyboard: gear("wooting-60he"), monitor: gear("zowie-xl2566k"), headset: gear("hyperx-cloud-iii"), skates: gear("tiger-ice-v2") },
    highlights: ["Rifle mechanics", "Classic resolution", "Cloth control"],
  },
  {
    username: "lynx",
    displayName: "Lynx",
    avatarSeed: "LX",
    bio: "Apex controller-to-mouse convert with fast pad experiments.",
    region: "EU",
    role: "Fragger",
    team: "Free agent",
    status: "online",
    settings: { game: "Apex Legends", rank: "Masters", dpi: 800, sensitivity: 1.25, resolution: "1920 x 1080", pollingRate: "4000 Hz" },
    gear: { mouse: gear("razer-viper-v3-pro"), mousepad: gear("lgg-saturn-pro"), keyboard: gear("drunkdeer-a75"), monitor: gear("asus-xg27acdng"), headset: gear("g-pro-x-2-headset"), skates: gear("corepad-pro-dots") },
    highlights: ["Tracking routines", "Fast pad testing", "Wide FOV notes"],
  },
  {
    username: "frost",
    displayName: "Frost",
    avatarSeed: "FR",
    bio: "KR duelist using low eDPI for disciplined burst control.",
    region: "KR",
    role: "Duelist",
    team: "Unsigned",
    status: "offline",
    settings: { game: "VALORANT", rank: "Immortal 1", dpi: 800, sensitivity: 0.25, resolution: "1920 x 1080", pollingRate: "2000 Hz" },
    gear: { mouse: gear("zowie-u2-dw"), mousepad: gear("artisan-zero-soft-xl"), keyboard: gear("wooting-60he"), monitor: gear("zowie-xl2566k"), headset: gear("hyperx-cloud-iii"), skates: gear("corepad-pro-dots") },
    highlights: ["Burst discipline", "Low eDPI", "Warmup benchmarks"],
  },
  {
    username: "echo",
    displayName: "Echo",
    avatarSeed: "EC",
    bio: "NA initiator logging ergonomic changes across scrim blocks.",
    region: "NA",
    role: "Initiator",
    team: "Academy",
    status: "online",
    settings: { game: "VALORANT", rank: "Immortal 2", dpi: 800, sensitivity: 0.29, resolution: "1920 x 1080", pollingRate: "8000 Hz" },
    gear: { mouse: gear("logitech-g-pro-x-superlight-2"), mousepad: gear("lgg-saturn-pro"), keyboard: gear("drunkdeer-a75"), monitor: gear("asus-xg27acdng"), headset: gear("g-pro-x-2-headset"), skates: gear("tiger-ice-v2") },
    highlights: ["Scrim notes", "Ergonomic changes", "8K polling"],
  },
  {
    username: "kai",
    displayName: "Kai",
    avatarSeed: "KI",
    bio: "CN sentinel comparing stretched resolution with modern OLED panels.",
    region: "CN",
    role: "Sentinel",
    team: "Community",
    status: "scrimming",
    settings: { game: "VALORANT", rank: "Ascendant 3", dpi: 1600, sensitivity: 0.14, resolution: "1680 x 1050", pollingRate: "4000 Hz" },
    gear: { mouse: gear("razer-viper-v3-pro"), mousepad: gear("artisan-zero-soft-xl"), keyboard: gear("wooting-60he"), monitor: gear("asus-xg27acdng"), headset: gear("hyperx-cloud-iii"), skates: gear("corepad-pro-dots") },
    highlights: ["Stretched res", "OLED comparison", "Trap setups"],
  },
  {
    username: "mono",
    displayName: "Mono",
    avatarSeed: "MO",
    bio: "Overwatch hitscan player keeping a cross-game profile for aim transfer.",
    region: "EU",
    role: "Hitscan",
    team: "Community",
    status: "online",
    settings: { game: "Overwatch 2", rank: "Grandmaster", dpi: 800, sensitivity: 4.2, resolution: "1920 x 1080", pollingRate: "4000 Hz" },
    gear: { mouse: gear("logitech-g-pro-x-superlight-2"), mousepad: gear("lgg-saturn-pro"), keyboard: gear("drunkdeer-a75"), monitor: gear("asus-xg27acdng"), headset: gear("g-pro-x-2-headset"), skates: gear("corepad-pro-dots") },
    highlights: ["Hitscan transfer", "Tracking focus", "Compact board"],
  },
  {
    username: "zero",
    displayName: "Zero",
    avatarSeed: "Z0",
    bio: "APAC sentinel prioritizing desk consistency and stable stopping power.",
    region: "APAC",
    role: "Sentinel",
    team: "Unsigned",
    status: "offline",
    settings: { game: "VALORANT", rank: "Diamond 3", dpi: 800, sensitivity: 0.34, resolution: "1920 x 1080", pollingRate: "1000 Hz" },
    gear: { mouse: gear("zowie-u2-dw"), mousepad: gear("steelseries-qck-heavy"), keyboard: gear("wooting-60he"), monitor: gear("zowie-xl2566k"), headset: gear("hyperx-cloud-iii"), skates: gear("tiger-ice-v2") },
    highlights: ["Desk consistency", "Stop control", "Ranked review"],
  },
  {
    username: "asher",
    displayName: "Asher",
    avatarSeed: "AS",
    bio: "NA flex player testing low-latency gear with mid sens.",
    region: "NA",
    role: "Flex",
    team: "Trial",
    status: "scrimming",
    settings: { game: "VALORANT", rank: "Immortal 1", dpi: 800, sensitivity: 0.31, resolution: "1920 x 1080", pollingRate: "8000 Hz" },
    gear: { mouse: gear("razer-viper-v3-pro"), mousepad: gear("artisan-zero-soft-xl"), keyboard: gear("wooting-60he"), monitor: gear("asus-xg27acdng"), headset: gear("g-pro-x-2-headset"), skates: gear("corepad-pro-dots") },
    highlights: ["Mid sens", "Latency tests", "Flex utility"],
  },
];

const activityCopy = [
  "updated sensitivity",
  "published a new profile",
  "changed mouse",
  "added monitor notes",
  "updated keyboard actuation",
  "refreshed gear stack",
  "logged rank change",
  "added desk setup notes",
  "updated polling rate",
  "shared resolution settings",
];

export const profileActivities: ProfileActivity[] = Array.from({ length: 28 }, (_, index) => {
  const player = players[index % players.length];
  return {
    id: `activity-${index + 1}`,
    username: player.username,
    activity: activityCopy[index % activityCopy.length],
    source: "demo",
    relativeTime:
      index < 6
        ? `${index + 2}m ago`
        : index < 14
          ? `${index - 3}h ago`
          : `${index - 12}d ago`,
  };
});

export function getPlayerByUsername(username: string) {
  return players.find((player) => player.username.toLowerCase() === username.toLowerCase());
}

export function getTrendingGear(categories: GearCategory[]): TrendingGearItem[] {
  const counts = getGearProfileCounts();

  return categories
    .map((category) =>
      gearItems
        .filter((item) => item.category === category)
        .map((item) => ({ ...item, profileCount: counts.get(item.id) ?? 0 }))
        .sort((a, b) => b.profileCount - a.profileCount)[0],
    )
    .filter(Boolean);
}

export function getGearProfileCounts() {
  const counts = new Map<string, number>();

  players.forEach((player) => {
    Object.values(player.gear).forEach((item) => {
      counts.set(item.id, (counts.get(item.id) ?? 0) + 1);
    });
  });

  return counts;
}
