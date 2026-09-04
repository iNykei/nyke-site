"use client";

import { Menu, Search, UserPlus, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { GlobalSearch } from "@/components/nav/GlobalSearch";

type Viewer = {
  username: string;
  avatarUrl: string | null;
};

type NavbarClientProps = {
  viewer: Viewer | null;
};

function isTextEntry(element: EventTarget | null) {
  return element instanceof HTMLInputElement
    || element instanceof HTMLTextAreaElement
    || element instanceof HTMLSelectElement
    || (element instanceof HTMLElement && element.isContentEditable);
}

function ViewerAvatar({ viewer }: { viewer: Viewer }) {
  const [failed, setFailed] = useState(false);
  const initials = viewer.username.slice(0, 2).toUpperCase();

  return (
    <span className="grid size-5 shrink-0 place-items-center overflow-hidden rounded-full bg-zinc-950 text-[9px] font-bold text-white">
      {viewer.avatarUrl && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={viewer.avatarUrl} alt="" className="size-full object-cover" onError={() => setFailed(true)} />
      ) : initials}
    </span>
  );
}

export function NavbarClient({ viewer }: NavbarClientProps) {
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const searchTriggerRef = useRef<HTMLElement | null>(null);
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const menuOpen = menuPath === pathname;

  const navItems = [
    { href: "/explore", label: "Explore", active: pathname === "/explore" },
    { href: "/gear", label: "Gear", active: pathname === "/gear" },
    ...(viewer
      ? [{
          href: `/${viewer.username}`,
          label: "Profile",
          active: pathname === `/${viewer.username}` || pathname.startsWith(`/${viewer.username}/`),
        }]
      : []),
  ];

  function openSearch(trigger?: HTMLElement | null) {
    searchTriggerRef.current = trigger ?? document.activeElement as HTMLElement | null;
    setMenuPath(null);
    setSearchOpen(true);
  }

  function closeSearch() {
    setSearchOpen(false);
    window.setTimeout(() => {
      const target = searchTriggerRef.current;
      if (target?.isConnected) target.focus();
      else menuButtonRef.current?.focus();
    }, 0);
  }

  useEffect(() => {
    function handleGlobalKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLocaleLowerCase() === "k") {
        if (!searchOpen && isTextEntry(event.target)) return;
        event.preventDefault();
        if (searchOpen) {
          document.querySelector<HTMLInputElement>('[aria-label="Search players or gear"]')?.focus();
        } else {
          openSearch();
        }
        return;
      }

      if (event.key === "Escape" && menuOpen) {
        event.preventDefault();
        setMenuPath(null);
        menuButtonRef.current?.focus();
      }
    }

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [menuOpen, searchOpen]);

  useEffect(() => {
    if (!menuOpen) return;

    function handleOutsidePointer(event: PointerEvent) {
      const target = event.target as Node;
      if (!menuRef.current?.contains(target) && !menuButtonRef.current?.contains(target)) {
        setMenuPath(null);
      }
    }

    document.addEventListener("pointerdown", handleOutsidePointer);
    return () => document.removeEventListener("pointerdown", handleOutsidePointer);
  }, [menuOpen]);

  function handleSearchClick(event: ReactMouseEvent<HTMLButtonElement>) {
    openSearch(event.currentTarget);
  }

  const desktopNavClass = (active: boolean) => `site-nav-link flex h-full items-center border-b-2 px-3 text-xs font-medium transition duration-150 focus:outline-none focus-visible:border-rose-400 ${
    active
      ? "border-rose-400 text-zinc-950"
      : "border-transparent text-zinc-600 hover:border-rose-300 hover:text-zinc-950"
  }`;

  const mobileNavClass = (active: boolean) => `flex h-10 items-center rounded-md px-3 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/60 ${
    active ? "bg-rose-50 text-zinc-950" : "text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950"
  }`;

  return (
    <>
      <header className="site-header sticky top-0 z-40 h-[57px] border-b border-zinc-200/80 bg-white/85 backdrop-blur-md">
        <div className="relative mx-auto flex h-[57px] max-w-[1232px] items-center justify-between px-4">
          <Link href="/" className="site-logo flex items-baseline gap-0.5 text-[20px] font-black italic leading-none text-zinc-950 transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/60">
            <span>nyke</span>
            <span className="text-rose-400">.</span>
          </Link>

          <nav className="hidden h-full items-center gap-3 md:flex" aria-label="Primary navigation">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} aria-current={item.active ? "page" : undefined} className={desktopNavClass(item.active)}>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSearchClick}
              className="site-icon-btn hidden h-8 items-center gap-2 rounded-md border border-zinc-200 bg-white/70 px-2 text-xs font-medium text-zinc-600 transition duration-200 hover:border-zinc-300 hover:bg-white hover:text-zinc-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/60 sm:flex"
              aria-haspopup="dialog"
            >
              <Search size={14} />
              Search
              <kbd className="rounded border border-zinc-200 px-1.5 py-0.5 text-[11px] text-zinc-500">Ctrl+K</kbd>
            </button>

            {viewer ? (
              <>
                <Link
                  href={`/${viewer.username}`}
                  className="site-icon-btn flex h-8 items-center gap-2 rounded-md border border-zinc-200 bg-white/70 px-2 text-xs font-medium text-zinc-600 transition duration-200 hover:border-zinc-300 hover:bg-white hover:text-zinc-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/60"
                  aria-label={`Open @${viewer.username} profile`}
                >
                  <ViewerAvatar viewer={viewer} />
                  <span className="hidden max-w-24 truncate sm:inline">{viewer.username}</span>
                </Link>
                <SignOutButton />
              </>
            ) : (
              <>
                <Link href="/login" className="site-icon-btn hidden h-8 items-center gap-2 rounded-md border border-zinc-200 bg-white/70 px-3 text-xs font-medium text-zinc-600 transition duration-200 hover:border-zinc-300 hover:bg-white hover:text-zinc-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/60 sm:flex">
                  Sign in
                </Link>
                <Link href="/register" className="site-icon-btn hidden h-8 items-center gap-2 rounded-md border border-zinc-200 bg-white/70 px-3 text-xs font-medium text-zinc-600 transition duration-200 hover:border-zinc-300 hover:bg-white hover:text-zinc-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/60 sm:flex">
                  <UserPlus size={14} />
                  Join
                </Link>
              </>
            )}

            <button
              ref={menuButtonRef}
              type="button"
            onClick={() => setMenuPath((current) => current === pathname ? null : pathname)}
              className="site-icon-btn grid size-8 place-items-center rounded-md border border-zinc-200 bg-white/70 text-zinc-600 transition duration-200 hover:border-zinc-300 hover:bg-white hover:text-zinc-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/60 md:hidden"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
            >
              {menuOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>

          {menuOpen ? (
            <div
              ref={menuRef}
              id="mobile-navigation"
              className="absolute inset-x-4 top-full z-50 rounded-lg border border-zinc-200 bg-white p-2 shadow-[0_14px_35px_rgba(24,24,27,0.12),0_2px_8px_rgba(24,24,27,0.06)] md:hidden"
            >
              <nav className="grid gap-1" aria-label="Mobile navigation" onClick={() => setMenuPath(null)}>
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href} aria-current={item.active ? "page" : undefined} className={mobileNavClass(item.active)}>
                    {item.label}
                  </Link>
                ))}
                {viewer ? (
                  <Link href="/settings/profile" className={mobileNavClass(pathname === "/settings/profile")}>Edit profile</Link>
                ) : null}
              </nav>

              <div className="my-2 border-t border-zinc-100" />

              <button
                type="button"
                onClick={handleSearchClick}
                className="flex h-10 w-full items-center gap-2 rounded-md px-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 hover:text-zinc-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/60"
              >
                <Search size={15} />
                Search
              </button>

              <div className="mt-1 grid gap-2">
                {viewer ? (
                  <SignOutButton mobile />
                ) : (
                  <>
                    <Link href="/login" onClick={() => setMenuPath(null)} className="flex h-10 items-center rounded-md border border-zinc-200 px-3 text-sm font-medium text-zinc-700 transition hover:border-zinc-300 hover:text-zinc-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/60">Sign in</Link>
                    <Link href="/register" onClick={() => setMenuPath(null)} className="flex h-10 items-center justify-center gap-2 rounded-md bg-rose-300 px-3 text-sm font-semibold text-zinc-950 transition hover:bg-rose-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/60">
                      <UserPlus size={15} />
                      Join NYKE
                    </Link>
                  </>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </header>

      {searchOpen ? <GlobalSearch onClose={closeSearch} /> : null}
    </>
  );
}
