import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, ChevronRight, CircleMinus, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import type { DashboardSnapshot } from "@/lib/dashboard";
import { formatMoney, titleCase } from "@/lib/utils";
import { DashboardFilters } from "./dashboard-filters";
import { PnlChart } from "./pnl-chart";

export function DashboardView({ data, username, range }: { data: DashboardSnapshot; username: string; range: string }) {
  const { summary, currency } = data;
  const stats = [
    ["Cash staked", formatMoney(summary.cashStaked, currency), "Cash stake only"], ["Total returned", formatMoney(summary.totalReturned, currency), "Settlements + refunds"],
    ["ROI", summary.roi == null ? "—" : `${summary.roi.toFixed(2)}%`, "Net P&L / cash staked"], ["Win rate", summary.winRate == null ? "—" : `${summary.winRate.toFixed(1)}%`, "Won / won + lost"],
  ];
  return <div className="mx-auto max-w-[1440px] px-5 py-7 sm:px-8 lg:px-10 lg:py-9">
    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm text-zinc-500">Welcome back, @{username}</p><h1 className="mt-1 text-3xl font-semibold tracking-[-.04em]">Overview</h1></div><DashboardFilters currency={currency} currencies={data.currencies} range={range} /></div>
    <div className="mt-7 grid gap-3 lg:grid-cols-6">
      <Card className="relative overflow-hidden p-5 lg:col-span-2"><div className="absolute right-[-45px] top-[-65px] size-44 rounded-full bg-lime-300/[.05] blur-3xl" /><p className="text-xs font-medium text-zinc-500">Net P&amp;L</p><div className="mt-4 flex items-end gap-2"><p className={`text-4xl font-semibold tracking-[-.045em] ${summary.netPnl >= 0 ? "text-lime-300" : "text-red-300"}`}>{formatMoney(summary.netPnl, currency, true)}</p>{summary.netPnl >= 0 ? <ArrowUpRight className="mb-1 size-5 text-lime-300" /> : <ArrowDownRight className="mb-1 size-5 text-red-300" />}</div><p className="mt-3 text-xs text-zinc-600">Across {summary.totalBets} settled bets</p></Card>
      {stats.map(([label, value, hint]) => <Card key={label} className="p-5"><p className="text-xs font-medium text-zinc-500">{label}</p><p className="mt-4 text-xl font-semibold tracking-[-.03em]">{value}</p><p className="mt-2 text-[11px] text-zinc-600">{hint}</p></Card>)}
    </div>
    <div className="mt-4 grid gap-4 xl:grid-cols-[1.7fr_1fr]">
      <Card className="p-5 sm:p-6"><div className="mb-5 flex items-center justify-between"><div><h2 className="text-sm font-semibold">P&amp;L over time</h2><p className="mt-1 text-xs text-zinc-600">Cumulative settlement ledger</p></div><span className="rounded-lg bg-white/[.04] px-2 py-1 text-[11px] text-zinc-500">{currency}</span></div><PnlChart data={data.daily} currency={currency} /></Card>
      <Card className="p-5 sm:p-6"><h2 className="text-sm font-semibold">By bookmaker</h2><p className="mt-1 text-xs text-zinc-600">Net P&amp;L, selected period</p><div className="mt-6 grid gap-5">{data.bookmakers.length ? data.bookmakers.map((bookmaker) => { const max = Math.max(...data.bookmakers.map((item) => Math.abs(item.pnl)), 1); return <div key={bookmaker.name}><div className="mb-2 flex items-center justify-between text-xs"><span className="font-medium text-zinc-300">{bookmaker.name} <span className="font-normal text-zinc-600">· {bookmaker.bets}</span></span><span className={bookmaker.pnl >= 0 ? "text-lime-300" : "text-red-300"}>{formatMoney(bookmaker.pnl, currency, true)}</span></div><div className="h-1.5 overflow-hidden rounded-full bg-white/[.05]"><div className={`h-full rounded-full ${bookmaker.pnl >= 0 ? "bg-lime-300/70" : "bg-red-300/70"}`} style={{ width: `${Math.max(8, Math.min(100, Math.abs(bookmaker.pnl) / max * 100))}%` }} /></div></div>; }) : <p className="py-8 text-center text-sm text-zinc-600">No bookmaker data for this currency yet.</p>}</div></Card>
    </div>
    <Card className="mt-4 overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/[.07] px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold">Recent bets</h2>
          <p className="mt-1 text-xs text-zinc-600">Latest confirmed settlements</p>
        </div>
        <Link href="/bets" className="flex items-center gap-1 text-xs font-semibold text-zinc-400 hover:text-white">
          View all <ChevronRight className="size-4" />
        </Link>
      </div>
      {data.recent.length ? (
        <div className="divide-y divide-white/[.06]">
          {data.recent.map((bet) => (
            <Link
              href={`/bets/${bet.id}`}
              key={bet.id}
              className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 px-5 py-4 transition hover:bg-white/[.025] sm:grid-cols-[minmax(0,1.4fr)_8rem_9rem_7.5rem_minmax(7.5rem,auto)]"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{bet.bookmaker}</p>
                <p className="mt-1 text-xs text-zinc-600 sm:hidden">
                  {titleCase(bet.betType)} · {formatMoney(bet.stake, currency)}
                </p>
              </div>
              <span className="hidden text-xs text-zinc-400 sm:block">{titleCase(bet.betType)}</span>
              <span className="hidden tabular-nums text-xs text-zinc-400 sm:block">{formatMoney(bet.stake, currency)}</span>
              <span className="hidden items-center gap-2 text-xs text-zinc-400 sm:flex">
                <span className="grid size-4 shrink-0 place-items-center">
                  {bet.status === "won" ? (
                    <ArrowUpRight className="size-3.5 text-lime-300" />
                  ) : bet.status === "lost" ? (
                    <ArrowDownRight className="size-3.5 text-red-300" />
                  ) : (
                    <CircleMinus className="size-3.5" />
                  )}
                </span>
                <span className="capitalize">{titleCase(bet.status)}</span>
              </span>
              <span className={`text-right text-sm font-semibold tabular-nums ${bet.pnl >= 0 ? "text-lime-300" : "text-red-300"}`}>
                {formatMoney(bet.pnl, currency, true)}
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="px-5 py-16 text-center">
          <p className="font-semibold">No bets tracked yet</p>
          <p className="mt-2 text-sm text-zinc-500">Upload your first settled betslip to start building your P&amp;L history.</p>
          <ButtonLink href="/upload" className="mt-5">
            <Plus className="size-4" />
            Upload betslip
          </ButtonLink>
        </div>
      )}
    </Card>
  </div>;
}
