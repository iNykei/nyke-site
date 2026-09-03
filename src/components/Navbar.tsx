import { Menu, Monitor, Search, UserPlus } from "lucide-react";
import Link from "next/link";
import { getCurrentUserAndProfile } from "@/lib/profiles";
import { SignOutButton } from "./auth/SignOutButton";

const discoveryNavItems = [
  { href: "/explore", label: "Explore" },
  { href: "/gear", label: "Gear" },
];

export async function Navbar() {
  const { profile } = await getCurrentUserAndProfile();
  const displayUsername = profile?.username;
  const profileInitial = displayUsername?.slice(0, 2).toUpperCase();
  const navItems = [
    ...discoveryNavItems,
    { href: displayUsername ? `/${displayUsername}` : "/cyx", label: "Profile" },
  ];

  return (
    <header className="site-header sticky top-0 z-40 h-[57px] border-b border-zinc-200/80 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-[57px] max-w-[1232px] items-center justify-between px-4">
        <Link href="/" className="site-logo flex items-baseline gap-0.5 text-[20px] font-black italic leading-none text-zinc-950 transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/60">
          <span>nyke</span>
          <span className="text-rose-400">.</span>
        </Link>
        <nav className="hidden h-full items-center gap-3 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="site-nav-link flex h-full items-center border-b-2 border-transparent px-3 text-xs font-medium text-zinc-600 transition duration-150 hover:border-rose-300 hover:text-zinc-950 focus:outline-none focus-visible:border-rose-400"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="site-icon-btn hidden h-8 items-center gap-2 rounded-md border border-zinc-200 bg-white/70 px-2 text-xs font-medium text-zinc-600 transition duration-200 hover:border-zinc-300 hover:bg-white hover:text-zinc-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/60 sm:flex"
          >
            <Search size={14} />
            Search
            <kbd className="rounded border border-zinc-200 px-1.5 py-0.5 text-[11px] text-zinc-500">Ctrl+K</kbd>
          </button>
          <Link
            href="/gear"
            className="site-icon-btn grid size-8 place-items-center rounded-md border border-zinc-200 bg-white/70 text-zinc-600 transition duration-200 hover:border-zinc-300 hover:bg-white hover:text-zinc-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/60"
            aria-label="Gear"
          >
            <Monitor size={15} />
          </Link>
          {displayUsername ? (
            <>
              <Link
                href={`/${displayUsername}`}
                className="site-icon-btn flex h-8 items-center gap-2 rounded-md border border-zinc-200 bg-white/70 px-2 text-xs font-medium text-zinc-600 transition duration-200 hover:border-zinc-300 hover:bg-white hover:text-zinc-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/60"
              >
                <span className="grid size-5 place-items-center rounded-full bg-zinc-950 text-[9px] font-bold text-white">{profileInitial}</span>
                <span className="hidden max-w-24 truncate sm:inline">{displayUsername}</span>
              </Link>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="site-icon-btn hidden h-8 items-center gap-2 rounded-md border border-zinc-200 bg-white/70 px-3 text-xs font-medium text-zinc-600 transition duration-200 hover:border-zinc-300 hover:bg-white hover:text-zinc-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/60 sm:flex"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="site-icon-btn hidden h-8 items-center gap-2 rounded-md border border-zinc-200 bg-white/70 px-3 text-xs font-medium text-zinc-600 transition duration-200 hover:border-zinc-300 hover:bg-white hover:text-zinc-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/60 sm:flex"
              >
                <UserPlus size={14} />
                Join
              </Link>
            </>
          )}
          <button
            type="button"
            className="site-icon-btn grid size-8 place-items-center rounded-md border border-zinc-200 bg-white/70 text-zinc-600 transition duration-200 hover:border-zinc-300 hover:bg-white hover:text-zinc-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/60 md:hidden"
            aria-label="Open menu"
          >
            <Menu size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
