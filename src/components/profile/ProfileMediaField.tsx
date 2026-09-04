"use client";

import { ImagePlus, LoaderCircle, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
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
import { ProfileMediaCropDialog } from "./ProfileMediaCropDialog";

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
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mediaEditor, setMediaEditor] = useState<{ fileName: string; url: string } | null>(null);
  const [result, setResult] = useState<ProfileMediaActionResult | null>(null);
  const previewRef = useRef<string | null>(null);
  const editorUrlRef = useRef<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { description, title } = labels[kind];
  const displayUrl = previewUrl ?? value;
  const inputId = `profile-${kind}-upload`;

  useEffect(() => {
    return () => {
      if (previewRef.current) {
        URL.revokeObjectURL(previewRef.current);
      }

      if (editorUrlRef.current) URL.revokeObjectURL(editorUrlRef.current);
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

  function validateFile(file: File) {
    const extension = getProfileMediaExtension(file.type);

    if (!extension) {
      setResult({ status: "error", message: "Choose a JPG, PNG, or WebP image." });
      return false;
    }

    if (file.size > PROFILE_MEDIA_LIMITS[kind]) {
      setResult({ status: "error", message: `${title} images must be ${kind === "avatar" ? "5" : "8"} MB or smaller.` });
      return false;
    }

    return true;
  }

  function closeMediaEditor() {
    if (editorUrlRef.current) URL.revokeObjectURL(editorUrlRef.current);
    editorUrlRef.current = null;
    setMediaEditor(null);
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || !validateFile(file)) return;

    closeMediaEditor();
    const url = URL.createObjectURL(file);
    editorUrlRef.current = url;
    setMediaEditor({ fileName: file.name, url });
    setResult(null);
  }

  async function uploadFile(file: File) {

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
      router.refresh();
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

  async function handleMediaApply(file: File) {
    closeMediaEditor();
    await uploadFile(file);
  }

  async function handleRemove() {
    setResult(null);
    setOperationBusy(true);

    try {
      const actionResult = await removeProfileMedia(kind);
      setResult(actionResult);

      if (actionResult.status !== "error") {
        onChange(null);
        router.refresh();
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
          <button type="button" disabled={busy} onClick={() => inputRef.current?.click()} aria-label="Edit avatar" className="group relative grid size-24 place-items-center overflow-hidden rounded-full border-4 border-white bg-zinc-950 text-xl font-bold text-white shadow-md ring-1 ring-zinc-200 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60">
            {displayUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={displayUrl} alt="Current avatar preview" className="size-full object-cover" />
            ) : (
              fallbackText
            )}
            <span className="absolute inset-0 grid place-items-center bg-zinc-950/45 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"><Pencil size={19} aria-hidden="true" /></span>
          </button>
        ) : (
          <button type="button" disabled={busy} onClick={() => inputRef.current?.click()} aria-label="Edit banner" className="group relative grid aspect-[3/1] w-full place-items-center overflow-hidden rounded-md border border-zinc-200 bg-zinc-100 text-zinc-400 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60 sm:aspect-[4/1]">
            {displayUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={displayUrl} alt="Current banner preview" className="size-full object-cover" />
            ) : (
              <span className="inline-flex items-center gap-2 text-xs"><ImagePlus size={15} /> No banner</span>
            )}
            <span className="absolute inset-0 grid place-items-center bg-zinc-950/35 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"><span className="grid size-10 place-items-center rounded-full bg-white/90 text-zinc-800 shadow-sm"><Pencil size={18} aria-hidden="true" /></span></span>
          </button>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <input
          id={inputId}
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          disabled={busy}
          onChange={handleFileChange}
        />
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
      {mediaEditor ? (
        <ProfileMediaCropDialog
          fileName={mediaEditor.fileName}
          kind={kind}
          sourceUrl={mediaEditor.url}
          onCancel={closeMediaEditor}
          onApply={handleMediaApply}
        />
      ) : null}
    </div>
  );
}
