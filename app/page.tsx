import { ArrowRight, Check } from "lucide-react";
import { Brand } from "@/components/brand";
import { ButtonLink } from "@/components/ui/button";
import { LandingDashboardMock } from "@/components/marketing/landing-dashboard-mock";

const CTA = "Start tracking for free";
const NAV_CTA = "Start tracking";

const steps = [
  ["01", "Upload", "Add a screenshot or PDF of any settled betslip."],
  [
    "02",
    "Extract",
    "We read the stake, return, odds and result from the slip.",
  ],
  ["03", "Review", "You check every figure before anything is posted."],
  ["04", "Track", "See accurate P&L across platforms and currencies."],
];

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#0b0c0e] text-white">
      <div className="noise absolute inset-x-0 top-0 h-[min(560px,100vw)] opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <div
        className="pointer-events-none absolute left-1/2 top-[-280px] h-[480px] w-[min(800px,160vw)] -translate-x-1/2 rounded-full bg-white/[.03] blur-[100px] sm:top-[-360px] sm:h-[640px]"
        aria-hidden="true"
      />

      <header className="relative z-10 mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-8">
        <Brand />
        <div className="flex shrink-0 items-center gap-2">
          <ButtonLink
            href="/start"
            variant="ghost"
            className="hidden h-10 sm:inline-flex"
          >
            Sign in
          </ButtonLink>
          <ButtonLink
            href="/start"
            variant="outline"
            className="h-10 px-3 text-sm sm:px-4"
          >
            <span className="sm:hidden">Start</span>
            <span className="hidden sm:inline">{NAV_CTA}</span>
          </ButtonLink>
        </div>
      </header>

      <section className="relative mx-auto max-w-7xl px-4 pb-12 pt-10 sm:px-8 sm:pb-16 sm:pt-16 lg:pt-20">
        {/* Linear-style write-up: left-aligned headline + subcopy row */}
        <div className="max-w-3xl">
          <h1 className="animate-hero-headline text-balance text-[clamp(2rem,5.2vw,3.75rem)] font-semibold leading-[1.05] tracking-[-0.05em] text-white">
            Your betting P&amp;L across every platform.
          </h1>
          <div className="animate-hero-sub mt-5 flex flex-col gap-4 sm:mt-6 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
            <p className="max-w-md text-[15px] leading-7 text-zinc-400 sm:text-base sm:leading-7">
              Upload settled betslips, keep history in one place, and see real
              profit and loss — private by design.
            </p>
            <a
              href="#workflow"
              className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-zinc-300 transition-colors hover:text-white"
            >
              How it works
              <ArrowRight className="size-3.5" />
            </a>
          </div>
        </div>

        <div
          className="animate-hero-product relative mx-auto mt-12 max-w-6xl sm:mt-16 lg:mt-20"
          aria-hidden="true"
        >
          <div
            className="pointer-events-none absolute left-1/2 top-[40%] h-[55%] w-[90%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[.03] blur-[80px]"
            aria-hidden="true"
          />
          <LandingDashboardMock />
        </div>
      </section>

      <p className="animate-hero-proof mx-auto max-w-7xl px-4 pb-10 text-center text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500 sm:px-8 sm:pb-14 sm:text-xs">
        Works with slips from any bookmaker
      </p>

      <section
        id="workflow"
        className="border-y border-white/[.07] bg-[#0e0f11] px-4 py-10 sm:px-8 sm:py-14"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-5 max-w-xl sm:mb-7">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
              One clean workflow
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white sm:mt-3 sm:text-4xl">
              From betslip to clarity.
            </h2>
          </div>
          <div className="grid border-y border-white/[.07] sm:grid-cols-2 lg:grid-cols-4">
            {steps.map(([number, title, copy], index) => (
              <div
                key={number}
                className="relative border-b border-white/[.07] py-5 last:border-b-0 sm:border-b sm:px-5 sm:py-6 lg:border-b-0 lg:border-r lg:last:border-r-0"
              >
                <span className="font-mono text-xs text-zinc-400">
                  {number}
                </span>
                <h3 className="mt-3 text-base font-semibold text-white sm:mt-4 sm:text-lg">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-zinc-400">{copy}</p>
                {index < steps.length - 1 && (
                  <ArrowRight
                    className="absolute right-3 top-6 hidden size-4 text-zinc-700 lg:block"
                    aria-hidden="true"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:gap-10 sm:px-8 sm:py-14 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
            Facts in. Accurate P&amp;L out.
          </p>
          <h2 className="mt-2 max-w-xl text-2xl font-semibold tracking-[-0.04em] text-white sm:mt-3 sm:text-4xl">
            AI reads the slip. You approve the numbers.
          </h2>
          <p className="mt-4 max-w-lg text-[15px] leading-7 text-zinc-400 sm:mt-5 sm:text-base">
            Betfolio never asks AI to calculate your profit. It extracts visible
            facts, flags ambiguity, and waits for your confirmation. Accounting
            stays deterministic.
          </p>
          <div className="mt-6 grid gap-3 text-sm text-zinc-300 sm:mt-7">
            {[
              "Every import reviewed before saving",
              "Original currency preserved",
              "Private, owner-only betslip storage",
            ].map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 sm:items-center"
              >
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-white/[.06] sm:mt-0">
                  <Check className="size-3.5 text-zinc-200" />
                </span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-white/[.08] bg-[#121315] p-3 sm:p-5">
          <div className="rounded-2xl bg-[#e9f3ee] p-4 text-zinc-900 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-black">Atlas Bet</span>
              <span className="rounded-full bg-emerald-700 px-2 py-1 text-[10px] font-bold text-white">
                WON
              </span>
            </div>
            <div className="my-4 border-t border-dashed border-zinc-300 sm:my-5" />
            <p className="text-xs text-zinc-600">Accumulator</p>
            <p className="mt-2 text-xl font-bold sm:text-2xl">Return £94.40</p>
            <p className="mt-1 text-sm text-zinc-600">
              Stake £20.00 · Odds 4.72
            </p>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-white/[.04] px-3 py-3">
              <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-400">
                Fields read
              </p>
              <p className="mt-1 text-sm font-semibold text-white">
                Stake · return · odds · result
              </p>
            </div>
            <div className="rounded-xl bg-white/[.04] px-3 py-3">
              <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-400">
                Est. P&amp;L
              </p>
              <p className="mt-1 text-sm font-semibold text-emerald-400">
                +£74.40
              </p>
              <p className="mt-1 text-[11px] text-zinc-400">
                Posted only after you confirm
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-8 sm:px-8 sm:py-10">
        <div className="mx-auto flex max-w-3xl flex-col items-start gap-4 rounded-2xl border border-white/10 bg-white/[.03] px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-7 sm:py-7">
          <div>
            <h2 className="text-xl font-semibold tracking-[-0.03em] text-white sm:text-2xl">
              Know your real numbers.
            </h2>
            <p className="mt-1.5 text-sm text-zinc-400">
              Your first import takes a minute. Your history stays yours.
            </p>
          </div>
          <ButtonLink
            href="/start"
            className="h-11 w-full shrink-0 px-5 sm:w-auto"
          >
            {CTA} <ArrowRight className="size-4" />
          </ButtonLink>
        </div>
      </section>

      <footer className="border-t border-white/[.07] px-4 py-7 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <Brand />
          <div className="max-w-xl space-y-2 text-xs leading-5 text-zinc-400">
            <p>
              Historical tracking only. No tips, odds, or betting
              recommendations.
            </p>
            <p>
              18+ only. Betfolio does not facilitate gambling. If betting is
              causing you harm, seek help — for example via{" "}
              <a
                href="https://www.begambleaware.org"
                className="underline decoration-white/25 underline-offset-2 hover:text-zinc-200"
                target="_blank"
                rel="noreferrer"
              >
                BeGambleAware
              </a>
              .
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
