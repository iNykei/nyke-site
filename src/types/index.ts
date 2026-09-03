export type GameTitle = string;

export type GearCategory =
  | "mouse"
  | "mousepad"
  | "keyboard"
  | "monitor"
  | "headset"
  | "skates";

export type GearItem = {
  id: string;
  name: string;
  maker: string;
  category: GearCategory;
  summary: string;
  specs: Record<string, string>;
  accent: string;
};

export type GameSettings = {
  game: GameTitle;
  rank: string;
  dpi: number | null;
  sensitivity: number | null;
  resolution: string;
  pollingRate: string;
};

export type PlayerGear = {
  mouse: GearItem;
  mousepad: GearItem;
  keyboard: GearItem;
  monitor: GearItem;
  headset: GearItem;
  skates: GearItem;
};

export type PlayerProfile = {
  username: string;
  displayName: string;
  avatarUrl?: string;
  avatarSeed: string;
  bio: string;
  region: string;
  role: string;
  team: string;
  status: "online" | "scrimming" | "offline";
  settings: GameSettings;
  gear: PlayerGear;
  highlights: string[];
};

export type ProfileActivity = {
  id: string;
  username: string;
  activity: string;
  relativeTime: string;
};

export type TrendingGearItem = GearItem & {
  profileCount: number;
};
