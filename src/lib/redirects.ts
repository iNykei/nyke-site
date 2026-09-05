import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export function getSafeRedirectPath(value: string | null | undefined): string | undefined {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return undefined;
  }

  try {
    const base = new URL("https://nyke.invalid");
    const decoded = decodeURIComponent(value);
    if (decoded.startsWith("//") || decoded.includes("\\") || [...decoded].some((char) => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127)) return undefined;
    const target = new URL(value, base);
    const path = `${target.pathname}${target.search}${target.hash}`;
    return target.origin === base.origin && !path.startsWith("//") ? path : undefined;
  } catch {
    return undefined;
  }
}

// Call after authentication; the user ID must come from Supabase Auth.
export async function resolvePostAuthDestination(
  supabase: SupabaseClient<Database>,
  userId: string,
  requestedNext?: string | null,
): Promise<string> {
  const next = getSafeRedirectPath(requestedNext);
  if (next) return next;

  const [profile, settings] = await Promise.all([
    supabase.from("profiles").select("username").eq("id", userId).maybeSingle(),
    supabase.from("player_settings").select("user_id").eq("user_id", userId).maybeSingle(),
  ]);
  if (profile.error || settings.error) {
    throw new Error("Unable to determine your profile destination. Please try again.");
  }

  return profile.data?.username && settings.data
    ? `/${profile.data.username}`
    : "/settings/profile";
}
