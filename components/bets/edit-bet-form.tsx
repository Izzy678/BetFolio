"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, PencilLine } from "lucide-react";
import { BetFields } from "@/components/bets/bet-fields";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { calculatePnl, createLedgerEntries } from "@/lib/betting/ledger";
import { friendlyError } from "@/lib/errors";
import { extractionBetTypes, extractionStatuses, toConfirmedBetInput, type BetslipExtraction } from "@/lib/gemini/schema";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { formatMoney } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

export type EditableBet = {
  id: string;
  bookmaker: string;
  betType: string;
  status: string;
  currency: string;
  cashStake: number;
  grossReturn: number | null;
  odds: number | null;
  placedAt: string | null;
  settledAt: string | null;
};

function toForm(bet: EditableBet): BetslipExtraction {
  const status = (extractionStatuses as readonly string[]).includes(bet.status)
    ? (bet.status as BetslipExtraction["status"])
    : null;
  const betType = (extractionBetTypes as readonly string[]).includes(bet.betType)
    ? (bet.betType as BetslipExtraction["betType"])
    : "single";
  return {
    bookmakerName: bet.bookmaker,
    betType,
    status,
    currency: bet.currency,
    stake: bet.cashStake,
    returnAmount: status === "lost" ? 0 : bet.grossReturn,
    totalOdds: bet.odds,
    placedAt: bet.placedAt,
    settledAt: bet.settledAt,
  };
}

export function EditBetForm({ bet }: { bet: EditableBet }) {
  const [form, setForm] = useState<BetslipExtraction>(() => toForm(bet));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const toast = useToast();
  const update = <K extends keyof BetslipExtraction>(key: K, value: BetslipExtraction[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };
  const input = useMemo(() => toConfirmedBetInput(form), [form]);
  let pnl: number | null = null;
  try {
    if (input) pnl = calculatePnl(createLedgerEntries(input));
  } catch {
    pnl = null;
  }

  async function save() {
    if (!input) {
      const message = "Complete bookmaker, result, stake, currency, and placed date.";
      setError(message);
      toast.error("Can't save yet");
      return;
    }
    setPending(true);
    setError("");
    try {
      if (!isSupabaseConfigured()) {
        toast.success("Changes saved");
        router.push("/bets");
        return;
      }
      const supabase = createClient();
      const { error: rpcError } = await supabase.rpc("update_bet", {
        p_bet_id: bet.id,
        p_bet: input,
      });
      if (rpcError) {
        const message = rpcError.message ?? "";
        if (message.includes("BET_NOT_FOUND")) throw new Error("BET_NOT_FOUND");
        if (message.includes("PLACED_AT_REQUIRED") || message.includes("INVALID") || message.includes("UNSUPPORTED") || message.includes("RETURN_REQUIRED")) throw new Error("INVALID_IMPORT");
        throw new Error("INTERNAL_ERROR");
      }
      toast.success("Bet updated");
      router.push("/bets");
    } catch (caught) {
      const message = friendlyError(caught instanceof Error ? caught.message : undefined);
      setError(message);
      toast.error("Couldn't save changes");
    } finally {
      setPending(false);
    }
  }

  return (
    <Card className="p-5 sm:p-6">
      <div className="mb-6 flex items-center gap-2">
        <PencilLine className="size-4 text-zinc-400" />
        <h2 className="text-sm font-semibold">Edit bet</h2>
      </div>
      <BetFields form={form} onChange={update} />
      <div className="mt-7 rounded-2xl border border-white/10 bg-white/[.03] p-5">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-medium text-zinc-500">Estimated P&amp;L</p>
            <p className="mt-2 text-xs text-zinc-600">Updates the dashboard graph to the placed date.</p>
          </div>
          <p className={`text-3xl font-semibold tracking-[-.04em] ${pnl == null ? "text-zinc-500" : pnl >= 0 ? "text-emerald-400" : "text-red-300"}`}>{pnl == null ? "—" : formatMoney(pnl, form.currency ?? "GBP", true)}</p>
        </div>
      </div>
      {error && <p role="alert" className="mt-4 text-sm text-red-300">{error}</p>}
      <Button onClick={save} disabled={pending || pnl == null} className="mt-4 w-full">
        {pending ? <><Loader2 className="size-4 animate-spin" />Saving…</> : <><Check className="size-4" />Save changes</>}
      </Button>
    </Card>
  );
}
