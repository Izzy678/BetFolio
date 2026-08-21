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
  return <main className="min-h-screen overflow-hidden bg-[#0b0c0e] text-white">
    <div className="noise absolute inset-x-0 top-0 h-[680px] opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
    <div className="pointer-events-none absolute left-1/2 top-[-420px] h-[800px] w-[900px] -translate-x-1/2 rounded-full bg-lime-300/[.065] blur-[120px]" />
    <header className="relative z-10 mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8"><Brand /><div className="flex items-center gap-2"><ButtonLink href="/start" variant="ghost" className="hidden sm:inline-flex">Sign in</ButtonLink><ButtonLink href="/start" className="h-10 px-4">Start tracking <ArrowRight className="size-4" /></ButtonLink></div></header>

    <section className="relative mx-auto max-w-7xl px-5 pb-24 pt-20 sm:px-8 sm:pt-28 lg:pb-32 lg:pt-36">
      <div className="mx-auto max-w-4xl text-center animate-rise">
        <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-lime-300/20 bg-lime-300/[.06] px-3 py-1.5 text-xs font-semibold text-lime-200"><LockKeyhole className="size-3.5" />Private by design · No bookmaker connections</div>
        <h1 className="text-balance text-[clamp(3.3rem,9vw,7rem)] font-semibold leading-[.9] tracking-[-.075em]">Your betting P&amp;L.<br /><span className="text-zinc-500">Across every platform.</span></h1>
        <p className="mx-auto mt-8 max-w-2xl text-balance text-base leading-7 text-zinc-400 sm:text-lg">Upload settled betslips, keep all your betting history in one place, and understand your real profit and loss.</p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"><ButtonLink href="/start" className="h-12 px-6 text-[15px]">Start tracking for free <ArrowRight className="size-4" /></ButtonLink><span className="text-xs text-zinc-600">Username only · no email needed</span></div>
      </div>

      <div className="relative mx-auto mt-20 max-w-5xl animate-rise [animation-delay:150ms]">
        <div className="absolute -inset-16 bg-lime-300/[.035] blur-3xl" />
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#111214] p-2 shadow-[0_50px_120px_rgba(0,0,0,.55)]">
          <div className="flex h-10 items-center gap-2 border-b border-white/[.07] px-3"><span className="size-2 rounded-full bg-zinc-700" /><span className="size-2 rounded-full bg-zinc-700" /><span className="size-2 rounded-full bg-zinc-700" /><span className="ml-3 text-[11px] font-medium text-zinc-600">Overview · All platforms</span></div>
          <div className="grid gap-3 p-3 sm:grid-cols-3 sm:p-5">
            <div className="rounded-2xl border border-white/[.07] bg-[#151619] p-5 sm:col-span-2"><p className="text-xs font-medium text-zinc-500">Net P&amp;L · GBP</p><p className="mt-3 text-4xl font-semibold tracking-[-.04em] text-lime-300">+£1,284.60</p><p className="mt-2 flex items-center gap-1.5 text-xs text-zinc-500"><span className="rounded bg-lime-300/10 px-1.5 py-0.5 font-semibold text-lime-300">↑ 8.4%</span> across 142 settled bets</p><div className="mt-8 flex h-28 items-end gap-1" aria-hidden="true">{[24,30,27,36,31,47,41,52,48,64,57,70,63,79,76,88,82,95].map((h, i) => <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-lime-300/5 to-lime-300/55" style={{ height: `${h}%` }} />)}</div></div>
            <div className="grid gap-3"><div className="rounded-2xl border border-white/[.07] bg-[#151619] p-4"><p className="text-[11px] font-medium text-zinc-500">Cash staked</p><p className="mt-2 text-xl font-semibold">£8,420.00</p><p className="mt-1 text-[11px] text-zinc-600">Promos excluded</p></div><div className="rounded-2xl border border-white/[.07] bg-[#151619] p-4"><p className="text-[11px] font-medium text-zinc-500">ROI</p><p className="mt-2 text-xl font-semibold">15.26%</p><p className="mt-1 text-[11px] text-zinc-600">Net P&amp;L / cash staked</p></div><div className="rounded-2xl border border-white/[.07] bg-[#151619] p-4"><p className="text-[11px] font-medium text-zinc-500">Win rate</p><p className="mt-2 text-xl font-semibold">54.8%</p><p className="mt-1 text-[11px] text-zinc-600">Won / won + lost</p></div></div>
          </div>
        </div>
      </div>
    </section>

    <section className="border-y border-white/[.07] bg-[#0e0f11] px-5 py-24 sm:px-8"><div className="mx-auto max-w-7xl"><div className="mb-12 max-w-xl"><p className="text-xs font-bold uppercase tracking-[.18em] text-lime-300">One clean workflow</p><h2 className="mt-4 text-3xl font-semibold tracking-[-.04em] sm:text-5xl">From betslip to clarity.</h2></div><div className="grid border-y border-white/[.07] sm:grid-cols-2 lg:grid-cols-4">{steps.map(([number, title, copy], index) => <div key={number} className="relative border-b border-white/[.07] py-8 sm:px-6 lg:border-b-0 lg:border-r lg:last:border-r-0"><span className="font-mono text-xs text-zinc-600">{number}</span><h3 className="mt-8 text-lg font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-zinc-500">{copy}</p>{index < 3 && <ArrowRight className="absolute right-4 top-8 hidden size-4 text-zinc-800 lg:block" />}</div>)}</div></div></section>

    <section className="mx-auto grid max-w-7xl gap-14 px-5 py-24 sm:px-8 lg:grid-cols-2 lg:items-center lg:py-32"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-lime-300">Facts in. Accurate P&amp;L out.</p><h2 className="mt-4 max-w-xl text-4xl font-semibold tracking-[-.05em] sm:text-5xl">AI reads the slip.<br />You approve the numbers.</h2><p className="mt-6 max-w-lg leading-7 text-zinc-500">Ledgerline never asks AI to calculate your profit. It extracts visible facts, flags ambiguity, and waits for your confirmation. Accounting stays deterministic.</p><div className="mt-8 grid gap-3 text-sm text-zinc-300">{["Every import reviewed before saving", "Original currency preserved", "Private, owner-only betslip storage"].map((item) => <div key={item} className="flex items-center gap-3"><span className="grid size-6 place-items-center rounded-full bg-lime-300/10"><Check className="size-3.5 text-lime-300" /></span>{item}</div>)}</div></div><div className="rounded-3xl border border-white/[.08] bg-[#121315] p-5"><div className="rounded-2xl bg-[#e9f3ee] p-5 text-zinc-900"><div className="flex items-center justify-between"><span className="text-sm font-black">BET365</span><span className="rounded-full bg-emerald-700 px-2 py-1 text-[10px] font-bold text-white">WON</span></div><div className="my-5 border-t border-dashed border-zinc-300" /><p className="text-xs text-zinc-500">Accumulator · 3 selections</p><p className="mt-2 text-2xl font-bold">Return £94.40</p><p className="mt-1 text-sm text-zinc-500">Stake £20.00 · Odds 4.72</p></div><div className="grid grid-cols-3 gap-2 py-5"><div className="rounded-xl bg-white/[.04] p-3 text-center"><ScanLine className="mx-auto size-4 text-lime-300" /><p className="mt-2 text-[10px] text-zinc-500">Fields found</p><p className="mt-1 text-sm font-bold">16</p></div><div className="rounded-xl bg-white/[.04] p-3 text-center"><FileSearch className="mx-auto size-4 text-lime-300" /><p className="mt-2 text-[10px] text-zinc-500">Checks passed</p><p className="mt-1 text-sm font-bold">9/10</p></div><div className="rounded-xl bg-white/[.04] p-3 text-center"><Layers3 className="mx-auto size-4 text-lime-300" /><p className="mt-2 text-[10px] text-zinc-500">Est. P&amp;L</p><p className="mt-1 text-sm font-bold text-lime-300">+£74.40</p></div></div></div></section>

    <section className="px-5 pb-24 sm:px-8"><div className="mx-auto max-w-7xl overflow-hidden rounded-3xl border border-lime-300/15 bg-lime-300/[.055] px-6 py-16 text-center sm:px-10"><h2 className="text-4xl font-semibold tracking-[-.05em]">Know your real numbers.</h2><p className="mx-auto mt-4 max-w-lg text-zinc-400">Your first import takes a minute. Your betting history stays yours.</p><ButtonLink href="/start" className="mt-8 h-12 px-6">Start tracking <ArrowRight className="size-4" /></ButtonLink></div></section>
    <footer className="border-t border-white/[.07] px-5 py-8 sm:px-8"><div className="mx-auto flex max-w-7xl flex-col gap-4 text-xs text-zinc-600 sm:flex-row sm:items-center sm:justify-between"><Brand /><p>Historical tracking only. No tips, odds, or betting recommendations.</p></div></footer>
  </main>;
}
