import { Check } from "lucide-react";

export function ActiveGearMark() {
  return <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2 py-1 text-[9px] font-bold uppercase text-rose-600"><Check size={11} aria-hidden="true" />Active</span>;
}
