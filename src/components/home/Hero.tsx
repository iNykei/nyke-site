"use client";

import Link from "next/link";
import { ArrowRight, Compass, Settings2 } from "lucide-react";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import type { PublicProfileData } from "@/lib/profiles";
import { HomeCardShowcase } from "./HomeCardShowcase";

type HeroProps = {
  cardShowcase: Pick<PublicProfileData, "player" | "activeGear"> | null;
  viewerUsername: string | null;
};

export function Hero({ cardShowcase, viewerUsername }: HeroProps) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [burst, setBurst] = useState(false);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch") {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateY = ((x - centerX) / centerX) * 2.4;
    const rotateX = ((centerY - y) / centerY) * 2.4;

    event.currentTarget.style.setProperty("--nyke-rx", `${rotateX.toFixed(2)}deg`);
    event.currentTarget.style.setProperty("--nyke-ry", `${rotateY.toFixed(2)}deg`);
    event.currentTarget.style.setProperty("--nyke-mx", `${x}px`);
    event.currentTarget.style.setProperty("--nyke-my", `${y}px`);
  }

  function handlePointerLeave(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.style.setProperty("--nyke-rx", "0deg");
    event.currentTarget.style.setProperty("--nyke-ry", "0deg");
    event.currentTarget.style.setProperty("--nyke-mx", "50%");
    event.currentTarget.style.setProperty("--nyke-my", "50%");
  }

  function triggerBurst() {
    setBurst(true);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setBurst(false);
    }, 520);
  }

  return (
    <section className="nyke-hero-stage relative mx-auto w-full max-w-6xl px-0 pb-12 pt-[76px] sm:px-6 sm:pt-[118px] lg:pt-[132px]">
      <div
        className={`nyke-hero-interactive relative rounded-[18px] ${burst ? "nyke-hero-burst" : ""}`}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onPointerDown={triggerBurst}
      >
        <span className="nyke-hero-sweep" aria-hidden="true" />
        <span className="nyke-hero-electric nyke-hero-electric-a" aria-hidden="true" />
        <span className="nyke-hero-electric nyke-hero-electric-b" aria-hidden="true" />
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.08fr] lg:gap-16">
          <div className="text-center lg:text-left">
            <div className="mb-5 inline-flex h-8 items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-600 shadow-sm">
              <Settings2 size={14} className="text-rose-400" />
              FPS identity, settings and gear
            </div>
            <h1 className="mx-auto max-w-[500px] font-serif text-[36px] font-black leading-[39.6px] tracking-[-0.008em] text-zinc-950 sm:text-[60px] sm:leading-[66px] sm:tracking-[-0.012em] lg:mx-0">
              <span className="block">Build the</span>
              <span className="block">profile behind</span>
              <span className="block">
                your <span className="text-rose-300">aim</span>.
              </span>
            </h1>
            <p className="mx-auto mt-7 max-w-[500px] text-lg leading-8 text-zinc-600 lg:mx-0">
              Build one public place for your aim settings and active gear, then turn it into a Card made to share.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
              <Link
                href={viewerUsername ? `/${viewerUsername}` : "/register"}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-rose-300 px-7 text-sm font-semibold text-zinc-950 shadow-lg shadow-rose-200/70 transition hover:bg-rose-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/70"
              >
                {viewerUsername ? "View your profile" : "Claim your profile"}
                <ArrowRight size={15} />
              </Link>
              <Link
                href="/explore"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-zinc-200 bg-white px-6 text-sm font-semibold text-zinc-700 transition hover:border-zinc-300 hover:text-zinc-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/70"
              >
                <Compass size={15} />
                Explore players
              </Link>
            </div>
          </div>
          <HomeCardShowcase data={cardShowcase} />
        </div>
      </div>
    </section>
  );
}
