"use client";

import { LogIn } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toFriendlyAuthError } from "@/lib/auth-errors";
import { getSafeRedirectPath, resolvePostAuthDestination } from "@/lib/redirects";
import { createClient } from "@/lib/supabase/client";
import { isValidEmail } from "@/lib/validation";

export function LoginForm({ nextPath, initialError = "" }: { nextPath?: string; initialError?: string }) {
  const next = getSafeRedirectPath(nextPath);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [serverError, setServerError] = useState(initialError);
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldError("");
    setServerError("");

    if (!isValidEmail(email)) {
      setFieldError("Enter a valid email address.");
      return;
    }

    if (!password) {
      setFieldError("Enter your password.");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setServerError(toFriendlyAuthError(error.message));
        return;
      }

      if (!data.session || !data.user) {
        setServerError("We could not establish your session. Please try again.");
        return;
      }

      const destination = await resolvePostAuthDestination(supabase, data.user.id, nextPath);

      // A document navigation starts only after @supabase/ssr has persisted the
      // session cookies, so the next Server Component request sees the user.
      window.location.replace(destination);
    } catch {
      setServerError("Unable to finish signing in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-md border border-zinc-200 bg-white p-6 shadow-xl shadow-zinc-200/70">
      <p className="text-xs uppercase tracking-[0.24em] text-rose-400">NYKE access</p>
      <h1 className="mt-3 font-serif text-3xl font-black text-zinc-950">Login</h1>
      <p className="mt-3 text-sm leading-6 text-zinc-600">Sign in with your email to manage your public profile identity.</p>
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
        <label className="block">
          <span className="text-sm text-zinc-600">Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            className="mt-2 h-11 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-950 outline-none transition focus:border-rose-300"
            autoComplete="current-password"
          />
        </label>
        {fieldError || serverError ? <p className="text-sm text-rose-500">{fieldError || serverError}</p> : null}
        <button
          type="submit"
          disabled={isLoading}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-rose-300 text-sm font-semibold text-zinc-950 shadow-lg shadow-rose-200/70 transition hover:bg-rose-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LogIn size={16} />
          {isLoading ? "Signing in..." : "Continue"}
        </button>
      </form>
      <div className="mt-5 flex items-center justify-between text-sm">
        <Link href="/forgot-password" className="text-zinc-500 transition hover:text-zinc-950">
          Forgot password?
        </Link>
        <Link href={next ? `/register?next=${encodeURIComponent(next)}` : "/register"} className="text-rose-500 transition hover:text-rose-400">
          Create a profile
        </Link>
      </div>
    </section>
  );
}
