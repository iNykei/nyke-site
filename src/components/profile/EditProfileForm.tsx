"use client";

import { ArrowRight, Save } from "lucide-react";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import type { saveProfile, SaveProfileState } from "@/app/settings/profile/actions";
import type { EditableProfileData } from "@/lib/profiles";
import { calculateCm360, calculateEdpi, formatNumber } from "@/lib/calculations";
import type { ProfileMediaKind } from "@/lib/profile-media";
import { ProfileMediaField } from "./ProfileMediaField";

const initialState: SaveProfileState = { status: "idle", message: "" };

type EditProfileFormProps = {
  data: EditableProfileData;
  action: typeof saveProfile;
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm text-zinc-600">{label}</span>
      {children}
    </label>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-zinc-200 pt-6">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-600">{title}</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

export function EditProfileForm({ data, action }: EditProfileFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(data.profile.avatar_url);
  const [bannerUrl, setBannerUrl] = useState<string | null>(data.profile.banner_url);
  const [mediaBusy, setMediaBusy] = useState<Record<ProfileMediaKind, boolean>>({ avatar: false, banner: false });
  const dpi = data.settings?.dpi ?? null;
  const sensitivity = data.settings?.sensitivity === null || data.settings?.sensitivity === undefined ? null : Number(data.settings.sensitivity);
  const edpi = calculateEdpi(dpi, sensitivity);
  const cm360 = calculateCm360(dpi, sensitivity);

  useEffect(() => {
    if (state.status === "success" && state.username) {
      window.location.replace(`/${state.username}`);
    }
  }, [state.status, state.username]);

  const isMediaBusy = mediaBusy.avatar || mediaBusy.banner;

  function handleMediaBusyChange(kind: ProfileMediaKind, busy: boolean) {
    setMediaBusy((current) => ({ ...current, [kind]: busy }));
  }

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (isMediaBusy) {
          event.preventDefault();
        }
      }}
      className="nyke-surface-card mx-auto w-full max-w-3xl space-y-8 p-6"
    >
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-rose-400">Profile settings</p>
        <h1 className="mt-3 font-serif text-3xl font-black text-zinc-950">Edit profile</h1>
      </div>

      <Section title="Profile media">
        <ProfileMediaField
          fallbackText={(data.profile.display_name || data.profile.username).slice(0, 2).toUpperCase()}
          kind="avatar"
          value={avatarUrl}
          onChange={setAvatarUrl}
          onBusyChange={handleMediaBusyChange}
        />
        <ProfileMediaField
          fallbackText=""
          kind="banner"
          value={bannerUrl}
          onChange={setBannerUrl}
          onBusyChange={handleMediaBusyChange}
        />
        <input type="hidden" name="avatar_url" value={avatarUrl ?? ""} readOnly />
      </Section>

      <Section title="Profile">
        <Field label="Display name">
          <input name="display_name" defaultValue={data.profile.display_name ?? ""} className="mt-2 h-11 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-950 outline-none transition focus:border-rose-300" />
        </Field>
        <Field label="Username">
          <input name="username" defaultValue={data.profile.username} className="mt-2 h-11 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-950 outline-none transition focus:border-rose-300" />
        </Field>
        <Field label="Region">
          <input name="region" defaultValue={data.profile.region ?? ""} placeholder="CN, NA, EU..." className="mt-2 h-11 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-950 outline-none transition focus:border-rose-300" />
        </Field>
        <label className="block sm:col-span-2">
          <span className="text-sm text-zinc-600">Bio</span>
          <textarea name="bio" defaultValue={data.profile.bio ?? ""} rows={4} maxLength={240} className="mt-2 w-full resize-none rounded-md border border-zinc-200 bg-white px-3 py-3 text-sm text-zinc-950 outline-none transition focus:border-rose-300" />
        </label>
      </Section>

      <Section title="Game">
        <Field label="Game">
          <input name="game" defaultValue={data.settings?.game ?? ""} placeholder="VALORANT" className="mt-2 h-11 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-950 outline-none transition focus:border-rose-300" />
        </Field>
        <Field label="Rank">
          <input name="rank" defaultValue={data.settings?.rank ?? ""} placeholder="Immortal" className="mt-2 h-11 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-950 outline-none transition focus:border-rose-300" />
        </Field>
      </Section>

      <Section title="Settings">
        <Field label="DPI">
          <input name="dpi" type="number" min={100} max={12800} defaultValue={data.settings?.dpi ?? ""} className="mt-2 h-11 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-950 outline-none transition focus:border-rose-300" />
        </Field>
        <Field label="Sensitivity">
          <input name="sensitivity" type="number" min="0.001" step="0.001" defaultValue={data.settings?.sensitivity ?? ""} className="mt-2 h-11 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-950 outline-none transition focus:border-rose-300" />
        </Field>
        <Field label="Resolution">
          <input name="resolution" defaultValue={data.settings?.resolution ?? ""} placeholder="1920 x 1080" className="mt-2 h-11 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-950 outline-none transition focus:border-rose-300" />
        </Field>
        <Field label="Polling rate">
          <input name="polling_rate" type="number" min={125} max={8000} defaultValue={data.settings?.polling_rate ?? ""} className="mt-2 h-11 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-950 outline-none transition focus:border-rose-300" />
        </Field>
        <div className="grid grid-cols-2 gap-2 sm:col-span-2">
          <div className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-600">eDPI: <span className="font-semibold text-zinc-950">{formatNumber(edpi, 0)}</span></div>
          <div className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-600">cm/360: <span className="font-semibold text-zinc-950">{formatNumber(cm360, 2)}</span></div>
        </div>
      </Section>

      <Section title="Gear">
        <div className="flex flex-wrap items-center justify-between gap-3 sm:col-span-2">
          <p className="text-sm text-zinc-600">{data.gearSummary.active} active · {data.gearSummary.saved} saved</p>
          <Link href="/settings/gear" className="inline-flex items-center gap-2 rounded-md border border-zinc-200 px-3 py-2 text-sm font-semibold text-zinc-800 hover:border-rose-300 focus-visible:outline-2 focus-visible:outline-rose-400">Manage gear <ArrowRight size={14} /></Link>
        </div>
      </Section>

      {state.message ? (
        <p className={state.status === "error" ? "text-sm text-rose-500" : "rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700"}>{state.message}</p>
      ) : null}

      <button type="submit" disabled={isPending || isMediaBusy} className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-rose-300 text-sm font-semibold text-zinc-950 shadow-lg shadow-rose-200/70 transition hover:bg-rose-200 disabled:cursor-not-allowed disabled:opacity-60">
        <Save size={16} />
        {isPending ? "Saving..." : isMediaBusy ? "Uploading image..." : "Save"}
      </button>
    </form>
  );
}
