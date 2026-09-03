type StatCardProps = {
  label: string;
  value: string;
  detail?: string;
};

export function StatCard({ label, value, detail }: StatCardProps) {
  return (
    <div className="border border-white/10 bg-white/[0.035] p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-zinc-50">{value}</p>
      {detail ? <p className="mt-1 text-sm text-zinc-500">{detail}</p> : null}
    </div>
  );
}
