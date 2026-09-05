import { NextResponse, type NextRequest } from "next/server";
import { resolvePostAuthDestination } from "@/lib/redirects";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const requestedNext = requestUrl.searchParams.get("next");

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

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login?error=auth_callback", requestUrl.origin));
  }

  const destination = await resolvePostAuthDestination(supabase, user.id, requestedNext);
  return NextResponse.redirect(new URL(destination, requestUrl.origin));
}
