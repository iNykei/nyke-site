import { calculateCm360, calculateEdpi, formatNumber } from "@/lib/calculations";
import type { PlayerProfile } from "@/types";

export function CardAim({ player }: { player: PlayerProfile }) {
  const { settings } = player;
  const edpi = calculateEdpi(settings.dpi, settings.sensitivity);
  const cm360 = calculateCm360(settings.dpi, settings.sensitivity);
  const values = [
    settings.sensitivity !== null ? `${formatNumber(settings.sensitivity, 2)} SENS` : null,
    settings.dpi !== null ? `${settings.dpi} DPI` : null,
    edpi !== null ? `${formatNumber(edpi, 0)} eDPI` : null,
    cm360 !== null ? `${formatNumber(cm360, 2)} CM/360` : null,
  ].filter((value): value is string => value !== null);

  if (values.length === 0) {
    return null;
  }

  return (
    <p className="relative z-10 text-center font-mono text-[13px] font-semibold tabular-nums tracking-[0.02em] text-zinc-600">
      {values.map((value, index) => (
        <span key={value}>
          {index > 0 ? <span className="mx-2 text-zinc-300">·</span> : null}
          <span className={value.includes("eDPI") || value.includes("CM/360") ? "text-lime-700" : ""}>{value}</span>
        </span>
      ))}
    </p>
  );
}
