"use client";

import { useEffect, useRef, useState, type PointerEvent, type RefObject } from "react";
import { formatMemberNumber } from "@/lib/identity";
import type { PublicProfileData } from "@/lib/profiles";
import { CardAim } from "./CardAim";
import { CardIdentity } from "./CardIdentity";
import { CardLoadout } from "./CardLoadout";

export const CARD_WIDTH = 540;
export const CARD_HEIGHT = 610;
const MAX_TILT = 4;
const CENTER_DEAD_ZONE = 0.04;

type NYKECardProps = {
  data: Pick<PublicProfileData, "player" | "activeGear">;
  cardRef?: RefObject<HTMLDivElement | null>;
};

function easeFromCenter(value: number) {
  const clamped = Math.max(-1, Math.min(1, value));
  const magnitude = Math.abs(clamped);
  if (magnitude <= CENTER_DEAD_ZONE) return 0;
  return Math.sign(clamped) * ((magnitude - CENTER_DEAD_ZONE) / (1 - CENTER_DEAD_ZONE));
}

export function NYKECard({ data, cardRef }: NYKECardProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const pointerRef = useRef({ x: 0, y: 0, mx: 50, my: 50 });
  const [scale, setScale] = useState(1);
  const { player } = data;
  const isFounder = player.badges.some((badge) => badge.slug === "founder");
  const memberNumber = player.memberNumber === null ? null : formatMemberNumber(player.memberNumber);
  const identityPattern = `@${player.username} · ${memberNumber ? `${memberNumber} · ` : ""}NYKE`;

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const updateScale = () => setScale(Math.min(1, viewport.clientWidth / CARD_WIDTH));
    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(viewport);
    return () => {
      observer.disconnect();
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  function writePointerState() {
    frameRef.current = null;
    const node = innerRef.current;
    if (!node) return;
    const { x, y, mx, my } = pointerRef.current;
    node.style.setProperty("--card-rx", `${(-easeFromCenter(y) * MAX_TILT).toFixed(3)}deg`);
    node.style.setProperty("--card-ry", `${(easeFromCenter(x) * MAX_TILT).toFixed(3)}deg`);
    node.style.setProperty("--card-mx", `${mx.toFixed(2)}%`);
    node.style.setProperty("--card-my", `${my.toFixed(2)}%`);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (
      event.pointerType !== "mouse" ||
      !window.matchMedia("(hover: hover) and (pointer: fine)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) return;

    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const relativeX = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    const relativeY = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
    pointerRef.current = { x: relativeX * 2 - 1, y: relativeY * 2 - 1, mx: relativeX * 100, my: relativeY * 100 };
    if (frameRef.current === null) frameRef.current = requestAnimationFrame(writePointerState);
  }

  function resetPointer() {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    pointerRef.current = { x: 0, y: 0, mx: 50, my: 50 };
    const node = innerRef.current;
    if (!node) return;
    node.style.setProperty("--card-rx", "0deg");
    node.style.setProperty("--card-ry", "0deg");
    node.style.setProperty("--card-mx", "50%");
    node.style.setProperty("--card-my", "50%");
  }

  function setCardRef(node: HTMLDivElement | null) {
    innerRef.current = node;
    if (cardRef) cardRef.current = node;
  }

  return (
    <div ref={viewportRef} className="relative w-full max-w-[540px] overflow-visible" style={{ height: CARD_HEIGHT * scale }} aria-label={`${player.displayName} NYKE Card preview`}>
      <div
        ref={stageRef}
        className="nyke-card-stage absolute left-0 top-0 h-[610px] w-[540px]"
        style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}
        onPointerMove={handlePointerMove}
        onPointerLeave={resetPointer}
      >
        <div
          ref={setCardRef}
          data-nyke-card
          data-founder={isFounder ? "true" : "false"}
          className="nyke-card relative h-[610px] w-[540px] overflow-hidden rounded-lg border border-zinc-200 bg-white text-zinc-950"
        >
          <header className="relative z-10 h-[176px] overflow-hidden bg-zinc-950">
            {player.bannerUrl ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={player.bannerUrl} alt={`${player.displayName} banner`} crossOrigin="anonymous" className="size-full object-cover" />
                <div className="nyke-card-banner-overlay absolute inset-0" aria-hidden="true" />
              </>
            ) : (
              <div className="nyke-card-default-banner size-full" aria-hidden="true">
                <span className="nyke-card-default-lockup">
                  <span className="nyke-card-default-wordmark">NYKE</span><span className="nyke-card-default-dot">.</span>
                </span>
              </div>
            )}
          </header>

          <div className="nyke-card-identity-pattern pointer-events-none absolute inset-x-0 bottom-[48px] top-[176px] z-[1] overflow-hidden" aria-hidden="true">
            <div className="nyke-card-identity-pattern-grid">
              {Array.from({ length: 24 }, (_, index) => <span key={index}>{identityPattern}</span>)}
            </div>
          </div>

          <CardIdentity player={player} />
          <div className="relative z-10 flex h-[234px] flex-col items-center justify-center gap-5 px-8 py-4">
            <CardLoadout activeGear={data.activeGear} />
            <CardAim player={player} />
            {player.settings.resolution || player.settings.pollingRate || data.activeGear.length > 0 ? (
              <p className="flex max-w-[390px] flex-wrap items-center justify-center gap-x-4 gap-y-1 font-mono text-[8px] uppercase tracking-[0.08em] text-zinc-400">
                {player.settings.resolution ? <span>{player.settings.resolution}</span> : null}
                {player.settings.pollingRate ? <span>{player.settings.pollingRate}</span> : null}
                {data.activeGear.length > 0 ? <span>{data.activeGear.length} active peripherals</span> : null}
              </p>
            ) : null}
          </div>

          <footer className="relative z-10 flex h-[48px] items-center justify-between border-t border-zinc-100 bg-[#f4f4f5] px-7">
            <div><p className="font-serif text-[16px] font-black italic text-zinc-950">NYKE<span className="text-rose-400">.</span></p><p className="mt-0.5 max-w-[300px] truncate font-mono text-[7px] text-zinc-400">nyke.life/{player.username}</p></div>
            {memberNumber ? <p className="font-mono text-[13px] font-bold tabular-nums tracking-[0.04em] text-zinc-700">{memberNumber}</p> : null}
          </footer>
          <div className="nyke-card-sheen pointer-events-none absolute inset-0 z-20" aria-hidden="true" />
          {isFounder ? <span className="nyke-card-founder-mark absolute right-3 top-3 z-20 size-3 border-r border-t border-[#a58b5b]" aria-hidden="true" /> : null}
        </div>
      </div>
    </div>
  );
}
