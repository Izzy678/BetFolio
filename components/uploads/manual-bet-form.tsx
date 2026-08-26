"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, PencilLine } from "lucide-react";
import { BetFields, emptyBetForm } from "@/components/bets/bet-fields";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { calculatePnl, createLedgerEntries } from "@/lib/betting/ledger";
import { assessExtraction } from "@/lib/betting/validation";
import { friendlyError } from "@/lib/errors";
import { toConfirmedBetInput, type BetslipExtraction } from "@/lib/gemini/schema";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { formatMoney } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

export function ManualBetForm() {
  const [form, setForm] = useState<BetslipExtraction>(emptyBetForm);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);
  const router = useRouter();
  const toast = useToast();
  const update = <K extends keyof BetslipExtraction>(key: K, value: BetslipExtraction[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };
  const assessment = useMemo(() => assessExtraction(form), [form]);
  const warningFields = touched ? new Set(assessment.issues.map((issue) => issue.field)) : new Set<string>();
  const input = useMemo(() => toConfirmedBetInput(form), [form]);
  let pnl: number | null = null;
  try {
    if (input) pnl = calculatePnl(createLedgerEntries(input));
  } catch {
    pnl = null;
  }

  async function save() {
    setTouched(true);
    if (!input) {
      setError("Complete the required fields before saving.");
      toast.error("Can't save yet");
      return;
    }
    setPending(true);
    setError("");
    try {
      if (!isSupabaseConfigured()) {
        toast.success("Bet added");
        router.push("/bets");
        return;
      }
      const supabase = createClient();
      const { data: betId, error: rpcError } = await supabase.rpc("create_manual_bet", { p_bet: input });
      if (rpcError) {
        const message = rpcError.message ?? "";
        if (message.includes("BET_DUPLICATE") || rpcError.code === "23505") throw new Error("BET_DUPLICATE");
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

  return (
    <Card className="mx-auto max-w-2xl p-5 sm:p-6">
      <div className="mb-6 flex items-center gap-2">
        <PencilLine className="size-4 text-zinc-400" />
        <h2 className="text-sm font-semibold">Bet details</h2>
      </div>
      <BetFields form={form} onChange={update} warningFields={warningFields} />
      <div className="mt-7 rounded-2xl border border-white/10 bg-white/[.03] p-5">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-medium text-zinc-500">Estimated P&amp;L</p>
            <p className="mt-2 text-xs text-zinc-600">{form.status === "pending" ? "Pending bets only count stake until settled." : "Cash in minus cash out"}</p>
          </div>
          <p className={`text-3xl font-semibold tracking-[-.04em] ${pnl == null ? "text-zinc-500" : pnl >= 0 ? "text-emerald-400" : "text-red-300"}`}>
            {pnl == null ? "—" : formatMoney(pnl, form.currency ?? "GBP", true)}
          </p>
        </div>
      </div>
      {error && <p role="alert" className="mt-4 text-sm text-red-300">{error}</p>}
      <Button onClick={save} disabled={pending} className="mt-4 w-full">
        {pending ? <><Loader2 className="size-4 animate-spin" />Saving…</> : <><Check className="size-4" />Add bet</>}
      </Button>
    </Card>
  );
}
