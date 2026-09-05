"use client";

import { CreditCard, Home, Mouse } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function ProfileSubnav({ username }: { username: string }) {
  const pathname = usePathname();
  const items = [
    { label: "Home", href: `/${username}`, icon: Home },
    { label: "Gear", href: `/${username}/gear`, icon: Mouse },
    { label: "Card", href: `/${username}/card`, icon: CreditCard },
  ];

  return (
    <nav aria-label={`${username} profile`} className="mx-auto mt-5 flex w-fit max-w-full items-center gap-1 rounded-lg border border-[var(--profile-border)] bg-white p-1 shadow-sm">
      {items.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={`inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--profile-accent)] ${active ? "bg-zinc-950 text-white" : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950"}`}>
            <Icon size={13} aria-hidden="true" />{item.label}
          </Link>
        );
      })}
    </nav>
  );
}
