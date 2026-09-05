import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { getSafeRedirectPath, resolvePostAuthDestination } from "@/lib/redirects";
import { createClient } from "@/lib/supabase/server";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string | string[]; next?: string | string[] }> }) {
  const params = await searchParams;
  const requestedNext = Array.isArray(params.next) ? params.next[0] : params.next;
  const nextPath = getSafeRedirectPath(requestedNext);
  const supabase = await createClient();
  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) redirect(await resolvePostAuthDestination(supabase, user.id, nextPath));
  }
  const errorCode = Array.isArray(params.error) ? params.error[0] : params.error;
  const initialError = errorCode === "auth_callback" ? "This sign-in link is invalid or has expired. Please try again." : undefined;

  return (
    <main className="page-light mx-auto flex min-h-[calc(100vh-57px)] max-w-7xl items-center bg-[#fbfaf8] px-4 py-10 text-zinc-950 sm:px-6 lg:px-8">
      <LoginForm nextPath={nextPath} initialError={initialError} />
    </main>
  );
}
