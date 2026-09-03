"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function signOut() {
    setIsLoading(true);

    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } finally {
      router.push("/");
      router.refresh();
      setIsLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={isLoading}
      className="site-icon-btn hidden h-8 items-center gap-2 rounded-md border border-zinc-200 bg-white/70 px-3 text-xs font-medium text-zinc-600 transition duration-200 hover:border-zinc-300 hover:bg-white hover:text-zinc-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/60 disabled:cursor-not-allowed disabled:opacity-60 sm:flex"
    >
      <LogOut size={14} />
      {isLoading ? "Signing out" : "Sign out"}
    </button>
  );
}
