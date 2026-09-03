export type ProfileRow = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  region: string | null;
  created_at: string;
  updated_at: string;
};

export type PlayerSettingsRow = {
  id: string;
  user_id: string;
  game: string | null;
  rank: string | null;
  dpi: number | null;
  sensitivity: number | null;
  resolution: string | null;
  polling_rate: number | null;
  created_at: string;
  updated_at: string;
};

export type GearItemRow = {
  id: string;
  brand: string;
  model: string;
  category: string;
  created_at: string;
};

export type PlayerGearRow = {
  id: string;
  user_id: string;
  gear_item_id: string;
  category: string;
  is_active: boolean;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: {
          id: string;
          username: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          region?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<ProfileRow, "id" | "created_at">>;
        Relationships: [];
      };
      player_settings: {
        Row: PlayerSettingsRow;
        Insert: {
          id?: string;
          user_id: string;
          game?: string | null;
          rank?: string | null;
          dpi?: number | null;
          sensitivity?: number | null;
          resolution?: string | null;
          polling_rate?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<PlayerSettingsRow, "id" | "user_id" | "created_at">>;
        Relationships: [];
      };
      gear_items: {
        Row: GearItemRow;
        Insert: {
          id?: string;
          brand: string;
          model: string;
          category: string;
          created_at?: string;
        };
        Update: Partial<Omit<GearItemRow, "id" | "created_at">>;
        Relationships: [];
      };
      player_gear: {
        Row: PlayerGearRow;
        Insert: {
          id?: string;
          user_id: string;
          gear_item_id: string;
          category: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: Partial<Omit<PlayerGearRow, "id" | "user_id" | "created_at">>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
