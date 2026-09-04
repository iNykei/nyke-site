import { IdCard, Settings2, Share2 } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Claim your identity",
    description: "Choose your @username and receive your permanent NYKE member number.",
    icon: IdCard,
  },
  {
    number: "02",
    title: "Build your profile",
    description: "Add your game, rank, aim settings and active gear.",
    icon: Settings2,
  },
  {
    number: "03",
    title: "Generate your Card",
    description: "Turn your setup into a shareable NYKE Card.",
    icon: Share2,
  },
];

export function HowNYKEWorks() {
  return (
    <section className="mx-auto w-full max-w-6xl py-16 sm:px-6 sm:py-20" aria-labelledby="how-nyke-works">
      <div className="mb-9 text-center">
        <p className="text-[11px] font-semibold uppercase text-rose-500">Profile in. Card out.</p>
        <h2 id="how-nyke-works" className="mt-2 font-serif text-3xl font-black text-zinc-950 sm:text-4xl">
          How NYKE works
        </h2>
      </div>
      <ol className="grid border-y border-zinc-200 sm:grid-cols-3">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <li
              key={step.number}
              className={`relative px-2 py-7 sm:px-7 sm:py-8 ${index > 0 ? "border-t border-zinc-200 sm:border-l sm:border-t-0" : ""}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold tabular-nums text-rose-500">{step.number}</span>
                <Icon className="size-4 text-zinc-400" aria-hidden="true" />
              </div>
              <h3 className="mt-5 text-base font-semibold text-zinc-950">{step.title}</h3>
              <p className="mt-2 max-w-xs text-sm leading-6 text-zinc-500">{step.description}</p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
