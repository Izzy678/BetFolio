import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, ChevronRight, CircleMinus, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import type { DashboardSnapshot } from "@/lib/dashboard";
import { formatMoney, titleCase } from "@/lib/utils";
import { DashboardFilters } from "./dashboard-filters";
import { PnlChart } from "./pnl-chart";

export function DashboardView({
  data,
  username,
  range,
}: {
  data: DashboardSnapshot;
  username: string;
  range: string;
}) {
  const { summary, currency } = data;
  const stats = [
    ["Cash staked", formatMoney(summary.cashStaked, currency), "Cash stake only"],
    ["Total returned", formatMoney(summary.totalReturned, currency), "Settlements + refunds"],
    ["ROI", summary.roi == null ? "—" : `${summary.roi.toFixed(2)}%`, "Net P&L / cash staked"],
    ["Win rate", summary.winRate == null ? "—" : `${summary.winRate.toFixed(1)}%`, "Won / won + lost"],
  ];

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-5 sm:px-8 sm:py-7 lg:px-10 lg:py-9">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-5">
        <div className="min-w-0">
          <p className="truncate text-sm text-zinc-500">Welcome back, @{username}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">Overview</h1>
        </div>
        <DashboardFilters currency={currency} currencies={data.currencies} range={range} />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2.5 sm:mt-7 sm:gap-3 lg:grid-cols-6">
        <Card className="relative col-span-2 overflow-hidden p-4 sm:p-5 lg:col-span-2">
          <p className="text-xs font-medium text-zinc-500">Net P&amp;L</p>
          <div className="mt-3 flex items-end gap-2 sm:mt-4">
            <p
              className={`text-3xl font-semibold tracking-[-0.045em] sm:text-4xl ${
                summary.netPnl >= 0 ? "text-emerald-400" : "text-red-300"
              }`}
            >
              {formatMoney(summary.netPnl, currency, true)}
            </p>
            {summary.netPnl >= 0 ? (
              <ArrowUpRight className="mb-0.5 size-5 text-emerald-400 sm:mb-1" />
            ) : (
              <ArrowDownRight className="mb-0.5 size-5 text-red-300 sm:mb-1" />
            )}
          </div>
          <p className="mt-2 text-xs text-zinc-600 sm:mt-3">Across {summary.totalBets} settled bets</p>
        </Card>
        {stats.map(([label, value, hint]) => (
          <Card key={label} className="min-w-0 p-3.5 sm:p-5">
            <p className="text-[11px] font-medium text-zinc-500 sm:text-xs">{label}</p>
            <p className="mt-2 truncate text-lg font-semibold tracking-[-0.03em] tabular-nums sm:mt-4 sm:text-xl">
              {value}
            </p>
            <p className="mt-1.5 hidden text-[11px] text-zinc-600 sm:mt-2 sm:block">{hint}</p>
          </Card>
        ))}
      </div>

      <div className="mt-3 grid gap-3 sm:mt-4 sm:gap-4 xl:grid-cols-[1.7fr_1fr]">
        <Card className="p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3 sm:mb-5">
            <div className="min-w-0">
              <h2 className="text-sm font-semibold">P&amp;L over time</h2>
              <p className="mt-1 text-xs text-zinc-600">Cumulative settlement ledger</p>
            </div>
            <span className="shrink-0 rounded-lg bg-white/[.04] px-2 py-1 text-[11px] text-zinc-500">
              {currency}
            </span>
          </div>
          <PnlChart data={data.daily} currency={currency} />
        </Card>
        <Card className="p-4 sm:p-6">
          <h2 className="text-sm font-semibold">By bookmaker</h2>
          <p className="mt-1 text-xs text-zinc-600">Net P&amp;L, selected period</p>
          <div className="mt-5 grid gap-4 sm:mt-6 sm:gap-5">
            {data.bookmakers.length ? (
              data.bookmakers.map((bookmaker) => {
                const max = Math.max(...data.bookmakers.map((item) => Math.abs(item.pnl)), 1);
                return (
                  <div key={bookmaker.name} className="min-w-0">
                    <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                      <span className="min-w-0 truncate font-medium text-zinc-300">
                        {bookmaker.name}{" "}
                        <span className="font-normal text-zinc-600">· {bookmaker.bets}</span>
                      </span>
                      <span
                        className={`shrink-0 tabular-nums ${bookmaker.pnl >= 0 ? "text-emerald-400" : "text-red-300"}`}
                      >
                        {formatMoney(bookmaker.pnl, currency, true)}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/[.05]">
                      <div
                        className={`h-full rounded-full ${bookmaker.pnl >= 0 ? "bg-emerald-400/70" : "bg-red-300/70"}`}
                        style={{
                          width: `${Math.max(8, Math.min(100, (Math.abs(bookmaker.pnl) / max) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="py-8 text-center text-sm text-zinc-600">
                No bookmaker data for this currency yet.
              </p>
            )}
          </div>
        </Card>
      </div>

      <Card className="mt-3 overflow-hidden sm:mt-4">
        <div className="flex items-center justify-between gap-3 border-b border-white/[.07] px-4 py-3.5 sm:px-5 sm:py-4">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold">Recent bets</h2>
            <p className="mt-1 text-xs text-zinc-600">Latest confirmed settlements</p>
          </div>
          <Link
            href="/bets"
            className="flex shrink-0 items-center gap-1 text-xs font-semibold text-zinc-400 hover:text-white"
          >
            View all <ChevronRight className="size-4" />
          </Link>
        </div>
        {data.recent.length ? (
          <div className="divide-y divide-white/[.06]">
            {data.recent.map((bet) => (
              <Link
                href={`/bets/${bet.id}`}
                key={bet.id}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 px-4 py-3.5 transition hover:bg-white/[.025] sm:gap-x-4 sm:px-5 sm:py-4 sm:grid-cols-[minmax(0,1.4fr)_8rem_9rem_7.5rem_minmax(7.5rem,auto)]"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{bet.bookmaker}</p>
                  <p className="mt-1 text-xs text-zinc-600 sm:hidden">
                    {titleCase(bet.betType)} · {formatMoney(bet.stake, currency)} · {titleCase(bet.status)}
                  </p>
                </div>
                <span className="hidden text-xs text-zinc-400 sm:block">{titleCase(bet.betType)}</span>
                <span className="hidden tabular-nums text-xs text-zinc-400 sm:block">
                  {formatMoney(bet.stake, currency)}
                </span>
                <span className="hidden items-center gap-2 text-xs text-zinc-400 sm:flex">
                  <span className="grid size-4 shrink-0 place-items-center">
                    {bet.status === "won" ? (
                      <ArrowUpRight className="size-3.5 text-emerald-400" />
                    ) : bet.status === "lost" ? (
                      <ArrowDownRight className="size-3.5 text-red-300" />
                    ) : (
                      <CircleMinus className="size-3.5" />
                    )}
                  </span>
                  <span className="capitalize">{titleCase(bet.status)}</span>
                </span>
                <span
                  className={`text-right text-sm font-semibold tabular-nums ${
                    bet.pnl >= 0 ? "text-emerald-400" : "text-red-300"
                  }`}
                >
                  {formatMoney(bet.pnl, currency, true)}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="px-4 py-12 text-center sm:px-5 sm:py-16">
            <p className="font-semibold">No bets tracked yet</p>
            <p className="mt-2 text-sm text-zinc-500">
              Upload your first settled betslip to start building your P&amp;L history.
            </p>
            <ButtonLink href="/upload" className="mt-5">
              <Plus className="size-4" />
              Upload betslip
            </ButtonLink>
          </div>
        )}
      </Card>
    </div>
  );
}
