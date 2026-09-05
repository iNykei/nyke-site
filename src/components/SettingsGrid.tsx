import { calculateCm360, calculateEdpi, formatNumber } from "@/lib/calculations";
import type { GameSettings } from "@/types";
import { StatCard } from "./StatCard";

type SettingsGridProps = {
  settings: GameSettings;
};

export function SettingsGrid({ settings }: SettingsGridProps) {
  const edpi = calculateEdpi(settings.dpi, settings.sensitivity);
  const cm360 = calculateCm360(settings.dpi, settings.sensitivity);

  const values = [
    { label: "Game", value: settings.game },
    { label: "Rank", value: settings.rank },
    { label: "DPI", value: settings.dpi ? String(settings.dpi) : "--" },
    { label: "Sensitivity", value: settings.sensitivity ? String(settings.sensitivity) : "--" },
    { label: "eDPI", value: formatNumber(edpi, 0), detail: "Auto calculated" },
    { label: "cm/360", value: formatNumber(cm360, 2), detail: "Auto calculated" },
    { label: "Resolution", value: settings.resolution },
    { label: "Polling Rate", value: settings.pollingRate },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {values.map((item) => (
        <StatCard key={item.label} label={item.label} value={item.value} detail={item.detail} />
      ))}
    </div>
  );
}
