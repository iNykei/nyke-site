"use client";

import { UserPlus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toFriendlyAuthError } from "@/lib/auth-errors";
import { getSafeRedirectPath, resolvePostAuthDestination } from "@/lib/redirects";
import { createClient } from "@/lib/supabase/client";
import { isReservedUsername, isValidEmail, isValidUsername, normalizeUsername } from "@/lib/validation";

const minPasswordLength = 8;

export function RegisterForm({ nextPath }: { nextPath?: string }) {
  const next = getSafeRedirectPath(nextPath);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldError("");
    setServerError("");
    setSuccessMessage("");

    const normalizedUsername = normalizeUsername(username);

    if (!isValidEmail(email)) {
      setFieldError("Enter a valid email address.");
      return;
    }

    if (isReservedUsername(normalizedUsername)) {
      setFieldError("That username is reserved. Choose another username.");
      return;
    }

    if (!isValidUsername(normalizedUsername)) {
      setFieldError("Username must be 3-20 characters and use lowercase letters, numbers, underscore, or hyphen.");
      return;
    }

    if (password.length < minPasswordLength) {
      setFieldError(`Password must be at least ${minPasswordLength} characters.`);
      return;
    }

    if (password !== confirmPassword) {
      setFieldError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", normalizedUsername)
        .maybeSingle();

      if (existingProfile) {
        setServerError("That username is already taken.");
        return;
      }

      const origin = window.location.origin;
      const callback = new URL("/auth/callback", origin);
      if (next) callback.searchParams.set("next", next);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: callback.toString(),
          data: {
            username: normalizedUsername,
            display_name: normalizedUsername,
            avatar_url: "",
            bio: "",
            region: "",
          },
        },
      });

      if (error) {
        setServerError(toFriendlyAuthError(error.message));
        return;
      }

      if (!data.session) {
        setSuccessMessage("Check your email to confirm your account before signing in.");
        return;
      }

      window.location.replace(await resolvePostAuthDestination(supabase, data.session.user.id, nextPath));
    } catch {
      setServerError("Unable to finish creating your account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-lg border border-zinc-200 bg-white p-6 shadow-xl shadow-zinc-200/70">
      <p className="text-xs uppercase tracking-[0.24em] text-rose-400">NYKE profile</p>
      <h1 className="mt-3 font-serif text-3xl font-black text-zinc-950">Create your player page</h1>
      <p className="mt-3 text-sm leading-6 text-zinc-600">Create an email account and reserve your public NYKE username.</p>
      <form className="mt-6 grid gap-4" onSubmit={onSubmit}>
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
          <span className="text-sm text-zinc-600">Username</span>
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value.toLowerCase())}
            placeholder="cyx"
            className="mt-2 h-11 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-950 outline-none transition focus:border-rose-300"
            autoComplete="username"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm text-zinc-600">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              className="mt-2 h-11 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-950 outline-none transition focus:border-rose-300"
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
              className="mt-2 h-11 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-950 outline-none transition focus:border-rose-300"
              autoComplete="new-password"
            />
          </label>
        </div>
        {fieldError || serverError ? <p className="text-sm text-rose-500">{fieldError || serverError}</p> : null}
        {successMessage ? <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{successMessage}</p> : null}
        <button
          type="submit"
          disabled={isLoading}
          className="flex h-11 items-center justify-center gap-2 rounded-md bg-rose-300 text-sm font-semibold text-zinc-950 shadow-lg shadow-rose-200/70 transition hover:bg-rose-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <UserPlus size={16} />
          {isLoading ? "Creating account..." : "Create account"}
        </button>
      </form>
      <p className="mt-5 text-sm text-zinc-500">
        Already have a page?{" "}
        <Link href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"} className="text-rose-500 transition hover:text-rose-400">
          Login
        </Link>
      </p>
    </section>
  );
}
