const VALORANT_YAW = 0.07;
const COUNTER_STRIKE_YAW = 0.022;
const INCHES_TO_CM = 2.54;

// Only verified default yaw values are supported. Unknown or custom yaw is unavailable.
function yawForGame(game: string | null | undefined): number | null {
  switch (game?.trim().toLowerCase()) {
    case "valorant":
      return VALORANT_YAW;
    case "cs2":
    case "counter-strike 2":
    case "counter strike 2":
      return COUNTER_STRIKE_YAW;
    default:
      return null;
  }
}

export function calculateEdpi(dpi: number | null, sensitivity: number | null) {
  if (!dpi || !sensitivity || dpi <= 0 || sensitivity <= 0) {
    return null;
  }

  return dpi * sensitivity;
}

export function calculateCm360(dpi: number | null, sensitivity: number | null, game: string | null | undefined) {
  const yaw = yawForGame(game);
  if (dpi === null || sensitivity === null || !Number.isFinite(dpi) || !Number.isFinite(sensitivity) || dpi <= 0 || sensitivity <= 0 || yaw === null) {
    return null;
  }

  const cm360 = (360 * INCHES_TO_CM) / (sensitivity * yaw * dpi);
  return Number.isFinite(cm360) && cm360 > 0 ? cm360 : null;
}

export function formatNumber(value: number | null, digits = 1) {
  if (value === null || Number.isNaN(value)) {
    return "--";
  }

  return value.toFixed(digits);
}
