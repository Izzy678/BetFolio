import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronRight,
  CircleMinus,
  Plus,
  ReceiptText,
  TrendingUp,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { DashboardSnapshot } from "@/lib/dashboard";
import { formatDisplayDate } from "@/lib/dates";
import { formatMoney, titleCase } from "@/lib/utils";
import { DashboardFilters } from "./dashboard-filters";
import { PnlChart } from "./pnl-chart";

export function DashboardView({ data, username, range }: { data: DashboardSnapshot; username: string; range: string }) {
  const { summary, currency } = data;
  const stats = [
    ["Cash staked", formatMoney(summary.cashStaked, currency), "Cash stakes only"],
    ["Total returned", formatMoney(summary.totalReturned, currency), "Settlements + refunds"],
    ["ROI", summary.roi == null ? "—" : `${summary.roi.toFixed(2)}%`, "Net P&L / staked"],
    ["Win rate", summary.winRate == null ? "—" : `${summary.winRate.toFixed(1)}%`, `${summary.totalBets} settled bets`],
  ];
  const maxBookmaker = Math.max(...data.bookmakers.map((item) => Math.abs(item.pnl)), 1);

  return (
    <div className="mx-auto max-w-[1450px] px-4 py-6 sm:px-7 lg:px-9 lg:py-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs text-zinc-600">Good to see you, @{username}</p>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-[-.04em] text-zinc-100 sm:text-3xl">Overview</h1>
        </div>
        <DashboardFilters currency={currency} currencies={data.currencies} range={range} />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1.62fr_.78fr]">
        <Card className="overflow-hidden">
          <div className="p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[.12em] text-zinc-600">Net P&amp;L · {currency}</p>
                <div className="mt-2 flex items-end gap-2.5">
                  <p className={`text-4xl font-semibold tracking-[-.055em] sm:text-5xl ${summary.netPnl >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
                    {formatMoney(summary.netPnl, currency, true)}
                  </p>
                  <span className={`mb-1.5 grid size-7 place-items-center rounded-full ${summary.netPnl >= 0 ? "bg-emerald-400/10 text-emerald-300" : "bg-rose-400/10 text-rose-300"}`}>
                    {summary.netPnl >= 0 ? <ArrowUpRight className="size-4" /> : <ArrowDownRight className="size-4" />}
                  </span>
                </div>
                <p className="mt-2 text-xs text-zinc-600">Cumulative profit after cash stakes, returns, refunds, and cashouts.</p>
              </div>
              <span className="inline-flex w-fit items-center gap-1.5 rounded-md border border-white/[.07] bg-white/[.025] px-2 py-1 text-[10px] font-medium text-zinc-500">
                <TrendingUp className="size-3" /> Updated from confirmed bets
              </span>
            </div>
            <PnlChart data={data.daily} currency={currency} className="mt-6" />
          </div>
          <div className="grid grid-cols-2 border-t border-white/[.06] sm:grid-cols-4">
            {stats.map(([label, value, hint], index) => (
              <div key={label} className={`p-4 sm:p-5 ${index > 0 ? "sm:border-l" : ""} ${index > 1 ? "border-t sm:border-t-0" : ""}`}>
                <p className="text-[10px] font-medium text-zinc-600">{label}</p>
                <p className="mt-2 text-lg font-semibold tracking-[-.025em] text-zinc-200">{value}</p>
                <p className="mt-1 text-[10px] text-zinc-700">{hint}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-sm font-semibold text-zinc-200">Performance by platform</h2>
              <p className="mt-1 text-[11px] text-zinc-600">Net P&amp;L for this period</p>
            </div>
            <Link href="/platforms" className="text-[11px] font-medium text-zinc-500 transition hover:text-white">Details</Link>
          </div>
          <div className="mt-7 grid gap-5">
            {data.bookmakers.length ? data.bookmakers.map((bookmaker) => (
              <div key={bookmaker.name}>
                <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0"><span className="font-medium text-zinc-300">{bookmaker.name}</span><span className="ml-1.5 text-zinc-700">{bookmaker.bets} bets</span></div>
                  <span className={bookmaker.pnl >= 0 ? "text-emerald-300" : "text-rose-300"}>{formatMoney(bookmaker.pnl, currency, true)}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/[.045]">
                  <div className={`h-full rounded-full ${bookmaker.pnl >= 0 ? "bg-emerald-400/70" : "bg-rose-400/70"}`} style={{ width: `${Math.max(8, Math.min(100, Math.abs(bookmaker.pnl) / maxBookmaker * 100))}%` }} />
                </div>
              </div>
            )) : <p className="py-12 text-center text-xs text-zinc-600">No platform data for this currency yet.</p>}
          </div>
          <div className="mt-7 border-t border-white/[.06] pt-4">
            <Link href="/analytics" className="flex items-center justify-between text-xs font-medium text-zinc-500 transition hover:text-zinc-200">
              Explore portfolio analytics <ChevronRight className="size-4" />
            </Link>
          </div>
        </Card>
      </div>

      <Card className="mt-4 overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/[.06] px-4 py-4 sm:px-5">
          <div>
            <h2 className="text-sm font-semibold text-zinc-200">Recent bets</h2>
            <p className="mt-1 text-[11px] text-zinc-600">Your latest confirmed settlements</p>
          </div>
          <Link href="/bets" className="flex items-center gap-1 text-xs font-medium text-zinc-500 transition hover:text-white">View all <ChevronRight className="size-4" /></Link>
        </div>
        {data.recent.length ? (
          <div>
            <div className="hidden grid-cols-[1.3fr_1fr_.8fr_.8fr_1fr] gap-4 border-b border-white/[.055] px-5 py-2.5 text-[9px] font-semibold uppercase tracking-[.11em] text-zinc-700 sm:grid">
              <span>Platform</span><span>Bet</span><span>Stake</span><span>Result</span><span className="text-right">P&amp;L</span>
            </div>
            <div className="divide-y divide-white/[.055]">
              {data.recent.map((bet) => (
                <Link href={`/bets/${bet.id}`} key={bet.id} className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 px-4 py-4 transition hover:bg-white/[.02] sm:grid-cols-[1.3fr_1fr_.8fr_.8fr_1fr] sm:px-5">
                  <div className="min-w-0"><p className="truncate text-sm font-medium text-zinc-200">{bet.bookmaker}</p><p className="mt-1 text-[10px] text-zinc-700 sm:hidden">{titleCase(bet.betType)} · {formatDisplayDate(bet.settledAt)}</p></div>
                  <span className="hidden text-xs text-zinc-500 sm:block">{titleCase(bet.betType)}</span>
                  <span className="hidden text-xs tabular-nums text-zinc-500 sm:block">{formatMoney(bet.stake, currency)}</span>
                  <span className="hidden items-center gap-2 text-xs text-zinc-500 sm:flex">
                    {bet.status === "won" ? <ArrowUpRight className="size-3.5 text-emerald-300" /> : bet.status === "lost" ? <ArrowDownRight className="size-3.5 text-rose-300" /> : <CircleMinus className="size-3.5" />}
                    {titleCase(bet.status)}
                  </span>
                  <span className={`text-right text-sm font-semibold tabular-nums ${bet.pnl >= 0 ? "text-emerald-300" : "text-rose-300"}`}>{formatMoney(bet.pnl, currency, true)}</span>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="px-5 py-16 text-center">
            <span className="mx-auto grid size-10 place-items-center rounded-full bg-white/[.04] text-zinc-600"><ReceiptText className="size-4" /></span>
            <p className="mt-4 text-sm font-semibold">No bets tracked yet</p>
            <p className="mt-2 text-xs text-zinc-600">Import your first settled betslip to start building your portfolio.</p>
            <ButtonLink href="/upload" className="mt-5"><Plus className="size-4" />Import bet</ButtonLink>
          </div>
        )}
      </Card>
    </div>
  );
}
