import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUserAndProfile } from "@/lib/profiles";
import { getSafeRedirectPath } from "@/lib/redirects";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const requestedNext = requestUrl.searchParams.get("next");
  const next = getSafeRedirectPath(requestedNext, "/");

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=auth_callback", requestUrl.origin));
  }

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.redirect(new URL("/login?error=auth_callback", requestUrl.origin));
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(new URL("/login?error=auth_callback", requestUrl.origin));
  }

  if (requestedNext) {
    return NextResponse.redirect(new URL(next, requestUrl.origin));
  }

  const { user, profile } = await getCurrentUserAndProfile(supabase);
  if (!user || !profile) {
    return NextResponse.redirect(new URL("/settings/profile", requestUrl.origin));
  }

  const { data: settings } = await supabase.from("player_settings").select("user_id").eq("user_id", user.id).maybeSingle();
  const destination = settings ? `/${profile.username}` : "/settings/profile";
  return NextResponse.redirect(new URL(destination, requestUrl.origin));
}
