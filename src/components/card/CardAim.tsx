import { calculateCm360, calculateEdpi, formatNumber } from "@/lib/calculations";
import type { PlayerProfile } from "@/types";

export function CardAim({ player }: { player: PlayerProfile }) {
  const { settings } = player;
  const edpi = calculateEdpi(settings.dpi, settings.sensitivity);
  const cm360 = calculateCm360(settings.dpi, settings.sensitivity);
  const values = [
    { label: "Sens", value: settings.sensitivity !== null ? formatNumber(settings.sensitivity, 2) : null },
    { label: "DPI", value: settings.dpi !== null ? String(settings.dpi) : null },
    { label: "eDPI", value: edpi !== null ? formatNumber(edpi, 0) : null },
    { label: "cm/360", value: cm360 !== null ? formatNumber(cm360, 2) : null },
  ].filter((item): item is { label: string; value: string } => item.value !== null);

  if (values.length === 0) {
    return null;
  }

  const layoutClass = {
    1: "max-w-[90px] grid-cols-1",
    2: "max-w-[180px] grid-cols-2",
    3: "max-w-[260px] grid-cols-3",
    4: "max-w-[340px] grid-cols-4",
  }[values.length];

  return (
    <dl className={`relative z-10 grid w-full gap-4 text-center font-mono tabular-nums ${layoutClass}`}>
      {values.map((item) => (
        <div key={item.label} className="min-w-0">
          <dt className="text-[7px] font-medium uppercase tracking-[0.12em] text-zinc-300">{item.label}</dt>
          <dd className="mt-0.5 truncate text-[11px] font-semibold text-zinc-500">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
