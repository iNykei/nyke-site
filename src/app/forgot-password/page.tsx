import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <main className="page-light mx-auto flex min-h-[calc(100vh-57px)] max-w-7xl items-center bg-[#fbfaf8] px-4 py-10 text-zinc-950 sm:px-6 lg:px-8">
      <ForgotPasswordForm />
    </main>
  );
}
