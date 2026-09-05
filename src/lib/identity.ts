export function formatMemberNumber(value: number) {
  return `#${String(value).padStart(6, "0")}`;
}
