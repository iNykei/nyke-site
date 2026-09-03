"use client";

import { KeyRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toFriendlyAuthError } from "@/lib/auth-errors";
import { createClient } from "@/lib/supabase/client";

const minPasswordLength = 8;

export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (password.length < minPasswordLength) {
      setError(`Password must be at least ${minPasswordLength} characters.`);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setError(toFriendlyAuthError(updateError.message));
        return;
      }

      setSuccess("Password updated. Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
        router.refresh();
      }, 900);
    } catch {
      setError("Supabase is not configured for this environment.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-md border border-zinc-200 bg-white p-6 shadow-xl shadow-zinc-200/70">
      <p className="text-xs uppercase tracking-[0.24em] text-rose-400">New password</p>
      <h1 className="mt-3 font-serif text-3xl font-black text-zinc-950">Reset password</h1>
      <p className="mt-3 text-sm leading-6 text-zinc-600">Choose a new password for your NYKE account.</p>
      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <label className="block">
          <span className="text-sm text-zinc-600">Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            className="mt-2 h-11 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-950 outline-none transition focus:border-cyan-300"
            autoComplete="new-password"
          />
        </label>
        <label className="block">
          <span className="text-sm text-zinc-600">Confirm password</span>
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="••••••••"
            className="mt-2 h-11 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-950 outline-none transition focus:border-cyan-300"
            autoComplete="new-password"
          />
        </label>
        {error ? <p className="text-sm text-rose-500">{error}</p> : null}
        {success ? <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p> : null}
        <button
          type="submit"
          disabled={isLoading}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-rose-300 text-sm font-semibold text-zinc-950 shadow-lg shadow-rose-200/70 transition hover:bg-rose-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <KeyRound size={16} />
          {isLoading ? "Updating..." : "Update password"}
        </button>
      </form>
      <Link href="/login" className="mt-5 inline-block text-sm text-zinc-500 transition hover:text-zinc-950">
        Back to login
      </Link>
    </section>
  );
}
