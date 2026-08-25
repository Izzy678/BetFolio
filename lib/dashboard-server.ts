import "server-only";

import { previewDashboard, type DashboardSnapshot } from "@/lib/dashboard";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

function pickCurrency(requested: string | undefined, available: string[], profileCurrency: string | null | undefined) {
  const normalized = requested?.toUpperCase();
  if (normalized && available.includes(normalized)) return normalized;
  if (profileCurrency && available.includes(profileCurrency)) return profileCurrency;
  return available[0] ?? profileCurrency ?? "GBP";
}

export async function loadDashboardSnapshot({
  requestedCurrency,
  range = "30",
  profileCurrency,
}: {
  requestedCurrency?: string;
  range?: string;
  profileCurrency?: string | null;
}) {
  if (!isSupabaseConfigured()) return previewDashboard;

  const supabase = await createClient();
  const { data: currencyRows } = await supabase.from("bets").select("currency");
  const availableCurrencies = [...new Set((currencyRows ?? []).map((row) => String(row.currency).toUpperCase()))].sort();
  const currency = pickCurrency(requestedCurrency, availableCurrencies, profileCurrency);
  const { data } = await supabase.rpc("dashboard_snapshot", {
    p_currency: currency,
    p_days: range === "all" ? null : Number(range),
  });
  return data ? data as DashboardSnapshot : { ...previewDashboard, currency, currencies: availableCurrencies };
}
