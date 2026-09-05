import type { ReactNode } from "react";

const badgeMarks: Record<string, ReactNode> = {
  founder: <path d="m10 2 2.5 5.5L18 10l-5.5 2.5L10 18l-2.5-5.5L2 10l5.5-2.5Z" />,
  "first-10": <path d="m5 3 10 14M15 3 5 17M4 3h3m6 0h3M4 17h3m6 0h3" />,
  "early-100": <><circle cx="10" cy="10" r="7" /><circle cx="10" cy="10" r="3.5" /></>,
  beta: <path d="M8 3H3v14h5m4-14h5v14h-5M10 7v6" />,
};

const badgeTones: Record<string, string> = {
  founder: "text-[#8a6038]",
  "first-10": "text-rose-600",
  "early-100": "text-zinc-600",
  beta: "text-gray-500",
};

export function BadgeIcon({ slug, size = 14 }: { slug: string; size?: 12 | 14 }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`block shrink-0 ${badgeTones[slug] ?? badgeTones["early-100"]}`}
      aria-hidden="true"
      focusable="false"
    >
      {badgeMarks[slug] ?? <path d="m10 3 7 7-7 7-7-7Z" />}
    </svg>
  );
}
