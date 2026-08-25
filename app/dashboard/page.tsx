import { AppShell } from "@/components/app-shell";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { getCurrentProfile } from "@/lib/auth";
import { loadDashboardSnapshot } from "@/lib/dashboard-server";

export const dynamic = "force-dynamic";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ currency?: string; range?: string }> }) {
  const profile = await getCurrentProfile({ required: true });
  const params = await searchParams;
  const range = params.range ?? "30";
  const snapshot = await loadDashboardSnapshot({ requestedCurrency: params.currency, range, profileCurrency: profile!.base_currency });
  return <AppShell username={profile!.username}><DashboardView data={snapshot} username={profile!.username} range={range} /></AppShell>;
}
