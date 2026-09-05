"use client";

type FilterBarProps = {
  options: string[];
  active: string;
  onChange: (value: string) => void;
  tone?: "light" | "dark";
};

export function FilterBar({ options, active, onChange, tone = "dark" }: FilterBarProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`h-9 rounded-md border px-3 text-xs font-medium transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/40 ${
            active === option
              ? tone === "light"
                ? "border-rose-300 bg-rose-50 text-rose-700"
                : "border-rose-300/60 bg-rose-300/10 text-rose-100"
              : tone === "light"
                ? "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:text-zinc-950"
                : "border-white/10 bg-white/[0.03] text-zinc-400 hover:border-white/20 hover:text-zinc-100"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
