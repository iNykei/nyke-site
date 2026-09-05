"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, LoaderCircle, Plus, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { updateGearCollection, type GearMutationInput } from "@/app/settings/gear/actions";
import { GearCard } from "@/components/GearCard";
import { buildGearCollection, filterGear, getGearBrands } from "@/lib/gear-collection";
import type { GearManagerData } from "@/lib/profiles";
import { ActiveGearMark } from "./ActiveGearMark";
import { GearFilters, initialGearFilters } from "./GearFilters";

const commandClass = "inline-flex min-h-9 items-center justify-center gap-1.5 rounded-md border border-zinc-200 bg-white px-3 text-xs font-semibold text-zinc-700 hover:border-rose-300 focus-visible:outline-2 focus-visible:outline-rose-400 disabled:cursor-not-allowed disabled:opacity-50";

export function GearManager({ data }: { data: GearManagerData }) {
  const [collection, setCollection] = useState(data.collection);
  const [filters, setFilters] = useState(initialGearFilters);
  const [pickerFilters, setPickerFilters] = useState(initialGearFilters);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [busy, setBusy] = useState<GearMutationInput | null>(null);
  const [feedback, setFeedback] = useState<{ error: boolean; message: string } | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  const busyRef = useRef(false);
  const pickerRef = useRef<HTMLElement>(null);
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const savedIds = new Set(collection.map((item) => item.id));
  const active = collection.filter((item) => item.isActive);
  const filtered = filterGear(collection, filters.query, filters.category, filters.brand);
  const pickerItems = filterGear(data.catalog, pickerFilters.query, pickerFilters.category, pickerFilters.brand);

  useEffect(() => {
    if (pickerOpen) {
      pickerRef.current?.scrollIntoView({ block: "start" });
      pickerRef.current?.querySelector("input")?.focus({ preventScroll: true });
    }
  }, [pickerOpen]);

  async function mutate(input: GearMutationInput) {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(input);
    setFeedback(null);
    try {
      const result = await updateGearCollection(input);
      if (result.status === "success") {
        const nextCollection = buildGearCollection(result.rows, data.catalog);
        setCollection(nextCollection);
        setFilters((current) => ({ ...current, brand: getGearBrands(nextCollection, current.category).includes(current.brand) ? current.brand : "" }));
        setConfirmRemove(null);
      }
      setFeedback({ error: result.status === "error", message: result.message });
    } catch {
      setFeedback({ error: true, message: "Your collection could not be refreshed. Reload before trying again." });
    } finally {
      busyRef.current = false;
      setBusy(null);
    }
  }

  function closePicker() {
    setPickerOpen(false);
    addButtonRef.current?.focus();
  }

  return (
    <div className="mx-auto max-w-5xl">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link href="/settings/profile" className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-950"><ArrowLeft size={13} />Edit profile</Link>
          <h1 className="mt-3 font-serif text-3xl font-black">My Gear</h1>
          <p className="mt-2 text-xs text-zinc-500">{active.length} active · {collection.length} saved</p>
        </div>
        <button ref={addButtonRef} type="button" onClick={() => setPickerOpen(true)} aria-expanded={pickerOpen} aria-controls="add-gear-picker" className="inline-flex h-10 items-center gap-2 rounded-md bg-rose-300 px-4 text-sm font-semibold text-zinc-950 hover:bg-rose-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400"><Plus size={16} />Add gear</button>
      </header>

      <section className="mt-7 border-y border-zinc-200 py-5" aria-labelledby="my-loadout-heading">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="my-loadout-heading" className="text-sm font-semibold">Active Loadout <span className="ml-1 font-mono text-xs font-normal text-zinc-400">{active.length}/6</span></h2>
          <Link href={`/${data.username}/gear`} className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-950">Public gear <ArrowRight size={12} /></Link>
        </div>
        {active.length ? <ul className="mt-4 grid gap-x-5 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">{active.map((item) => <li key={item.id} className="min-w-0"><p className="text-[9px] font-semibold uppercase text-zinc-400">{item.category}</p><p className="mt-1 truncate text-xs text-zinc-700" title={`${item.maker} ${item.name}`}><Check size={12} className="mr-1 inline text-rose-500" aria-hidden="true" />{item.maker} {item.name}</p></li>)}</ul> : <p className="mt-3 text-xs text-zinc-500">No active gear yet.</p>}
      </section>

      <div role="status" aria-live="polite" aria-atomic="true" className={`sticky top-0 z-10 min-h-10 py-3 text-sm ${feedback ? "bg-[#fafafa]" : ""} ${feedback?.error ? "text-rose-700" : "text-zinc-600"}`}>
        {busy ? <span className="inline-flex items-center gap-2"><LoaderCircle size={14} className="animate-spin motion-reduce:animate-none" />Updating gear...</span> : feedback?.message}
      </div>

      {pickerOpen ? (
        <section ref={pickerRef} id="add-gear-picker" aria-labelledby="add-gear-heading" className="mb-8 scroll-mt-16 border-b border-zinc-200 pb-7">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 id="add-gear-heading" className="font-serif text-xl font-bold">Add gear</h2>
            <button type="button" onClick={closePicker} aria-label="Close gear picker" title="Close gear picker" className="grid size-9 place-items-center rounded-md text-zinc-500 hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-rose-400"><X size={18} /></button>
          </div>
          <GearFilters items={data.catalog} value={pickerFilters} onChange={setPickerFilters} searchLabel="Search catalog..." />
          <p className="mt-4 text-xs text-zinc-500" aria-live="polite">{pickerItems.length} gear shown</p>
          <div className="mt-4 max-h-[65vh] overflow-y-auto overscroll-contain p-1">
            <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-4">
              {pickerItems.map((item) => <GearCard key={item.id} item={item} compact actions={
                <button type="button" disabled={Boolean(busy) || savedIds.has(item.id)} onClick={() => void mutate({ operation: "add", gearItemId: item.id })} aria-label={savedIds.has(item.id) ? `${item.name} already added` : `Add ${item.name} to collection`} className={`${commandClass} w-full`}>
                  {savedIds.has(item.id) ? <Check size={13} /> : <Plus size={13} />}{savedIds.has(item.id) ? "Added" : "Add to collection"}
                </button>
              } />)}
            </div>
            {pickerItems.length === 0 ? <p className="py-8 text-center text-sm text-zinc-500">No gear matches this search.</p> : null}
          </div>
        </section>
      ) : null}

      <section aria-labelledby="my-collection-heading">
        <h2 id="my-collection-heading" className="mb-4 font-serif text-xl font-bold">Gear Collection</h2>
        {collection.length === 0 ? <div className="py-8 text-center"><p className="text-sm text-zinc-500">No gear added yet.</p><button type="button" onClick={() => setPickerOpen(true)} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-rose-600">Add your first piece of gear <ArrowRight size={14} /></button></div> : <>
          <GearFilters items={collection} value={filters} onChange={setFilters} searchLabel="Search your collection..." />
          <p className="mt-4 text-xs text-zinc-500" aria-live="polite">{filtered.length} gear shown</p>
          <div className="mt-5 grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-4">
            {filtered.map((item) => <GearCard key={item.collectionId} item={item} compact status={item.isActive ? <ActiveGearMark /> : undefined} actions={confirmRemove === item.id ? (
              <div role="group" aria-label={`Remove ${item.name}?`}>
                <p className="mb-2 text-xs text-zinc-600">Remove from collection?</p>
                <div className="flex flex-wrap gap-2"><button type="button" disabled={Boolean(busy)} className={commandClass} onClick={() => setConfirmRemove(null)}>Cancel</button><button type="button" disabled={Boolean(busy)} className={`${commandClass} text-rose-700`} onClick={() => void mutate({ operation: "remove", gearItemId: item.id })}><Trash2 size={13} />Remove</button></div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2">
                {item.isActive ? <span className="inline-flex min-h-9 items-center gap-1 text-xs font-semibold text-zinc-500"><Check size={13} />In use</span> : <button type="button" disabled={Boolean(busy)} onClick={() => void mutate({ operation: "activate", gearItemId: item.id })} className={commandClass} aria-label={`Set ${item.name} active`}><Check size={13} />Set active</button>}
                <button type="button" disabled={Boolean(busy)} onClick={() => setConfirmRemove(item.id)} aria-label={`Remove ${item.name} from collection`} title="Remove from collection" className="grid size-9 shrink-0 place-items-center rounded-md text-zinc-400 hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-2 focus-visible:outline-rose-400 disabled:opacity-50"><Trash2 size={14} /></button>
              </div>
            )} />)}
          </div>
          {filtered.length === 0 ? <p className="py-8 text-center text-sm text-zinc-500">No gear matches this search.</p> : null}
        </>}
      </section>
    </div>
  );
}
