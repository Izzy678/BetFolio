import { ArrowDownRight, ArrowUpRight, Building2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { getCurrentProfile } from "@/lib/auth";
import { loadDashboardSnapshot } from "@/lib/dashboard-server";
import { formatMoney } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PlatformsPage() {
  const profile = await getCurrentProfile({ required: true });
  const data = await loadDashboardSnapshot({ range: "all", profileCurrency: profile!.base_currency });
  const totalAbsolute = data.bookmakers.reduce((sum, item) => sum + Math.abs(item.pnl), 0) || 1;

  return (
    <AppShell username={profile!.username}>
      <div className="mx-auto max-w-[1250px] px-4 py-6 sm:px-7 lg:px-9 lg:py-8">
        <div><p className="text-xs text-zinc-600">All-time portfolio breakdown</p><h1 className="mt-1.5 text-2xl font-semibold tracking-[-.04em] sm:text-3xl">Platforms</h1><p className="mt-3 max-w-xl text-sm leading-6 text-zinc-500">Compare confirmed results across every bookmaker in your {data.currency} portfolio.</p></div>
        {data.bookmakers.length ? <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{data.bookmakers.map((platform, index) => {
          const positive = platform.pnl >= 0;
          return <Card key={platform.name} className="p-5 sm:p-6"><div className="flex items-start justify-between"><span className="grid size-10 place-items-center rounded-lg bg-violet-400/10 text-violet-300"><Building2 className="size-[18px]" /></span><span className="text-[10px] font-medium text-zinc-700">#{index + 1}</span></div><h2 className="mt-6 text-base font-semibold">{platform.name}</h2><div className="mt-5 flex items-end justify-between gap-4"><div><p className="text-[10px] text-zinc-600">Net P&amp;L</p><p className={`mt-1.5 flex items-center gap-1 text-2xl font-semibold tracking-[-.04em] ${positive ? 'text-emerald-300' : 'text-rose-300'}`}>{positive ? <ArrowUpRight className="size-4" /> : <ArrowDownRight className="size-4" />}{formatMoney(platform.pnl, data.currency, true)}</p></div><div className="text-right"><p className="text-[10px] text-zinc-600">Settled bets</p><p className="mt-1.5 text-sm font-semibold text-zinc-300">{platform.bets}</p></div></div><div className="mt-6"><div className="mb-2 flex justify-between text-[10px] text-zinc-700"><span>Portfolio contribution</span><span>{(Math.abs(platform.pnl) / totalAbsolute * 100).toFixed(1)}%</span></div><div className="h-1.5 overflow-hidden rounded-full bg-white/[.045]"><div className={`h-full rounded-full ${positive ? 'bg-emerald-400/70' : 'bg-rose-400/70'}`} style={{ width: `${Math.max(6, Math.abs(platform.pnl) / totalAbsolute * 100)}%` }} /></div></div></Card>;
        })}</div> : <Card className="mt-7 px-5 py-20 text-center"><Building2 className="mx-auto size-6 text-zinc-700" /><p className="mt-4 text-sm font-semibold">No platform data yet</p><p className="mt-2 text-xs text-zinc-600">Platforms appear here after you confirm your first settled bet.</p></Card>}
      </div>
    </AppShell>
  );
}
