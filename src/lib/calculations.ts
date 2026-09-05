const VALORANT_YAW = 0.07;
const INCHES_TO_CM = 2.54;

export function calculateEdpi(dpi: number | null, sensitivity: number | null) {
  if (!dpi || !sensitivity || dpi <= 0 || sensitivity <= 0) {
    return null;
  }

  return dpi * sensitivity;
}

export function calculateCm360(dpi: number | null, sensitivity: number | null) {
  if (!dpi || !sensitivity || dpi <= 0 || sensitivity <= 0) {
    return null;
  }

  return (360 / (sensitivity * VALORANT_YAW)) * (INCHES_TO_CM / dpi);
}

export function formatNumber(value: number | null, digits = 1) {
  if (value === null || Number.isNaN(value)) {
    return "--";
  }

  return value.toFixed(digits);
}
