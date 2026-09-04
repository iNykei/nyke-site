import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { getCurrentUserAndProfile } from "@/lib/profiles";

export default async function RegisterPage() {
  const { user, profile } = await getCurrentUserAndProfile();
  if (user) redirect(profile ? `/${profile.username}` : "/settings/profile");

  return (
    <main className="page-light mx-auto flex min-h-[calc(100vh-57px)] max-w-7xl items-center bg-[#fbfaf8] px-4 py-10 text-zinc-950 sm:px-6 lg:px-8">
      <RegisterForm />
    </main>
  );
}
