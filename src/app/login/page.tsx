import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { getCurrentUserAndProfile } from "@/lib/profiles";
import { getSafeRedirectPath } from "@/lib/redirects";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string | string[]; next?: string | string[] }> }) {
  const { user, profile } = await getCurrentUserAndProfile();
  if (user) redirect(profile ? `/${profile.username}` : "/settings/profile");

  const params = await searchParams;
  const requestedNext = Array.isArray(params.next) ? params.next[0] : params.next;
  const nextPath = requestedNext ? getSafeRedirectPath(requestedNext, "/") : undefined;
  const errorCode = Array.isArray(params.error) ? params.error[0] : params.error;
  const initialError = errorCode === "auth_callback" ? "This sign-in link is invalid or has expired. Please try again." : undefined;

  return (
    <main className="page-light mx-auto flex min-h-[calc(100vh-57px)] max-w-7xl items-center bg-[#fbfaf8] px-4 py-10 text-zinc-950 sm:px-6 lg:px-8">
      <LoginForm nextPath={nextPath} initialError={initialError} />
    </main>
  );
}
