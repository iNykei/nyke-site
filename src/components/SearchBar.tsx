"use client";

import { Search } from "lucide-react";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  tone?: "light" | "dark";
};

export function SearchBar({ value, onChange, placeholder, tone = "dark" }: SearchBarProps) {
  const inputClass =
    tone === "light"
      ? "border-zinc-200 bg-white text-zinc-900 placeholder:text-zinc-400 focus:border-rose-300"
      : "border-white/10 bg-white/[0.035] text-zinc-100 placeholder:text-zinc-600 focus:border-rose-300/50";

  return (
    <label className="relative block">
      <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={17} />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={`h-9 w-full rounded-md border pl-9 pr-3 text-xs outline-none transition duration-200 ${inputClass}`}
      />
    </label>
  );
}
