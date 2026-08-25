import { ArrowRight, Check, FileSearch, Layers3, LockKeyhole, ScanLine } from "lucide-react";
import { Brand } from "@/components/brand";
import { ButtonLink } from "@/components/ui/button";

const steps = [
  ["01", "Upload", "Add a screenshot or PDF of any settled betslip."],
  ["02", "Extract", "We read the details and structure every selection."],
  ["03", "Review", "You stay in control—check every figure before saving."],
  ["04", "Understand", "See accurate P&L across platforms and currencies."],
];

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#0b0c0e] text-white">
      <div className="noise absolute inset-x-0 top-0 h-[min(680px,100vw)] opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <div className="pointer-events-none absolute left-1/2 top-[-280px] h-[560px] w-[min(900px,160vw)] -translate-x-1/2 rounded-full bg-lime-300/[.065] blur-[100px] sm:top-[-420px] sm:h-[800px] sm:blur-[120px]" />

      <header className="relative z-10 mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:h-20 sm:px-8">
        <Brand />
        <div className="flex shrink-0 items-center gap-2">
          <ButtonLink href="/start" variant="ghost" className="hidden sm:inline-flex">
            Sign in
          </ButtonLink>
          <ButtonLink href="/start" className="h-10 px-3 text-sm sm:px-4">
            <span className="sm:hidden">Start</span>
            <span className="hidden sm:inline">Start tracking</span>
            <ArrowRight className="size-4" />
          </ButtonLink>
        </div>
      </header>

      <section className="relative mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-8 sm:pb-24 sm:pt-28 lg:pb-32 lg:pt-36">
        <div className="mx-auto max-w-4xl text-center animate-rise">
          <div className="mb-5 inline-flex max-w-full items-center gap-2 rounded-full border border-lime-300/20 bg-lime-300/[.06] px-3 py-1.5 text-left text-[11px] font-semibold leading-snug text-lime-200 sm:mb-7 sm:text-xs">
            <LockKeyhole className="size-3.5 shrink-0" />
            <span>Private by design · No bookmaker connections</span>
          </div>
          <h1 className="text-balance text-[clamp(2.4rem,10vw,7rem)] font-semibold leading-[0.95] tracking-[-0.06em] sm:leading-[0.9] sm:tracking-[-0.075em]">
            Your betting P&amp;L.
            <br />
            <span className="text-zinc-500">Across every platform.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-balance text-[15px] leading-7 text-zinc-400 sm:mt-8 sm:text-lg">
            Upload settled betslips, keep all your betting history in one place, and understand your real profit and loss.
          </p>
          <div className="mt-7 flex w-full flex-col items-stretch gap-3 sm:mt-9 sm:items-center sm:justify-center sm:flex-row">
            <ButtonLink href="/start" className="h-12 w-full px-6 text-[15px] sm:w-auto">
              Start tracking for free <ArrowRight className="size-4" />
            </ButtonLink>
            <span className="text-center text-xs text-zinc-600">Username + password · no email needed</span>
          </div>
        </div>

        <div className="relative mx-auto mt-12 max-w-5xl animate-rise sm:mt-20 [animation-delay:150ms]">
          <div className="absolute -inset-8 bg-lime-300/[.035] blur-3xl sm:-inset-16" />
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#111214] p-1.5 shadow-[0_50px_120px_rgba(0,0,0,.55)] sm:rounded-3xl sm:p-2">
            <div className="flex h-9 items-center gap-2 border-b border-white/[.07] px-2.5 sm:h-10 sm:px-3">
              <span className="size-2 rounded-full bg-zinc-700" />
              <span className="size-2 rounded-full bg-zinc-700" />
              <span className="size-2 rounded-full bg-zinc-700" />
              <span className="ml-2 truncate text-[11px] font-medium text-zinc-600 sm:ml-3">Overview · All platforms</span>
            </div>
            <div className="grid gap-2.5 p-2.5 sm:gap-3 sm:p-5 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/[.07] bg-[#151619] p-4 sm:col-span-2 sm:p-5">
                <p className="text-xs font-medium text-zinc-500">Net P&amp;L · GBP</p>
                <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-lime-300 sm:mt-3 sm:text-4xl">+£1,284.60</p>
                <p className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-zinc-500">
                  <span className="rounded bg-lime-300/10 px-1.5 py-0.5 font-semibold text-lime-300">↑ 8.4%</span>
                  across 142 settled bets
                </p>
                <div className="mt-6 flex h-20 items-end gap-0.5 sm:mt-8 sm:h-28 sm:gap-1" aria-hidden="true">
                  {[24, 30, 27, 36, 31, 47, 41, 52, 48, 64, 57, 70, 63, 79, 76, 88, 82, 95].map((h, i) => (
                    <div key={i} className="min-w-0 flex-1 rounded-t bg-gradient-to-t from-lime-300/5 to-lime-300/55" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-1 sm:gap-3">
                <div className="rounded-2xl border border-white/[.07] bg-[#151619] p-3 sm:p-4">
                  <p className="text-[10px] font-medium text-zinc-500 sm:text-[11px]">Cash staked</p>
                  <p className="mt-1.5 text-base font-semibold sm:mt-2 sm:text-xl">£8,420.00</p>
                  <p className="mt-1 hidden text-[11px] text-zinc-600 sm:block">Promos excluded</p>
                </div>
                <div className="rounded-2xl border border-white/[.07] bg-[#151619] p-3 sm:p-4">
                  <p className="text-[10px] font-medium text-zinc-500 sm:text-[11px]">ROI</p>
                  <p className="mt-1.5 text-base font-semibold sm:mt-2 sm:text-xl">15.26%</p>
                  <p className="mt-1 hidden text-[11px] text-zinc-600 sm:block">Net P&amp;L / cash staked</p>
                </div>
                <div className="rounded-2xl border border-white/[.07] bg-[#151619] p-3 sm:p-4">
                  <p className="text-[10px] font-medium text-zinc-500 sm:text-[11px]">Win rate</p>
                  <p className="mt-1.5 text-base font-semibold sm:mt-2 sm:text-xl">54.8%</p>
                  <p className="mt-1 hidden text-[11px] text-zinc-600 sm:block">Won / won + lost</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/[.07] bg-[#0e0f11] px-4 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 max-w-xl sm:mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-lime-300">One clean workflow</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:mt-4 sm:text-5xl">From betslip to clarity.</h2>
          </div>
          <div className="grid border-y border-white/[.07] sm:grid-cols-2 lg:grid-cols-4">
            {steps.map(([number, title, copy], index) => (
              <div
                key={number}
                className="relative border-b border-white/[.07] py-7 last:border-b-0 sm:border-b sm:px-6 sm:py-8 lg:border-b-0 lg:border-r lg:last:border-r-0"
              >
                <span className="font-mono text-xs text-zinc-600">{number}</span>
                <h3 className="mt-6 text-lg font-semibold sm:mt-8">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-500">{copy}</p>
                {index < 3 && <ArrowRight className="absolute right-4 top-8 hidden size-4 text-zinc-800 lg:block" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:gap-14 sm:px-8 sm:py-24 lg:grid-cols-2 lg:items-center lg:py-32">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-lime-300">Facts in. Accurate P&amp;L out.</p>
          <h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-[-0.05em] sm:mt-4 sm:text-5xl">
            AI reads the slip.
            <br />
            You approve the numbers.
          </h2>
          <p className="mt-5 max-w-lg text-[15px] leading-7 text-zinc-500 sm:mt-6 sm:text-base">
            Betfolio never asks AI to calculate your profit. It extracts visible facts, flags ambiguity, and waits for your confirmation. Accounting stays deterministic.
          </p>
          <div className="mt-7 grid gap-3 text-sm text-zinc-300 sm:mt-8">
            {["Every import reviewed before saving", "Original currency preserved", "Private, owner-only betslip storage"].map((item) => (
              <div key={item} className="flex items-start gap-3 sm:items-center">
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-lime-300/10 sm:mt-0">
                  <Check className="size-3.5 text-lime-300" />
                </span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-white/[.08] bg-[#121315] p-3 sm:rounded-3xl sm:p-5">
          <div className="rounded-2xl bg-[#e9f3ee] p-4 text-zinc-900 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-black">BET365</span>
              <span className="rounded-full bg-emerald-700 px-2 py-1 text-[10px] font-bold text-white">WON</span>
            </div>
            <div className="my-4 border-t border-dashed border-zinc-300 sm:my-5" />
            <p className="text-xs text-zinc-500">Accumulator · 3 selections</p>
            <p className="mt-2 text-xl font-bold sm:text-2xl">Return £94.40</p>
            <p className="mt-1 text-sm text-zinc-500">Stake £20.00 · Odds 4.72</p>
          </div>
          <div className="grid grid-cols-3 gap-2 py-4 sm:py-5">
            <div className="rounded-xl bg-white/[.04] p-2.5 text-center sm:p-3">
              <ScanLine className="mx-auto size-4 text-lime-300" />
              <p className="mt-2 text-[10px] text-zinc-500">Fields found</p>
              <p className="mt-1 text-sm font-bold">16</p>
            </div>
            <div className="rounded-xl bg-white/[.04] p-2.5 text-center sm:p-3">
              <FileSearch className="mx-auto size-4 text-lime-300" />
              <p className="mt-2 text-[10px] text-zinc-500">Checks passed</p>
              <p className="mt-1 text-sm font-bold">9/10</p>
            </div>
            <div className="rounded-xl bg-white/[.04] p-2.5 text-center sm:p-3">
              <Layers3 className="mx-auto size-4 text-lime-300" />
              <p className="mt-2 text-[10px] text-zinc-500">Est. P&amp;L</p>
              <p className="mt-1 text-sm font-bold text-lime-300">+£74.40</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-8 sm:pb-24">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-2xl border border-lime-300/15 bg-lime-300/[.055] px-5 py-12 text-center sm:rounded-3xl sm:px-10 sm:py-16">
          <h2 className="text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">Know your real numbers.</h2>
          <p className="mx-auto mt-3 max-w-lg text-[15px] text-zinc-400 sm:mt-4 sm:text-base">
            Your first import takes a minute. Your betting history stays yours.
          </p>
          <ButtonLink href="/start" className="mt-7 h-12 w-full px-6 sm:mt-8 sm:w-auto">
            Start tracking <ArrowRight className="size-4" />
          </ButtonLink>
        </div>
      </section>

      <footer className="border-t border-white/[.07] px-4 py-8 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-xs text-zinc-600 sm:flex-row sm:items-center sm:justify-between">
          <Brand />
          <p className="leading-5">Historical tracking only. No tips, odds, or betting recommendations.</p>
        </div>
      </footer>
    </main>
  );
}
