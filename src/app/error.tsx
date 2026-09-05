"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") console.error(error);
  }, [error]);

  return (
    <main className="page-light flex min-h-[calc(100vh-57px)] items-center bg-[#fafafa] px-4 py-12 text-zinc-950">
      <section className="mx-auto w-full max-w-md border border-zinc-200 bg-white p-7 text-center shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-rose-500">Something went wrong.</p>
        <h1 className="mt-3 font-serif text-3xl font-black">NYKE couldn&apos;t load this page right now.</h1>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className="rounded-md bg-rose-300 px-4 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-rose-200">Try again</button>
          <Link href="/" className="rounded-md border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 hover:border-zinc-300">Go home</Link>
        </div>
      </section>
    </main>
  );
}
