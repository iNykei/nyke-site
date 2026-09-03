type AvatarMarkProps = {
  seed: string;
  size?: "sm" | "md" | "lg" | "xl";
};

const sizes = {
  sm: "size-8 text-[11px]",
  md: "size-11 text-sm",
  lg: "size-16 text-lg",
  xl: "size-24 text-2xl",
};

export function AvatarMark({ seed, size = "md" }: AvatarMarkProps) {
  return (
    <span
      className={`grid shrink-0 place-items-center border border-white/10 bg-zinc-900 font-semibold text-zinc-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] ${sizes[size]}`}
    >
      {seed}
    </span>
  );
}
