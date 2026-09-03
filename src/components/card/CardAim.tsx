import { calculateCm360, calculateEdpi, formatNumber } from "@/lib/calculations";
import type { PlayerProfile } from "@/types";

type CardAimProps = {
  player: PlayerProfile;
};

export function CardAim({ player }: CardAimProps) {
  const edpi = calculateEdpi(player.settings.dpi, player.settings.sensitivity);
  const cm360 = calculateCm360(player.settings.dpi, player.settings.sensitivity);
  const metrics = [
    ["DPI", player.settings.dpi === null ? "—" : String(player.settings.dpi), false],
    ["Sens", player.settings.sensitivity === null ? "—" : String(player.settings.sensitivity), false],
    ["eDPI", edpi === null ? "—" : formatNumber(edpi, 0), true],
    ["cm / 360", cm360 === null ? "—" : formatNumber(cm360, 2), true],
  ] as const;
  const secondary = [player.settings.resolution, player.settings.pollingRate].filter(Boolean).join("  ·  ");

  return (
    <section className="mx-9 border-y border-zinc-300/80 py-5">
      <div className="flex items-end justify-between gap-5">
        <div className="min-w-0">
          <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-zinc-400">Player core</p>
          <p className="mt-1.5 truncate text-[13px] font-semibold uppercase text-zinc-700">{player.settings.game || "—"}</p>
        </div>
        <p className="max-w-[270px] truncate text-right font-serif text-[28px] font-black uppercase leading-none text-zinc-950">
          {player.settings.rank || "—"}
        </p>
      </div>

      <div className="mt-5 grid grid-cols-4 gap-2">
        {metrics.map(([label, value, highlighted]) => (
          <div key={label} className="min-w-0 border-l border-zinc-300 pl-3 first:border-l-0 first:pl-0">
            <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-zinc-400">{label}</p>
            <p className={`mt-1.5 truncate font-mono text-[16px] font-semibold tabular-nums ${highlighted && value !== "—" ? "text-lime-700" : "text-zinc-900"}`}>
              {value}
            </p>
          </div>
        ))}
      </div>
      {secondary ? <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.06em] text-zinc-500">{secondary}</p> : null}
    </section>
  );
}
