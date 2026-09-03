import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1232px] flex-col gap-3 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
        <p>NYKE prototype. Mock profiles, mock gear, no production auth.</p>
        <div className="flex gap-4">
          <Link href="/explore" className="transition hover:text-zinc-950">
            Explore
          </Link>
          <Link href="/gear" className="transition hover:text-zinc-950">
            Gear
          </Link>
          <Link href="/cyx" className="transition hover:text-zinc-950">
            cyx
          </Link>
        </div>
      </div>
    </footer>
  );
}
