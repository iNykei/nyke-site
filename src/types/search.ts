export type PlayerSearchResult = {
  username: string;
  displayName: string;
  avatarUrl: string | null;
  region: string | null;
  game: string | null;
  rank: string | null;
};

export type GearSearchResult = {
  brand: string;
  model: string;
  category: string;
  imageUrl: string | null;
  spec: string | null;
};

export type GlobalSearchResponse = {
  players: PlayerSearchResult[];
  gear: GearSearchResult[];
};
