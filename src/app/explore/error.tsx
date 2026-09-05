"use client";

import { useEffect } from "react";

type ExploreErrorProps = {
  error: Error & { digest?: string };
  retry: () => void;
};

export default function ExploreError({ error, retry }: ExploreErrorProps) {
  useEffect(() => {
    console.error("Explore could not be loaded.", error.digest ?? "no-digest");
  }, [error]);

  return (
    <main className="page-light mx-auto min-h-[calc(100vh-57px)] max-w-[1280px] bg-[#fafafa] px-4 py-10 text-zinc-950 sm:px-6">
      <h1 className="text-[30px] font-bold leading-9 sm:text-4xl sm:leading-10">Explore</h1>
      <section className="mt-8 rounded-xl border border-zinc-200 bg-white px-6 py-12 text-center">
        <h2 className="text-base font-semibold">Players are unavailable right now.</h2>
        <p className="mt-2 text-sm text-zinc-500">Please try loading the directory again.</p>
        <button type="button" onClick={retry} className="mt-5 h-9 rounded-md border border-zinc-300 bg-white px-4 text-sm font-semibold transition hover:border-zinc-400 hover:bg-zinc-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/60">
          Try again
        </button>
      </section>
    </main>
  );
}
