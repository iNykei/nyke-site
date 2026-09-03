"use client";

import { ArrowLeft, Check, Download, Share2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { PublicProfileData } from "@/lib/profiles";
import { CARD_HEIGHT, CARD_WIDTH, NYKECard } from "./NYKECard";

type CardActionsProps = {
  data: Pick<PublicProfileData, "player" | "activeGear">;
};

type Feedback = "idle" | "preparing" | "downloaded" | "copied" | "error" | "image-fallback";

async function waitForImages(node: HTMLElement) {
  const images = Array.from(node.querySelectorAll("img"));
  await Promise.all(images.map(async (image) => {
    if (!image.complete) {
      await new Promise<void>((resolve) => {
        image.addEventListener("load", () => resolve(), { once: true });
        image.addEventListener("error", () => resolve(), { once: true });
      });
    }
    try {
      await image.decode();
    } catch {
      // html-to-image will use its deterministic placeholder when a remote image cannot be embedded.
    }
  }));
}

const imagePlaceholder = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="#27272a"/><path d="M0 48L48 0h16v16L16 64H0z" fill="#fda4af" fill-opacity=".22"/></svg>',
)}`;

export function CardActions({ data }: CardActionsProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [feedback, setFeedback] = useState<Feedback>("idle");
  const busy = feedback === "preparing";

  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  function showFeedback(next: Exclude<Feedback, "idle" | "preparing">) {
    setFeedback(next);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setFeedback("idle"), 2600);
  }

  async function createCardFile() {
    const node = cardRef.current;
    if (!node) throw new Error("Card is not ready.");

    setFeedback("preparing");
    await document.fonts.ready;
    await waitForImages(node);
    node.dataset.exporting = "true";

    try {
      const { toBlob } = await import("html-to-image");
      let usedImageFallback = false;
      const blob = await toBlob(node, {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        canvasWidth: 1080,
        canvasHeight: 1350,
        pixelRatio: 1,
        backgroundColor: "#f8f3ea",
        cacheBust: true,
        imagePlaceholder,
        onImageErrorHandler: () => { usedImageFallback = true; },
        style: { transform: "none", transformOrigin: "top left" },
      });
      if (!blob) throw new Error("The card image could not be created.");
      return { file: new File([blob], `nyke-${data.player.username}-card.png`, { type: "image/png" }), usedImageFallback };
    } finally {
      delete node.dataset.exporting;
    }
  }

  async function handleDownload() {
    if (busy) return;
    try {
      const { file, usedImageFallback } = await createCardFile();
      const url = URL.createObjectURL(file);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = file.name;
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 0);
      showFeedback(usedImageFallback ? "image-fallback" : "downloaded");
    } catch {
      showFeedback("error");
    }
  }

  async function shareUrl() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: `${data.player.displayName} NYKE Card`, url });
        setFeedback("idle");
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          setFeedback("idle");
          return;
        }
      }
    }
    await navigator.clipboard.writeText(url);
    showFeedback("copied");
  }

  async function handleShare() {
    if (busy) return;
    try {
      const { file } = await createCardFile();
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ title: `${data.player.displayName} NYKE Card`, files: [file] });
          setFeedback("idle");
          return;
        } catch (error) {
          if (error instanceof DOMException && error.name === "AbortError") {
            setFeedback("idle");
            return;
          }
        }
      }
      await shareUrl();
    } catch {
      try {
        await shareUrl();
      } catch {
        showFeedback("error");
      }
    }
  }

  const feedbackLabel = {
    idle: "",
    preparing: "Preparing card…",
    downloaded: "Downloaded",
    copied: "Copied",
    error: "Unable to export",
    "image-fallback": "Downloaded with image fallback",
  }[feedback];

  return (
    <>
      <NYKECard data={data} cardRef={cardRef} />
      <div className="mt-7 w-full max-w-[540px]">
        <div className="flex flex-wrap justify-center gap-2">
          <button type="button" onClick={handleDownload} disabled={busy} className="inline-flex h-10 items-center gap-2 rounded-md bg-rose-300 px-4 text-sm font-semibold text-zinc-950 shadow-sm transition hover:bg-rose-200 disabled:cursor-wait disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400">
            <Download size={15} /> Download Card
          </button>
          <button type="button" onClick={handleShare} disabled={busy} className="inline-flex h-10 items-center gap-2 rounded-md border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-800 transition hover:border-zinc-400 hover:bg-zinc-50 disabled:cursor-wait disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400">
            <Share2 size={15} /> Share
          </button>
          <Link href={`/${data.player.username}`} className="inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm font-semibold text-zinc-600 transition hover:text-zinc-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400">
            <ArrowLeft size={15} /> Back to profile
          </Link>
        </div>
        <p aria-live="polite" className={`mt-3 min-h-5 text-center text-xs font-medium ${feedback === "error" ? "text-rose-700" : "text-zinc-500"}`}>
          {feedback === "downloaded" || feedback === "copied" ? <Check size={13} className="mr-1 inline" /> : null}
          {feedbackLabel}
        </p>
      </div>
    </>
  );
}
