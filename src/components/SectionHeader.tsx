type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  detail?: string;
};

export function SectionHeader({ eyebrow, title, detail }: SectionHeaderProps) {
  return (
    <div className="flex min-w-0 items-end justify-between gap-4">
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">{eyebrow}</p>
        <h2 className="mt-1 text-xl font-semibold text-zinc-50">{title}</h2>
      </div>
      {detail ? <p className="hidden text-right text-xs text-zinc-500 sm:block">{detail}</p> : null}
    </div>
  );
}
