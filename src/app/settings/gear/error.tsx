"use client";

import { RotateCcw } from "lucide-react";

export default function GearSettingsError({ reset }: { reset: () => void }) {
  return (
    <main className="page-light min-h-[60vh] px-4 py-16 text-center">
      <h1 className="font-serif text-2xl font-bold text-zinc-950">My Gear</h1>
      <p className="mt-3 text-sm text-zinc-600">Your gear collection is unavailable right now.</p>
      <button onClick={reset} className="mt-5 inline-flex items-center gap-2 rounded-md border border-zinc-200 px-4 py-2 text-sm"><RotateCcw size={14} />Try again</button>
    </main>
  );
}
