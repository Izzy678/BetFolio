import {
  ArrowRight,
  BarChart3,
  Check,
  CheckCircle2,
  FileCheck2,
  LockKeyhole,
  ScanLine,
  ShieldCheck,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { PnlChart } from "@/components/dashboard/pnl-chart";
import { ButtonLink } from "@/components/ui/button";
import { previewDashboard } from "@/lib/dashboard";

const platforms = ["Bet365", "Betway", "Sky Bet", "SportyBet"];

function ProductFrame() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#0b0b0e] shadow-[0_40px_140px_rgba(0,0,0,.6)] sm:rounded-2xl">
      <div className="flex h-10 items-center border-b border-white/[.07] px-3 sm:h-12 sm:px-4">
        <div className="flex gap-1.5" aria-hidden="true">
          <span className="size-2 rounded-full bg-zinc-700" />
          <span className="size-2 rounded-full bg-zinc-700" />
          <span className="size-2 rounded-full bg-zinc-700" />
        </div>
        <span className="mx-auto text-[10px] font-medium text-zinc-600 sm:text-[11px]">Overview · All platforms</span>
      </div>
      <div className="grid sm:grid-cols-[145px_1fr]">
        <aside className="hidden border-r border-white/[.06] bg-[#0a0a0d] p-3 sm:block">
          <div className="mb-5 flex items-center gap-2 px-1">
            <span className="grid size-6 place-items-center rounded-md bg-violet-500 text-[10px] font-black">B</span>
            <span className="text-[11px] font-semibold">betfolio</span>
          </div>
          {['Overview', 'Bets', 'Import', 'Platforms', 'Analytics'].map((item, index) => (
            <div key={item} className={`mb-1 rounded-md px-2 py-2 text-[10px] ${index === 0 ? 'bg-white/[.07] text-zinc-200' : index === 2 ? 'text-violet-400' : 'text-zinc-600'}`}>{item}</div>
          ))}
        </aside>
        <div className="min-w-0 p-3 sm:p-5 lg:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[9px] font-medium text-zinc-600 sm:text-[10px]">NET P&amp;L · GBP</p>
              <p className="mt-1.5 text-2xl font-semibold tracking-[-.045em] text-emerald-300 sm:text-4xl">+£1,284.60</p>
            </div>
            <span className="rounded-md border border-white/[.08] bg-white/[.035] px-2 py-1 text-[9px] text-zinc-500 sm:text-[10px]">Last 30 days</span>
          </div>
          <div className="mt-2 h-40 sm:mt-5 sm:h-52">
            <PnlChart data={previewDashboard.daily} currency="GBP" compact />
          </div>
          <div className="grid grid-cols-2 border-t border-white/[.06] sm:grid-cols-4">
            {[
              ["Cash staked", "£8,420"],
              ["Total returned", "£9,704"],
              ["ROI", "15.26%"],
              ["Win rate", "54.8%"],
            ].map(([label, value], index) => (
              <div key={label} className={`py-3 ${index % 2 ? 'pl-3' : ''} sm:px-3 sm:first:pl-0`}>
                <p className="text-[9px] text-zinc-600 sm:text-[10px]">{label}</p>
                <p className="mt-1 text-xs font-semibold text-zinc-200 sm:text-sm">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-semibold uppercase tracking-[.16em] text-violet-400">{children}</p>;
}

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0c0c10] text-zinc-100">
      <div className="noise pointer-events-none absolute inset-x-0 top-0 h-[720px] opacity-50 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <div className="pointer-events-none absolute left-1/2 top-[-460px] h-[780px] w-[900px] -translate-x-1/2 rounded-full bg-violet-500/[.12] blur-[150px]" />

      <header className="relative z-10 mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:h-20 sm:px-8">
        <Brand />
        <div className="flex items-center gap-1.5">
          <ButtonLink href="/start" variant="ghost" className="hidden sm:inline-flex">Sign in</ButtonLink>
          <ButtonLink href="/start" className="h-9 px-3 sm:px-4">
            Start tracking <ArrowRight className="size-3.5" />
          </ButtonLink>
        </div>
      </header>

      <section className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-8 sm:pb-28 sm:pt-28 lg:pt-32">
        <div className="mx-auto max-w-4xl text-center animate-rise">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/[.08] bg-white/[.035] px-3 py-1.5 text-[11px] text-zinc-400">
            <span className="size-1.5 rounded-full bg-violet-400 shadow-[0_0_12px_rgba(167,139,250,.8)]" />
            A private portfolio for every settled bet
          </div>
          <h1 className="text-balance mt-7 text-[clamp(3.2rem,9vw,7.2rem)] font-medium leading-[.92] tracking-[-.075em]">
            Know your real
            <br />
            <span className="text-zinc-500">betting P&amp;L.</span>
          </h1>
          <p className="text-balance mx-auto mt-6 max-w-xl text-[15px] leading-7 text-zinc-400 sm:text-lg">
            Every platform. Every settled bet. One calm, accurate view of how you&apos;re actually performing.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ButtonLink href="/start" className="h-11 w-full px-5 sm:w-auto">
              Start tracking for free <ArrowRight className="size-4" />
            </ButtonLink>
            <span className="inline-flex items-center gap-1.5 text-xs text-zinc-600"><LockKeyhole className="size-3.5" /> Username + password · no email</span>
          </div>
        </div>

        <div className="relative mx-auto mt-16 max-w-6xl animate-rise sm:mt-24 [animation-delay:150ms]">
          <div className="absolute -inset-16 bg-violet-500/[.055] blur-3xl" />
          <div className="relative"><ProductFrame /></div>
        </div>
      </section>

      <section className="border-y border-white/[.065] bg-[#0e0e12] px-4 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-[.75fr_1.25fr] lg:items-center">
            <div>
              <SectionLabel>One portfolio</SectionLabel>
              <h2 className="text-balance mt-4 text-3xl font-medium tracking-[-.05em] sm:text-5xl">Your betting history is scattered. Your P&amp;L shouldn&apos;t be.</h2>
              <p className="mt-5 max-w-lg text-[15px] leading-7 text-zinc-500">Betfolio sits above every bookmaker as the neutral accounting layer for your settled bets.</p>
            </div>
            <div className="rounded-2xl border border-white/[.07] bg-[#111116] p-5 sm:p-8">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {platforms.map((platform) => <div key={platform} className="rounded-lg border border-white/[.07] bg-white/[.025] px-3 py-3 text-center text-xs font-medium text-zinc-400">{platform}</div>)}
              </div>
              <div className="mx-auto h-10 w-px bg-gradient-to-b from-white/15 to-violet-400/50" />
              <div className="mx-auto flex max-w-sm items-center gap-3 rounded-xl border border-violet-400/20 bg-violet-400/[.075] p-4">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-violet-500 text-sm font-black">B</span>
                <div>
                  <p className="text-sm font-semibold">One Betfolio</p>
                  <p className="mt-0.5 text-xs text-zinc-500">One reliable P&amp;L across every platform</p>
                </div>
                <span className="ml-auto font-mono text-sm text-emerald-300">+£1,284</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-8 sm:py-32">
        <div className="mb-12 max-w-2xl">
          <SectionLabel>Import with confidence</SectionLabel>
          <h2 className="text-balance mt-4 text-3xl font-medium tracking-[-.05em] sm:text-5xl">Drop in a betslip. Review a clean financial record.</h2>
          <p className="mt-5 text-[15px] leading-7 text-zinc-500">AI reads the visible details. You approve the numbers. Deterministic accounting does the rest.</p>
        </div>
        <div className="grid overflow-hidden rounded-2xl border border-white/[.07] bg-[#111116] lg:grid-cols-2">
          <div className="grid min-h-[430px] place-items-center border-b border-white/[.07] bg-[#0e0e12] p-6 lg:border-b-0 lg:border-r">
            <div className="w-full max-w-sm rotate-[-1.5deg] rounded-xl bg-[#eff2ec] p-6 text-zinc-900 shadow-[0_24px_70px_rgba(0,0,0,.35)]">
              <div className="flex items-center justify-between"><strong>BET365</strong><span className="rounded-full bg-emerald-700 px-2 py-1 text-[10px] font-bold text-white">WON</span></div>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">Premier League Accumulator</p>
              <div className="my-6 border-t border-dashed border-zinc-300" />
              {[['Arsenal', 'Match result · 1.65'], ['Liverpool', 'Over 2.5 goals · 1.72'], ['Chelsea', 'Draw no bet · 1.44']].map(([team, market]) => <div key={team} className="mb-4 flex gap-3"><CheckCircle2 className="mt-0.5 size-4 text-emerald-700" /><div><p className="text-sm font-bold">{team}</p><p className="text-xs text-zinc-500">{market}</p></div></div>)}
              <div className="mt-5 grid grid-cols-2 border-t border-zinc-300 pt-4 text-sm"><div><p className="text-xs text-zinc-500">Stake</p><strong>£20.00</strong></div><div><p className="text-xs text-zinc-500">Return</p><strong>£94.40</strong></div></div>
            </div>
          </div>
          <div className="p-5 sm:p-8 lg:p-10">
            <div className="flex items-center justify-between"><span className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-300"><Check className="size-4" /> Slip processed</span><span className="text-[11px] text-zinc-600">Ready to review</span></div>
            <div className="mt-8 flex items-start justify-between gap-4"><div><p className="text-sm font-semibold">Bet365</p><p className="mt-1 text-xs text-zinc-500">Accumulator · 3 selections</p></div><span className="rounded-md bg-emerald-400/10 px-2 py-1 text-[10px] font-semibold text-emerald-300">WON</span></div>
            <div className="mt-8 divide-y divide-white/[.06] border-y border-white/[.06]">
              {[['Stake', '£20.00'], ['Return', '£94.40'], ['Total odds', '4.72']].map(([label, value]) => <div key={label} className="flex items-center justify-between py-3.5 text-sm"><span className="text-zinc-500">{label}</span><span className="font-medium text-zinc-200">{value}</span></div>)}
            </div>
            <div className="mt-8 flex items-end justify-between"><div><p className="text-xs text-zinc-500">Your P&amp;L</p><p className="mt-1 text-xs text-zinc-600">Cash in minus cash out</p></div><strong className="text-3xl tracking-[-.04em] text-emerald-300">+£74.40</strong></div>
            <div className="mt-8 flex gap-2"><button className="h-10 flex-1 rounded-lg border border-white/10 bg-white/[.04] text-sm font-semibold text-zinc-300">Edit</button><button className="h-10 flex-[1.35] rounded-lg bg-violet-500 text-sm font-semibold text-white">Add to portfolio</button></div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/[.065] bg-[#0e0e12] px-4 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
            <div>
              <SectionLabel>Portfolio intelligence</SectionLabel>
              <h2 className="text-balance mt-4 text-3xl font-medium tracking-[-.05em] sm:text-5xl">See where your money actually performs.</h2>
              <p className="mt-5 max-w-lg text-[15px] leading-7 text-zinc-500">Compare platforms, follow your returns over time, and spot patterns without the noise of a sportsbook.</p>
              <div className="mt-8 grid gap-3 text-sm text-zinc-300 sm:grid-cols-2 lg:grid-cols-1">
                {[[BarChart3, 'P&L over time'], [ScanLine, 'Performance by platform'], [FileCheck2, 'A complete settled-bet ledger']].map(([Icon, label]) => {
                  const ItemIcon = Icon as typeof BarChart3;
                  return <div key={String(label)} className="flex items-center gap-3"><span className="grid size-8 place-items-center rounded-lg bg-violet-400/10 text-violet-300"><ItemIcon className="size-4" /></span>{String(label)}</div>;
                })}
              </div>
            </div>
            <div className="rounded-2xl border border-white/[.07] bg-[#111116] p-5 sm:p-7">
              <div className="flex items-end justify-between gap-4"><div><p className="text-xs text-zinc-500">P&amp;L by platform</p><p className="mt-2 text-2xl font-semibold tracking-[-.035em]">+£1,284.60</p></div><span className="text-[11px] text-zinc-600">All time · GBP</span></div>
              <div className="mt-8 grid gap-5">
                {[['Bet365', '+£624.40', 100, true], ['Sky Bet', '+£311.20', 58, true], ['Paddy Power', '+£204.50', 42, true], ['William Hill', '-£84.10', 20, false]].map(([name, amount, width, positive]) => <div key={String(name)}><div className="mb-2 flex justify-between text-xs"><span className="text-zinc-400">{String(name)}</span><span className={positive ? 'text-emerald-300' : 'text-rose-300'}>{String(amount)}</span></div><div className="h-1.5 overflow-hidden rounded-full bg-white/[.05]"><div className={positive ? 'h-full rounded-full bg-emerald-400/70' : 'h-full rounded-full bg-rose-400/70'} style={{ width: `${Number(width)}%` }} /></div></div>)}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-8 sm:py-28">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-2xl border border-violet-400/15 bg-violet-400/[.055] px-6 py-16 text-center sm:px-12 sm:py-20">
          <div className="pointer-events-none absolute left-1/2 top-[-160px] size-80 -translate-x-1/2 rounded-full bg-violet-500/15 blur-[100px]" />
          <Sparkles className="relative mx-auto size-5 text-violet-300" />
          <h2 className="text-balance relative mt-5 text-4xl font-medium tracking-[-.055em] sm:text-6xl">Every bet. One portfolio.</h2>
          <p className="relative mx-auto mt-4 max-w-lg text-[15px] leading-7 text-zinc-400">Build the complete record of your betting performance—privately, accurately, and on your terms.</p>
          <ButtonLink href="/start" className="relative mt-8 h-11 px-5">Start tracking <ArrowRight className="size-4" /></ButtonLink>
          <div className="relative mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] text-zinc-600"><span className="inline-flex items-center gap-1.5"><ShieldCheck className="size-3.5" /> Private by default</span><span className="inline-flex items-center gap-1.5"><UploadCloud className="size-3.5" /> No bookmaker connection</span></div>
        </div>
      </section>

      <footer className="border-t border-white/[.065] px-4 py-8 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-xs text-zinc-600 sm:flex-row sm:items-center sm:justify-between">
          <Brand />
          <p>Historical tracking only. No tips, odds, or betting recommendations.</p>
        </div>
      </footer>
    </main>
  );
}
