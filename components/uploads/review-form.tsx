"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Check, ChevronLeft, Loader2, PencilLine } from "lucide-react";
import { BetFields } from "@/components/bets/bet-fields";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { ValidationIssue } from "@/lib/betting/validation";
import { calculatePnl, createLedgerEntries } from "@/lib/betting/ledger";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { friendlyError } from "@/lib/errors";
import { toConfirmedBetInput, type BetslipExtraction } from "@/lib/gemini/schema";
import { formatMoney, titleCase } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

export function ReviewForm({ uploadId, extraction, issues }: { uploadId: string; extraction: BetslipExtraction; issues: ValidationIssue[] }) {
  const [form, setForm] = useState<BetslipExtraction>(extraction);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const toast = useToast();
  const warningFields = new Set(issues.map((issue) => issue.field));
  const update = <K extends keyof BetslipExtraction>(key: K, value: BetslipExtraction[K]) => setForm((current) => ({ ...current, [key]: value }));
  const input = useMemo(() => toConfirmedBetInput(form), [form]);
  let pnl: number | null = null;
  try { if (input) pnl = calculatePnl(createLedgerEntries(input)); } catch { pnl = null; }

  async function confirm() {
    if (!input) {
      const message = "Complete the highlighted fields before importing.";
      setError(message);
      toast.error("Can't import yet");
      return;
    }
    setPending(true); setError("");
    try {
      if (!isSupabaseConfigured()) { router.push("/bets/preview-1"); return; }
      const supabase = createClient();
      const { data: betId, error: rpcError } = await supabase.rpc("finalize_bet_import", {
        p_upload_id: uploadId,
        p_bet: input,
      });
      if (rpcError) {
        const message = rpcError.message ?? "";
        if (message.includes("BET_DUPLICATE") || rpcError.code === "23505") throw new Error("BET_DUPLICATE");
        if (message.includes("UPLOAD_NOT_READY")) throw new Error("UPLOAD_NOT_READY");
        if (message.includes("UPLOAD_NOT_FOUND")) throw new Error("UPLOAD_NOT_FOUND");
        if (message.includes("PLACED_AT_REQUIRED") || message.includes("INVALID") || message.includes("UNSUPPORTED") || message.includes("RETURN_REQUIRED")) throw new Error("INVALID_IMPORT");
        throw new Error("INTERNAL_ERROR");
      }
      if (!betId) throw new Error("INTERNAL_ERROR");
      toast.success("Bet added");
      router.push("/bets");
    } catch (caught) {
      const message = friendlyError(caught instanceof Error ? caught.message : undefined);
      setError(message);
      toast.error("Couldn't add bet");
    } finally {
      setPending(false);
    }
  }

  return <div>
    <ButtonLink href="/upload" variant="ghost" className="-ml-3 h-9"><ChevronLeft className="size-4" />Back to upload</ButtonLink>
    <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-lime-300"><Check className="size-4" />Extraction complete</div>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-.04em]">Review bet summary</h1>
        <p className="mt-2 text-sm text-zinc-500">Confirm the money in and money out. Game details are not tracked.</p>
      </div>
      <div className="rounded-xl border border-white/[.08] bg-white/[.03] px-3 py-2 text-xs text-zinc-500">Quality <span className="ml-1 font-semibold text-zinc-200">{Math.max(0, 100 - issues.length * 15)}%</span></div>
    </div>
    {issues.length > 0 && <div className="mt-6 flex gap-3 rounded-2xl border border-amber-300/15 bg-amber-300/[.055] p-4 text-sm text-amber-100"><AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-300" /><div><p className="font-semibold">{issues.length} field{issues.length === 1 ? "" : "s"} need your attention</p><ul className="mt-1 grid gap-1 text-xs text-amber-100/60">{issues.map((issue) => <li key={issue.code}>{issue.message}</li>)}</ul></div></div>}
    <div className="mt-6 grid gap-5 xl:grid-cols-[.78fr_1.22fr]">
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/[.07] px-5 py-4"><p className="text-sm font-semibold">Extracted summary</p><span className="text-[11px] text-zinc-600">Slip processed</span></div>
        <div className="grid min-h-[520px] place-items-center bg-[#090a0b] p-5">
          <div className="w-full max-w-sm rounded-2xl bg-[#edf3ee] p-6 text-zinc-900 shadow-2xl"><div className="flex items-center justify-between"><strong className="text-lg">{form.bookmakerName ?? "BOOKMAKER"}</strong><span className="rounded-full bg-emerald-700 px-2 py-1 text-[10px] font-bold text-white">{form.status?.toUpperCase() ?? "SETTLED"}</span></div><p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">{titleCase(form.betType ?? "single")}</p><div className="mt-6 grid grid-cols-2 gap-4"><div><p className="text-[10px] text-zinc-500">Stake</p><p className="font-bold">{formatMoney(form.stake ?? 0, form.currency ?? "GBP")}</p></div><div><p className="text-[10px] text-zinc-500">Return</p><p className="font-bold">{form.returnAmount == null ? "—" : formatMoney(form.returnAmount, form.currency ?? "GBP")}</p></div></div></div>
        </div>
      </Card>
      <Card className="p-5 sm:p-6">
        <div className="mb-6 flex items-center gap-2"><PencilLine className="size-4 text-lime-300" /><h2 className="text-sm font-semibold">Bet summary</h2></div>
        <BetFields form={form} onChange={update} warningFields={warningFields} />
        <div className="mt-7 rounded-2xl border border-lime-300/15 bg-lime-300/[.055] p-5">
          <div className="flex items-end justify-between">
            <div><p className="text-xs font-medium text-zinc-500">Estimated P&amp;L</p><p className="mt-2 text-xs text-zinc-600">{form.status === "pending" ? "Pending bets only count stake until settled." : "Cash in minus cash out"}</p></div>
            <p className={`text-3xl font-semibold tracking-[-.04em] ${pnl == null ? "text-zinc-500" : pnl >= 0 ? "text-lime-300" : "text-red-300"}`}>{pnl == null ? "—" : formatMoney(pnl, form.currency ?? "GBP", true)}</p>
          </div>
        </div>
        {error && <p role="alert" className="mt-4 text-sm text-red-300">{error}</p>}
        <Button onClick={confirm} disabled={pending || pnl == null} className="mt-4 w-full">{pending ? <><Loader2 className="size-4 animate-spin" />Adding bet…</> : <><Check className="size-4" />Confirm &amp; add bet</>}</Button>
      </Card>
    </div>
  </div>;
}
