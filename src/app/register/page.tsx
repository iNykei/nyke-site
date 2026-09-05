import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { getSafeRedirectPath, resolvePostAuthDestination } from "@/lib/redirects";
import { createClient } from "@/lib/supabase/server";

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ next?: string | string[] }> }) {
  const params = await searchParams;
  const nextPath = getSafeRedirectPath(Array.isArray(params.next) ? params.next[0] : params.next);
  const supabase = await createClient();
  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) redirect(await resolvePostAuthDestination(supabase, user.id, nextPath));
  }

  return (
    <main className="page-light mx-auto flex min-h-[calc(100vh-57px)] max-w-7xl items-center bg-[#fbfaf8] px-4 py-10 text-zinc-950 sm:px-6 lg:px-8">
      <RegisterForm nextPath={nextPath} />
    </main>
  );
}
