"use client";

import { Save } from "lucide-react";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { saveProfile, SaveProfileState } from "@/app/settings/profile/actions";
import type { EditableProfileData } from "@/lib/profiles";
import { calculateCm360, calculateEdpi, formatNumber } from "@/lib/calculations";

const categories = ["mouse", "mousepad", "keyboard", "monitor", "headset", "skates"];
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
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(action, initialState);
  const dpi = data.settings?.dpi ?? null;
  const sensitivity = data.settings?.sensitivity === null || data.settings?.sensitivity === undefined ? null : Number(data.settings.sensitivity);
  const edpi = calculateEdpi(dpi, sensitivity);
  const cm360 = calculateCm360(dpi, sensitivity);

  useEffect(() => {
    if (state.status === "success" && state.username) {
      router.push(`/${state.username}`);
      router.refresh();
    }
  }, [router, state.status, state.username]);

  return (
    <form action={formAction} className="mx-auto w-full max-w-3xl space-y-8 border border-zinc-200 bg-white p-6 shadow-xl shadow-zinc-200/70">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-rose-400">Profile settings</p>
        <h1 className="mt-3 font-serif text-3xl font-black text-zinc-950">Edit profile</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-600">Update public identity, FPS settings, and active setup. Changes save together.</p>
      </div>

      <Section title="Profile">
        <Field label="Display name">
          <input name="display_name" defaultValue={data.profile.display_name ?? ""} className="mt-2 h-11 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-950 outline-none transition focus:border-cyan-300" />
        </Field>
        <Field label="Username">
          <input name="username" defaultValue={data.profile.username} className="mt-2 h-11 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-950 outline-none transition focus:border-cyan-300" />
        </Field>
        <Field label="Region">
          <input name="region" defaultValue={data.profile.region ?? ""} placeholder="CN, NA, EU..." className="mt-2 h-11 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-950 outline-none transition focus:border-cyan-300" />
        </Field>
        <Field label="Avatar URL">
          <input name="avatar_url" defaultValue={data.profile.avatar_url ?? ""} placeholder="https://..." className="mt-2 h-11 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-950 outline-none transition focus:border-cyan-300" />
        </Field>
        <label className="block sm:col-span-2">
          <span className="text-sm text-zinc-600">Bio</span>
          <textarea name="bio" defaultValue={data.profile.bio ?? ""} rows={4} maxLength={240} className="mt-2 w-full resize-none rounded-md border border-zinc-200 bg-white px-3 py-3 text-sm text-zinc-950 outline-none transition focus:border-cyan-300" />
        </label>
      </Section>

      <Section title="Game">
        <Field label="Game">
          <input name="game" defaultValue={data.settings?.game ?? ""} placeholder="VALORANT" className="mt-2 h-11 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-950 outline-none transition focus:border-cyan-300" />
        </Field>
        <Field label="Rank">
          <input name="rank" defaultValue={data.settings?.rank ?? ""} placeholder="Immortal" className="mt-2 h-11 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-950 outline-none transition focus:border-cyan-300" />
        </Field>
      </Section>

      <Section title="Settings">
        <Field label="DPI">
          <input name="dpi" type="number" min={100} max={12800} defaultValue={data.settings?.dpi ?? ""} className="mt-2 h-11 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-950 outline-none transition focus:border-cyan-300" />
        </Field>
        <Field label="Sensitivity">
          <input name="sensitivity" type="number" min="0.001" step="0.001" defaultValue={data.settings?.sensitivity ?? ""} className="mt-2 h-11 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-950 outline-none transition focus:border-cyan-300" />
        </Field>
        <Field label="Resolution">
          <input name="resolution" defaultValue={data.settings?.resolution ?? ""} placeholder="1920 x 1080" className="mt-2 h-11 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-950 outline-none transition focus:border-cyan-300" />
        </Field>
        <Field label="Polling rate">
          <input name="polling_rate" type="number" min={125} max={8000} defaultValue={data.settings?.polling_rate ?? ""} className="mt-2 h-11 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-950 outline-none transition focus:border-cyan-300" />
        </Field>
        <div className="grid grid-cols-2 gap-2 sm:col-span-2">
          <div className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-600">eDPI: <span className="font-semibold text-zinc-950">{formatNumber(edpi, 0)}</span></div>
          <div className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-600">cm/360: <span className="font-semibold text-zinc-950">{formatNumber(cm360, 2)}</span></div>
        </div>
      </Section>

      <Section title="Gear">
        {categories.map((category) => (
          <Field key={category} label={category}>
            <select name={`gear_${category}`} defaultValue={data.activeGear[category] ?? ""} className="mt-2 h-11 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-950 outline-none transition focus:border-cyan-300">
              <option value="">Not configured</option>
              {data.gearItems
                .filter((item) => item.category === category)
                .map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.brand} {item.model}
                  </option>
                ))}
            </select>
          </Field>
        ))}
      </Section>

      {state.message ? (
        <p className={state.status === "error" ? "text-sm text-rose-500" : "rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700"}>{state.message}</p>
      ) : null}

      <button type="submit" disabled={isPending} className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-rose-300 text-sm font-semibold text-zinc-950 shadow-lg shadow-rose-200/70 transition hover:bg-rose-200 disabled:cursor-not-allowed disabled:opacity-60">
        <Save size={16} />
        {isPending ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
