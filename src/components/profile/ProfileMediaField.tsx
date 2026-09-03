"use client";

import { ImagePlus, LoaderCircle, Trash2, Upload } from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { commitProfileMedia, removeProfileMedia, type ProfileMediaActionResult } from "@/app/settings/profile/media-actions";
import {
  createProfileMediaPath,
  getProfileMediaExtension,
  PROFILE_MEDIA_BUCKET,
  PROFILE_MEDIA_LIMITS,
  type ProfileMediaKind,
} from "@/lib/profile-media";
import { createClient } from "@/lib/supabase/client";

type ProfileMediaFieldProps = {
  fallbackText: string;
  kind: ProfileMediaKind;
  onBusyChange: (kind: ProfileMediaKind, busy: boolean) => void;
  onChange: (url: string | null) => void;
  value: string | null;
};

const labels: Record<ProfileMediaKind, { description: string; title: string }> = {
  avatar: {
    description: "Square images work best. JPG, PNG, or WebP up to 5 MB.",
    title: "Avatar",
  },
  banner: {
    description: "Wide images work best. JPG, PNG, or WebP up to 8 MB.",
    title: "Banner",
  },
};

function statusClass(status: ProfileMediaActionResult["status"]) {
  if (status === "error") {
    return "text-rose-600";
  }

  if (status === "warning") {
    return "text-amber-700";
  }

  return "text-emerald-700";
}

export function ProfileMediaField({ fallbackText, kind, onBusyChange, onChange, value }: ProfileMediaFieldProps) {
  const [busy, setBusy] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<ProfileMediaActionResult | null>(null);
  const previewRef = useRef<string | null>(null);
  const { description, title } = labels[kind];
  const displayUrl = previewUrl ?? value;
  const inputId = `profile-${kind}-upload`;

  useEffect(() => {
    return () => {
      if (previewRef.current) {
        URL.revokeObjectURL(previewRef.current);
      }
    };
  }, []);

  function setOperationBusy(nextBusy: boolean) {
    setBusy(nextBusy);
    onBusyChange(kind, nextBusy);
  }

  function clearPreview() {
    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current);
      previewRef.current = null;
    }

    setPreviewUrl(null);
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    const extension = getProfileMediaExtension(file.type);

    if (!extension) {
      setResult({ status: "error", message: "Choose a JPG, PNG, or WebP image." });
      return;
    }

    if (file.size > PROFILE_MEDIA_LIMITS[kind]) {
      setResult({ status: "error", message: `${title} images must be ${kind === "avatar" ? "5" : "8"} MB or smaller.` });
      return;
    }

    clearPreview();
    const localPreviewUrl = URL.createObjectURL(file);
    previewRef.current = localPreviewUrl;
    setPreviewUrl(localPreviewUrl);
    setResult(null);
    setOperationBusy(true);

    const supabase = createClient();
    let uploadedPath: string | null = null;

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setResult({ status: "error", message: "Sign in again before uploading an image." });
        return;
      }

      uploadedPath = createProfileMediaPath(user.id, kind, file.type);

      if (!uploadedPath) {
        setResult({ status: "error", message: "That image format is not supported." });
        return;
      }

      const { error: uploadError } = await supabase.storage.from(PROFILE_MEDIA_BUCKET).upload(uploadedPath, file, {
        cacheControl: "31536000",
        contentType: file.type,
        upsert: false,
      });

      if (uploadError) {
        setResult({ status: "error", message: "The image could not be uploaded. Try again." });
        return;
      }

      const actionResult = await commitProfileMedia(kind, uploadedPath);
      setResult(actionResult);

      if (actionResult.status === "error") {
        await supabase.storage.from(PROFILE_MEDIA_BUCKET).remove([uploadedPath]);
        return;
      }

      onChange(actionResult.url ?? null);
    } catch {
      if (uploadedPath) {
        await supabase.storage.from(PROFILE_MEDIA_BUCKET).remove([uploadedPath]);
      }
      setResult({ status: "error", message: "The image could not be uploaded. Try again." });
    } finally {
      clearPreview();
      setOperationBusy(false);
    }
  }

  async function handleRemove() {
    setResult(null);
    setOperationBusy(true);

    try {
      const actionResult = await removeProfileMedia(kind);
      setResult(actionResult);

      if (actionResult.status !== "error") {
        onChange(null);
      }
    } catch {
      setResult({ status: "error", message: `The ${kind} could not be removed. Try again.` });
    } finally {
      clearPreview();
      setOperationBusy(false);
    }
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50/70 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-zinc-950">{title}</h3>
          <p className="mt-1 text-xs leading-5 text-zinc-500">{description}</p>
        </div>
        {busy ? <LoaderCircle size={16} className="mt-0.5 shrink-0 animate-spin text-rose-400" aria-label={`${title} upload in progress`} /> : null}
      </div>

      <div className="mt-4">
        {kind === "avatar" ? (
          <div className="grid size-24 place-items-center overflow-hidden rounded-full border-4 border-white bg-zinc-950 text-xl font-bold text-white shadow-md ring-1 ring-zinc-200">
            {displayUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={displayUrl} alt="Current avatar preview" className="size-full object-cover" />
            ) : (
              fallbackText
            )}
          </div>
        ) : (
          <div className="grid aspect-[3/1] w-full place-items-center overflow-hidden rounded-md border border-zinc-200 bg-white text-zinc-400 sm:aspect-[4/1]">
            {displayUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={displayUrl} alt="Current banner preview" className="size-full object-cover" />
            ) : (
              <span className="inline-flex items-center gap-2 text-xs"><ImagePlus size={15} /> No banner</span>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <input
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          disabled={busy}
          onChange={handleFileChange}
        />
        <label
          htmlFor={inputId}
          aria-disabled={busy}
          className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-md bg-rose-300 px-3 text-xs font-semibold text-zinc-950 shadow-sm transition duration-200 hover:bg-rose-200 aria-disabled:pointer-events-none aria-disabled:opacity-60"
        >
          <Upload size={14} />
          {value ? "Replace" : "Upload"}
        </label>
        {value ? (
          <button
            type="button"
            disabled={busy}
            onClick={handleRemove}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-zinc-200 bg-white px-3 text-xs font-semibold text-zinc-600 transition duration-200 hover:border-rose-200 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Trash2 size={14} />
            Remove
          </button>
        ) : null}
      </div>

      {result ? <p className={`mt-3 text-xs leading-5 ${statusClass(result.status)}`} aria-live="polite">{result.message}</p> : null}
    </div>
  );
}
