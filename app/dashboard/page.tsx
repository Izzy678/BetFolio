import { AppShell } from "@/components/app-shell";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { getCurrentProfile } from "@/lib/auth";
import { previewDashboard, type DashboardSnapshot } from "@/lib/dashboard";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function pickCurrency(requested: string | undefined, available: string[], profileCurrency: string | null | undefined) {
  const normalized = requested?.toUpperCase();
  if (normalized && available.includes(normalized)) return normalized;
  if (profileCurrency && available.includes(profileCurrency)) return profileCurrency;
  return available[0] ?? profileCurrency ?? "GBP";
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ currency?: string; range?: string }> }) {
  const profile = await getCurrentProfile({ required: true });
  const params = await searchParams;
  const range = params.range ?? "30";
  let snapshot: DashboardSnapshot = previewDashboard;

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data: currencyRows } = await supabase.from("bets").select("currency");
    const availableCurrencies = [...new Set((currencyRows ?? []).map((row) => String(row.currency).toUpperCase()))].sort();
    const currency = pickCurrency(params.currency, availableCurrencies, profile!.base_currency);
    const { data } = await supabase.rpc("dashboard_snapshot", {
      p_currency: currency,
      p_days: range === "all" ? null : Number(range),
    });
    if (data) snapshot = data as DashboardSnapshot;
  }

  return <AppShell username={profile!.username}><DashboardView data={snapshot} username={profile!.username} range={range} /></AppShell>;
}
