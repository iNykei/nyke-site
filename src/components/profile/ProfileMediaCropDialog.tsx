"use client";

import { Minus, Plus, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import type { ProfileMediaKind } from "@/lib/profile-media";

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const AVATAR_CROP_RATIO = 0.88;
const BANNER_CROP_WIDTH_RATIO = 0.9;

type Point = { x: number; y: number };
type Size = { height: number; width: number };

type ProfileMediaCropDialogProps = {
  fileName: string;
  kind: ProfileMediaKind;
  onApply: (file: File) => Promise<void> | void;
  onCancel: () => void;
  sourceUrl: string;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function ProfileMediaCropDialog({ fileName, kind, onApply, onCancel, sourceUrl }: ProfileMediaCropDialogProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const dragRef = useRef<{ origin: Point; pointerId: number; start: Point } | null>(null);
  const [stageSize, setStageSize] = useState<Size>({ height: 0, width: 0 });
  const [imageSize, setImageSize] = useState<Size>({ height: 0, width: 0 });
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cropSize = useMemo(() => {
    if (kind === "avatar") {
      const side = Math.min(stageSize.width, stageSize.height) * AVATAR_CROP_RATIO;
      return { width: side, height: side };
    }
    const width = stageSize.width * BANNER_CROP_WIDTH_RATIO;
    return { width, height: width / 4 };
  }, [kind, stageSize]);

  const baseScale = useMemo(() => {
    if (!cropSize.width || !cropSize.height || !imageSize.width || !imageSize.height) return 1;
    return Math.max(cropSize.width / imageSize.width, cropSize.height / imageSize.height);
  }, [cropSize, imageSize]);

  function clampOffset(next: Point, nextZoom = zoom) {
    const scale = baseScale * nextZoom;
    return {
      x: clamp(next.x, -Math.max(0, (imageSize.width * scale - cropSize.width) / 2), Math.max(0, (imageSize.width * scale - cropSize.width) / 2)),
      y: clamp(next.y, -Math.max(0, (imageSize.height * scale - cropSize.height) / 2), Math.max(0, (imageSize.height * scale - cropSize.height) / 2)),
    };
  }

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const updateSize = () => setStageSize({ width: stage.clientWidth, height: stage.clientHeight });
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const image = new Image();
    image.onload = () => {
      imageRef.current = image;
      setImageSize({ width: image.naturalWidth, height: image.naturalHeight });
      setError(null);
    };
    image.onerror = () => setError("This image could not be opened.");
    image.src = sourceUrl;
    return () => { imageRef.current = null; };
  }, [sourceUrl]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !applying) onCancel();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [applying, onCancel]);

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!imageSize.width || applying) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { origin: offset, pointerId: event.pointerId, start: { x: event.clientX, y: event.clientY } };
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    setOffset(clampOffset({ x: drag.origin.x + event.clientX - drag.start.x, y: drag.origin.y + event.clientY - drag.start.y }));
  }

  function stopDragging(event: PointerEvent<HTMLDivElement>) {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }

  function updateZoom(nextZoom: number) {
    const normalizedZoom = clamp(nextZoom, MIN_ZOOM, MAX_ZOOM);
    setZoom(normalizedZoom);
    setOffset((current) => clampOffset(current, normalizedZoom));
  }

  function resetCrop() {
    setZoom(MIN_ZOOM);
    setOffset({ x: 0, y: 0 });
    setError(null);
  }

  async function applyCrop() {
    const image = imageRef.current;
    if (!image || !cropSize.width || !cropSize.height || applying) return;
    setApplying(true);
    setError(null);
    try {
      const scale = baseScale * zoom;
      const sourceWidth = cropSize.width / scale;
      const sourceHeight = cropSize.height / scale;
      const sourceX = imageSize.width / 2 - sourceWidth / 2 - offset.x / scale;
      const sourceY = imageSize.height / 2 - sourceHeight / 2 - offset.y / scale;
      const canvas = document.createElement("canvas");
      canvas.width = kind === "avatar" ? 1024 : 1600;
      canvas.height = kind === "avatar" ? 1024 : 400;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas is unavailable.");
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
      context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((value) => value ? resolve(value) : reject(new Error("Image export failed.")), "image/webp", 0.9);
      });
      const safeName = fileName.replace(/\.[^.]+$/, "") || kind;
      await onApply(new File([blob], `${safeName}.webp`, { type: "image/webp" }));
    } catch {
      setError(`The edited ${kind} could not be prepared. Try another image.`);
      setApplying(false);
    }
  }

  const displayWidth = imageSize.width * baseScale * zoom;
  const displayHeight = imageSize.height * baseScale * zoom;
  const cropStyle = {
    width: cropSize.width,
    height: cropSize.height,
    left: (stageSize.width - cropSize.width) / 2,
    top: (stageSize.height - cropSize.height) / 2,
  };

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-zinc-950/35 p-3 backdrop-blur-[2px]" role="presentation">
      <section role="dialog" aria-modal="true" aria-labelledby="media-editor-title" className="w-full max-w-2xl rounded-lg border border-zinc-200 bg-white p-4 shadow-[0_20px_60px_rgba(24,24,27,0.2)] sm:p-5">
        <header className="flex items-center justify-between gap-4">
          <h2 id="media-editor-title" className="font-serif text-xl font-bold text-zinc-950">Edit {kind}</h2>
          <button type="button" onClick={onCancel} disabled={applying} aria-label={`Close ${kind} editor`} className="grid size-8 place-items-center rounded-md text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-950 disabled:opacity-50"><X size={17} /></button>
        </header>
        <div ref={stageRef} className={`${kind === "avatar" ? "aspect-square max-w-lg" : "aspect-[4/3]"} relative mx-auto mt-4 w-full touch-none cursor-grab select-none overflow-hidden rounded-md bg-zinc-800 active:cursor-grabbing`} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={stopDragging} onPointerCancel={stopDragging}>
          {imageSize.width ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={sourceUrl} alt={`${kind} crop preview`} draggable={false} className="pointer-events-none absolute left-1/2 top-1/2 max-w-none" style={{ width: displayWidth, height: displayHeight, transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))` }} />
          ) : null}
          <div className={`pointer-events-none absolute border-2 border-white/90 shadow-[0_0_0_999px_rgba(24,24,27,0.48)] ${kind === "avatar" ? "rounded-full" : "rounded-md"}`} style={cropStyle} aria-hidden="true" />
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button type="button" onClick={() => updateZoom(zoom - 0.1)} disabled={zoom <= MIN_ZOOM || applying} aria-label="Zoom out" className="grid size-8 shrink-0 place-items-center rounded-md text-zinc-500 hover:bg-zinc-100 disabled:opacity-35"><Minus size={16} /></button>
          <input type="range" min={MIN_ZOOM} max={MAX_ZOOM} step="0.01" value={zoom} onChange={(event) => updateZoom(Number(event.target.value))} disabled={applying} aria-label={`${kind} zoom`} className="h-1.5 w-full cursor-pointer accent-rose-400 disabled:opacity-50" />
          <button type="button" onClick={() => updateZoom(zoom + 0.1)} disabled={zoom >= MAX_ZOOM || applying} aria-label="Zoom in" className="grid size-8 shrink-0 place-items-center rounded-md text-zinc-500 hover:bg-zinc-100 disabled:opacity-35"><Plus size={16} /></button>
        </div>
        {error ? <p className="mt-3 text-xs text-rose-600" role="alert">{error}</p> : null}
        <footer className="mt-5 flex items-center justify-between gap-3">
          <button type="button" onClick={resetCrop} disabled={applying} className="h-9 px-1 text-xs font-semibold text-rose-500 transition hover:text-rose-700 disabled:opacity-50">Reset</button>
          <div className="flex gap-2">
            <button type="button" onClick={onCancel} disabled={applying} className="h-9 rounded-md border border-zinc-200 bg-white px-4 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50">Cancel</button>
            <button type="button" onClick={applyCrop} disabled={applying || !imageSize.width} className="h-9 rounded-md bg-rose-300 px-4 text-xs font-semibold text-zinc-950 shadow-sm transition hover:bg-rose-200 disabled:cursor-wait disabled:opacity-50">{applying ? "Applying..." : "Apply"}</button>
          </div>
        </footer>
      </section>
    </div>
  );
}
