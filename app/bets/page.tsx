import { Plus } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { BetsTable } from "@/components/bets/bets-table";
import { ButtonLink } from "@/components/ui/button";
import { getCurrentProfile } from "@/lib/auth";
import { previewBets, type BetListItem } from "@/lib/bets";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function BetsPage() {
  const profile = await getCurrentProfile({ required: true });
  let bets = previewBets;
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data } = await supabase.from("bet_list").select("*").order("placed_at", { ascending: false }).range(0, 49);
    if (data) bets = data.map((row) => ({
      id: row.id as string,
      bookmaker: row.bookmaker as string,
      externalBetId: row.external_bet_id as string | null,
      betType: row.bet_type as string,
      status: row.status as string,
      currency: row.currency as string,
      cashStake: Number(row.cash_stake),
      odds: row.total_odds_decimal == null ? null : Number(row.total_odds_decimal),
      pnl: Number(row.pnl),
      placedAt: row.placed_at as string | null,
      settledAt: row.settled_at as string | null,
    })) satisfies BetListItem[];
  }
  return <AppShell username={profile!.username}><div className="mx-auto max-w-[1440px] px-5 py-7 sm:px-8 lg:px-10 lg:py-9"><div className="flex items-end justify-between"><div><p className="text-sm text-zinc-500">All confirmed settlements</p><h1 className="mt-1 text-3xl font-semibold tracking-[-.04em]">Bet history</h1></div><ButtonLink href="/upload" className="h-10"><Plus className="size-4" />Import bet</ButtonLink></div><BetsTable bets={bets} /></div></AppShell>;
}
