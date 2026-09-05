import { getSupabaseEnv } from "./supabase/config";

export const dataClientStatus = {
  enabled: getSupabaseEnv().isConfigured,
  reason: getSupabaseEnv().isConfigured
    ? "Supabase Auth and profile identity are configured."
    : "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable Supabase Auth.",
};
