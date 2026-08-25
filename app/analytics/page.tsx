import { ArrowDownRight, ArrowUpRight, CircleDollarSign, ReceiptText, Target } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { DashboardFilters } from "@/components/dashboard/dashboard-filters";
import { PnlChart } from "@/components/dashboard/pnl-chart";
import { Card } from "@/components/ui/card";
import { getCurrentProfile } from "@/lib/auth";
import { loadDashboardSnapshot } from "@/lib/dashboard-server";
import { formatMoney } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<{ currency?: string; range?: string }> }) {
  const profile = await getCurrentProfile({ required: true });
  const params = await searchParams;
  const range = params.range ?? "90";
  const data = await loadDashboardSnapshot({ requestedCurrency: params.currency, range, profileCurrency: profile!.base_currency });
  const { summary, currency } = data;
  const max = Math.max(...data.bookmakers.map((item) => Math.abs(item.pnl)), 1);

  return (
    <AppShell username={profile!.username}>
      <div className="mx-auto max-w-[1450px] px-4 py-6 sm:px-7 lg:px-9 lg:py-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-xs text-zinc-600">Portfolio performance</p><h1 className="mt-1.5 text-2xl font-semibold tracking-[-.04em] sm:text-3xl">Analytics</h1></div>
          <DashboardFilters currency={currency} currencies={data.currencies} range={range} />
        </div>
        <div className="mt-6 grid gap-4 xl:grid-cols-[1.6fr_.8fr]">
          <Card className="p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-medium uppercase tracking-[.12em] text-zinc-600">Cumulative P&amp;L</p><p className={`mt-2 text-3xl font-semibold tracking-[-.045em] ${summary.netPnl >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>{formatMoney(summary.netPnl, currency, true)}</p></div><span className="rounded-md border border-white/[.07] bg-white/[.025] px-2 py-1 text-[10px] text-zinc-500">Confirmed ledger</span></div>
            <PnlChart data={data.daily} currency={currency} className="mt-6" />
          </Card>
          <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
            {[[CircleDollarSign, 'ROI', summary.roi == null ? '—' : `${summary.roi.toFixed(2)}%`, 'Net P&L / cash staked'], [Target, 'Win rate', summary.winRate == null ? '—' : `${summary.winRate.toFixed(1)}%`, 'Won / won + lost'], [ReceiptText, 'Settled bets', String(summary.totalBets), 'Included in this view']].map(([Icon, label, value, hint]) => {
              const StatIcon = Icon as typeof CircleDollarSign;
              return <Card key={String(label)} className="p-5"><div className="flex items-start justify-between"><div><p className="text-[10px] font-medium text-zinc-600">{String(label)}</p><p className="mt-2 text-2xl font-semibold tracking-[-.035em]">{String(value)}</p><p className="mt-1 text-[10px] text-zinc-700">{String(hint)}</p></div><span className="grid size-8 place-items-center rounded-lg bg-violet-400/10 text-violet-300"><StatIcon className="size-4" /></span></div></Card>;
            })}
          </div>
        </div>
        <Card className="mt-4 overflow-hidden">
          <div className="border-b border-white/[.06] px-5 py-4"><h2 className="text-sm font-semibold">Platform comparison</h2><p className="mt-1 text-[11px] text-zinc-600">Where your net returns are coming from</p></div>
          <div className="divide-y divide-white/[.055]">
            {data.bookmakers.map((platform) => <div key={platform.name} className="grid grid-cols-[1fr_auto] items-center gap-4 px-5 py-4 sm:grid-cols-[1.2fr_1.6fr_.6fr_.7fr]"><div><p className="text-sm font-medium text-zinc-200">{platform.name}</p><p className="mt-1 text-[10px] text-zinc-700 sm:hidden">{platform.bets} settled bets</p></div><div className="hidden h-1.5 overflow-hidden rounded-full bg-white/[.045] sm:block"><div className={`h-full rounded-full ${platform.pnl >= 0 ? 'bg-emerald-400/70' : 'bg-rose-400/70'}`} style={{ width: `${Math.max(8, Math.abs(platform.pnl) / max * 100)}%` }} /></div><span className="hidden text-xs text-zinc-500 sm:block">{platform.bets} bets</span><span className={`flex items-center justify-end gap-1 text-sm font-semibold ${platform.pnl >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>{platform.pnl >= 0 ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}{formatMoney(platform.pnl, currency, true)}</span></div>)}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
