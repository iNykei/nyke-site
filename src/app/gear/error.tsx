"use client";

export default function GearError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="page-light mx-auto flex min-h-[calc(100vh-57px)] max-w-[1280px] items-center justify-center bg-[#fafafa] px-4 py-10 text-zinc-950 sm:px-6">
      <div className="nyke-surface-card max-w-md p-8 text-center">
        <h1 className="font-serif text-2xl font-semibold">Gear is temporarily unavailable.</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-500">The catalog could not be loaded. Please try again in a moment.</p>
        <button type="button" onClick={reset} className="mt-6 rounded-md bg-rose-400 px-4 py-2 text-sm font-semibold text-zinc-950 shadow-sm hover:bg-rose-300">
          Try again
        </button>
      </div>
    </main>
  );
}
