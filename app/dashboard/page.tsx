import { AppShell } from "@/components/app-shell";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { getCurrentProfile } from "@/lib/auth";
import { previewDashboard, type DashboardSnapshot } from "@/lib/dashboard";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ currency?: string; range?: string }> }) {
  const profile = await getCurrentProfile({ required: true });
  let snapshot: DashboardSnapshot = previewDashboard;
  if (isSupabaseConfigured()) {
    const params = await searchParams;
    const supabase = await createClient();
    const { data } = await supabase.rpc("dashboard_snapshot", { p_currency: params.currency ?? profile!.base_currency ?? "GBP", p_days: params.range === "all" ? null : Number(params.range ?? 30) });
    if (data) snapshot = data as DashboardSnapshot;
  }
  return <AppShell username={profile!.username}><DashboardView data={snapshot} username={profile!.username} /></AppShell>;
}
