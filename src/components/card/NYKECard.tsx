"use client";

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent, type RefObject } from "react";
import type { PublicProfileData } from "@/lib/profiles";
import { CardAim } from "./CardAim";
import { CardIdentity } from "./CardIdentity";
import { CardLoadout } from "./CardLoadout";

export const CARD_WIDTH = 540;
export const CARD_HEIGHT = 675;

type NYKECardProps = {
  data: Pick<PublicProfileData, "player" | "activeGear">;
  cardRef?: RefObject<HTMLDivElement | null>;
};

export function NYKECard({ data, cardRef }: NYKECardProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const isFounder = data.player.badges.some((badge) => badge.slug === "founder");

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const updateScale = () => setScale(Math.min(1, viewport.clientWidth / CARD_WIDTH));
    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const node = innerRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    node.style.setProperty("--card-rx", `${(0.5 - y) * 5}deg`);
    node.style.setProperty("--card-ry", `${(x - 0.5) * 6}deg`);
    node.style.setProperty("--card-mx", `${x * 100}%`);
    node.style.setProperty("--card-my", `${y * 100}%`);
  }

  function resetPointer() {
    const node = innerRef.current;
    if (!node) return;
    node.style.setProperty("--card-rx", "0deg");
    node.style.setProperty("--card-ry", "0deg");
    node.style.setProperty("--card-mx", "50%");
    node.style.setProperty("--card-my", "30%");
  }

  function setRefs(node: HTMLDivElement | null) {
    innerRef.current = node;
    if (cardRef) cardRef.current = node;
  }

  return (
    <div
      ref={viewportRef}
      className="relative w-full max-w-[540px] overflow-clip rounded-[18px] drop-shadow-[0_28px_35px_rgba(39,39,42,0.14)]"
      style={{ height: CARD_HEIGHT * scale }}
      aria-label={`${data.player.displayName} NYKE Card preview`}
    >
      <div
        ref={setRefs}
        data-nyke-card
        data-founder={isFounder ? "true" : "false"}
        className="nyke-card absolute left-0 top-0 h-[675px] w-[540px] overflow-hidden rounded-[18px] bg-[#f8f3ea] text-zinc-950 shadow-[0_28px_70px_rgba(39,39,42,0.18)]"
        style={{ "--preview-scale": scale, transformOrigin: "top left" } as CSSProperties}
        onPointerMove={handlePointerMove}
        onPointerLeave={resetPointer}
      >
        <div className="nyke-card-paper pointer-events-none absolute inset-0" aria-hidden="true" />
        <header className="nyke-card-banner relative h-[184px] overflow-hidden bg-[#eadfd1]">
          {data.player.bannerUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.player.bannerUrl}
              alt={`${data.player.displayName} banner`}
              crossOrigin="anonymous"
              className="nyke-card-banner-image size-full object-cover"
            />
          ) : null}
          <div className="nyke-card-banner-texture absolute inset-0" aria-hidden="true" />
          <div className="absolute left-7 top-6 flex items-center gap-2 text-[8px] font-bold uppercase tracking-[0.15em] text-zinc-700/70">
            <span className="size-1.5 rounded-full bg-rose-400" />
            Player identity / aim profile
          </div>
          <div className="absolute bottom-5 right-7 font-mono text-[8px] uppercase tracking-[0.12em] text-zinc-700/60">CAL / 04:05</div>
        </header>

        <CardIdentity player={data.player} />
        <CardAim player={data.player} />
        <CardLoadout activeGear={data.activeGear} />

        <footer className="relative z-10 flex h-[58px] items-center justify-between px-9">
          <div>
            <p className="font-serif text-[17px] font-black italic text-zinc-950">NYKE<span className="text-rose-400">.</span></p>
            <p className="mt-0.5 max-w-[310px] truncate font-mono text-[8px] text-zinc-500">nyke.life/{data.player.username}</p>
          </div>
          <div className="text-right font-mono text-[8px] uppercase tracking-[0.12em] text-zinc-500">
            <p>{isFounder ? "Founder registry" : "Player registry"}</p>
            <p className="mt-1 text-zinc-800">NYKE ID / 01</p>
          </div>
        </footer>
        <div className="nyke-card-sheen pointer-events-none absolute inset-0 z-20" aria-hidden="true" />
        <span className="absolute bottom-3 left-3 size-2 border-b border-l border-zinc-500/40" aria-hidden="true" />
        <span className="absolute right-3 top-3 size-2 border-r border-t border-zinc-500/40" aria-hidden="true" />
      </div>
    </div>
  );
}
