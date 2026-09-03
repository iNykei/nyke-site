"use client";

import { Check, Pencil, Share2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type ProfileActionsProps = {
  displayName: string;
  isOwner: boolean;
};

export function ProfileActions({ displayName, isOwner }: ProfileActionsProps) {
  const [feedback, setFeedback] = useState<"idle" | "copied" | "error">("idle");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  function showFeedback(nextFeedback: "copied" | "error") {
    setFeedback(nextFeedback);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => setFeedback("idle"), 2200);
  }

  async function handleShare() {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title: `${displayName} on NYKE`, url });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      showFeedback("copied");
    } catch {
      showFeedback("error");
    }
  }

  const shareLabel = feedback === "copied" ? "Link copied" : feedback === "error" ? "Unable to share" : "Share";

  return (
    <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end">
      {isOwner ? (
        <Link
          href="/settings/profile"
          className="group inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md bg-rose-300 px-4 text-sm font-semibold text-zinc-950 shadow-sm shadow-rose-200/70 transition duration-200 hover:-translate-y-px hover:bg-rose-200 hover:shadow-md hover:shadow-rose-200/70 active:translate-y-0 active:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/70 sm:flex-none"
        >
          <Pencil size={14} className="transition-transform duration-200 group-hover:-translate-y-px" />
          Edit profile
        </Link>
      ) : null}
      <button
        type="button"
        onClick={handleShare}
        className="group inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-700 shadow-sm transition duration-200 hover:-translate-y-px hover:border-zinc-300 hover:text-zinc-950 hover:shadow-md active:translate-y-0 active:bg-zinc-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/70 sm:flex-none"
        aria-live="polite"
      >
        {feedback === "copied" ? <Check size={14} /> : <Share2 size={14} className="transition-transform duration-200 group-hover:-translate-y-px group-hover:translate-x-px" />}
        {shareLabel}
      </button>
    </div>
  );
}
