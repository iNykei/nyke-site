import { calculateCm360, calculateEdpi, formatNumber } from "@/lib/calculations";
import type { PlayerProfile } from "@/types";

export function CardAim({ player }: { player: PlayerProfile }) {
  const { settings } = player;
  const edpi = calculateEdpi(settings.dpi, settings.sensitivity);
  const cm360 = calculateCm360(settings.dpi, settings.sensitivity);
  const hasRank = Boolean(settings.game || settings.rank);
  const hasAim = [settings.dpi, settings.sensitivity, edpi, cm360].some((value) => value !== null) || Boolean(settings.resolution || settings.pollingRate);
  const primary = edpi !== null
    ? { value: formatNumber(edpi, 0), label: "eDPI", technical: true }
    : settings.dpi !== null
      ? { value: String(settings.dpi), label: "DPI", technical: false }
      : settings.sensitivity !== null
        ? { value: String(settings.sensitivity), label: "Sensitivity", technical: false }
        : null;

  if (!hasRank && !hasAim) {
    return null;
  }

  return (
    <section className="relative z-10 mx-8 border-t border-zinc-200">
      {hasRank ? (
        <div className="flex min-h-[54px] items-center justify-between gap-5 py-3">
          <div className="min-w-0">
            <p className="text-[7px] font-bold uppercase tracking-[0.15em] text-zinc-400">Game</p>
            <p className="mt-1 truncate text-[11px] font-semibold uppercase text-zinc-600">{settings.game || "Unspecified"}</p>
          </div>
          {settings.rank ? <p className="max-w-[300px] truncate text-right font-serif text-[26px] font-black uppercase leading-none text-zinc-950">{settings.rank}</p> : null}
        </div>
      ) : null}

      {hasAim ? (
        <div className={`grid min-h-[112px] items-center gap-7 py-4 ${hasRank ? "border-t border-zinc-100" : ""} ${primary ? "grid-cols-[1.08fr_1fr]" : "grid-cols-1"}`}>
          {primary ? (
            <div>
              <p className="text-[7px] font-bold uppercase tracking-[0.16em] text-zinc-400">Aim signature</p>
              <p className={`mt-1 font-mono text-[38px] font-bold leading-none tabular-nums ${primary.technical ? "text-lime-700" : "text-zinc-950"}`}>{primary.value}</p>
              <p className="mt-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-500">{primary.label}</p>
            </div>
          ) : null}
          <dl className="grid grid-cols-2 gap-x-5 gap-y-3">
            {settings.dpi !== null && primary?.label !== "DPI" ? <div><dt className="text-[7px] font-bold uppercase text-zinc-400">DPI</dt><dd className="mt-1 font-mono text-[13px] font-semibold tabular-nums text-zinc-900">{settings.dpi}</dd></div> : null}
            {settings.sensitivity !== null && primary?.label !== "Sensitivity" ? <div><dt className="text-[7px] font-bold uppercase text-zinc-400">Sens</dt><dd className="mt-1 font-mono text-[13px] font-semibold tabular-nums text-zinc-900">{settings.sensitivity}</dd></div> : null}
            {cm360 !== null ? <div className="col-span-2"><dt className="text-[7px] font-bold uppercase text-zinc-400">Physical signature</dt><dd className="mt-1 font-mono text-[14px] font-semibold tabular-nums text-lime-700">{formatNumber(cm360, 2)} <span className="text-[8px] text-zinc-500">CM / 360</span></dd></div> : null}
          </dl>
        </div>
      ) : null}

      {[settings.resolution, settings.pollingRate].some(Boolean) ? (
        <p className="border-t border-zinc-100 py-2 font-mono text-[8px] uppercase tracking-[0.06em] text-zinc-500">{[settings.resolution, settings.pollingRate].filter(Boolean).join("  ·  ")}</p>
      ) : null}
    </section>
  );
}
