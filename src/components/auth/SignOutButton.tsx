"use client";

import { LogOut } from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type SignOutButtonProps = {
  mobile?: boolean;
};

export function SignOutButton({ mobile = false }: SignOutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function signOut() {
    setIsLoading(true);

    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } finally {
      window.location.replace("/");
    }
  }

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={isLoading}
      className={mobile
        ? "flex h-10 w-full items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 transition hover:border-zinc-300 hover:text-zinc-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/60 disabled:cursor-not-allowed disabled:opacity-60"
        : "site-icon-btn hidden h-8 items-center gap-2 rounded-md border border-zinc-200 bg-white/70 px-3 text-xs font-medium text-zinc-600 transition duration-200 hover:border-zinc-300 hover:bg-white hover:text-zinc-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/60 disabled:cursor-not-allowed disabled:opacity-60 sm:flex"}
    >
      <LogOut size={14} />
      {isLoading ? "Signing out" : "Sign out"}
    </button>
  );
}
