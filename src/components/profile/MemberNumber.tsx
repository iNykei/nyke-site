import { formatMemberNumber } from "@/lib/identity";

type MemberNumberProps = {
  value: number | null;
};

export function MemberNumber({ value }: MemberNumberProps) {
  if (value === null) {
    return null;
  }

  return (
    <p className="inline-flex items-baseline gap-1.5 text-[10px] font-semibold uppercase text-zinc-500">
      <span>NYKE member</span>
      <span className="font-mono text-[11px] tabular-nums text-zinc-800">{formatMemberNumber(value)}</span>
    </p>
  );
}
