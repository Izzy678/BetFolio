"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { ButtonLink } from "@/components/ui/button";

export function DashboardFilters({ currency, currencies, range }: { currency: string; currencies: string[]; range: string }) {
  const router = useRouter();
  const options = currencies.length ? currencies : [currency];

  function navigate(nextCurrency: string, nextRange: string) {
    const params = new URLSearchParams({ currency: nextCurrency, range: nextRange });
    router.push(`/dashboard?${params.toString()}`);
  }

  return <div className="flex flex-wrap gap-2">
    <select
      aria-label="Currency"
      value={currency}
      onChange={(event) => navigate(event.target.value, range)}
      className="h-9 rounded-lg border border-white/10 bg-[#111116] px-3 text-xs font-medium text-zinc-300 outline-none transition focus:border-violet-400/50"
    >
      {options.map((item) => <option key={item} value={item}>{item}</option>)}
    </select>
    <select
      aria-label="Date range"
      value={range}
      onChange={(event) => navigate(currency, event.target.value)}
      className="flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-[#111116] px-3 text-xs font-medium text-zinc-300 outline-none transition focus:border-violet-400/50"
    >
      <option value="30">30 days</option>
      <option value="90">90 days</option>
      <option value="all">All time</option>
    </select>
    <ButtonLink href="/upload" className="h-9"><Plus className="size-4" /><span className="hidden sm:inline">Import bet</span></ButtonLink>
  </div>;
}
