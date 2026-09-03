import { Search } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-lg border border-white/10 bg-white/[0.035] p-8 text-center">
        <p className="text-xs uppercase tracking-[0.24em] text-rose-200">Profile not found</p>
        <h1 className="mt-4 text-3xl font-semibold text-zinc-50">No matching player page</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-400">
          This prototype only includes a small mock roster. Try browsing Explore to open an available player profile.
        </p>
        <Link
          href="/explore"
          className="mt-6 inline-flex items-center justify-center gap-2 bg-rose-300 px-4 py-3 text-sm font-semibold text-black transition hover:bg-rose-200"
        >
          <Search size={16} />
          Back to Explore
        </Link>
      </section>
    </main>
  );
}
