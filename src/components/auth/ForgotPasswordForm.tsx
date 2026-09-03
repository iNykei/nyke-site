"use client";

import { Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toFriendlyAuthError } from "@/lib/auth-errors";
import { createClient } from "@/lib/supabase/client";
import { isValidEmail } from "@/lib/validation";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!isValidEmail(email)) {
      setError("Enter a valid email address.");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      });

      if (resetError) {
        setError(toFriendlyAuthError(resetError.message));
        return;
      }

      setSuccess("Check your email for a password reset link.");
    } catch {
      setError("Supabase is not configured for this environment.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-md border border-zinc-200 bg-white p-6 shadow-xl shadow-zinc-200/70">
      <p className="text-xs uppercase tracking-[0.24em] text-rose-400">Password reset</p>
      <h1 className="mt-3 font-serif text-3xl font-black text-zinc-950">Forgot password?</h1>
      <p className="mt-3 text-sm leading-6 text-zinc-600">Enter your account email and NYKE will send a reset link.</p>
      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <label className="block">
          <span className="text-sm text-zinc-600">Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="player@example.com"
            className="mt-2 h-11 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-950 outline-none transition focus:border-rose-300"
            autoComplete="email"
          />
        </label>
        {error ? <p className="text-sm text-rose-500">{error}</p> : null}
        {success ? <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p> : null}
        <button
          type="submit"
          disabled={isLoading}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-rose-300 text-sm font-semibold text-zinc-950 shadow-lg shadow-rose-200/70 transition hover:bg-rose-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Mail size={16} />
          {isLoading ? "Sending..." : "Send reset link"}
        </button>
      </form>
      <Link href="/login" className="mt-5 inline-block text-sm text-zinc-500 transition hover:text-zinc-950">
        Back to login
      </Link>
    </section>
  );
}
