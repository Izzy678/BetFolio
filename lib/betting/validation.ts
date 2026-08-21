import type { BetslipExtraction } from "@/lib/gemini/schema";

export type ValidationIssue = { field: string; code: string; message: string };
export type ExtractionAssessment = { normalized: BetslipExtraction; issues: ValidationIssue[]; score: number; status: "ready" | "needs_review" };

const SYMBOL_CURRENCIES: Record<string, string> = { "£": "GBP", "$": "USD", "€": "EUR", "₦": "NGN" };

export function normalizeCurrency(value: string | null): string | null {
  if (!value) return null;
  const cleaned = value.trim().toUpperCase();
  return SYMBOL_CURRENCIES[cleaned] ?? (/^[A-Z]{3}$/.test(cleaned) ? cleaned : null);
}

export function assessExtraction(extraction: BetslipExtraction): ExtractionAssessment {
  const issues: ValidationIssue[] = [];
  const normalized = { ...extraction, currency: normalizeCurrency(extraction.currency) };
  if (extraction.documentType !== "settled_betslip") {
    issues.push({ field: "documentType", code: extraction.documentType === "unsettled_betslip" ? "BET_NOT_SETTLED" : "NOT_A_BETSLIP", message: "Only visibly settled betslips can be imported." });
  }
  if (!normalized.currency) issues.push({ field: "currency", code: "MISSING_CURRENCY", message: "Choose the settlement currency." });
  if (extraction.cashStake == null) issues.push({ field: "cashStake", code: "MISSING_STAKE", message: "Enter the cash stake shown on the slip." });
  if (!extraction.status) issues.push({ field: "status", code: "MISSING_STATUS", message: "Choose the final result." });
  if (extraction.status === "won" && extraction.displayedReturn == null) issues.push({ field: "displayedReturn", code: "MISSING_RETURN", message: "A winning bet needs its displayed return." });
  if (["won", "cashout"].includes(extraction.status ?? "") && (!extraction.returnKind || extraction.returnKind === "unknown")) issues.push({ field: "returnKind", code: "AMBIGUOUS_RETURN", message: "Confirm whether this is a gross return, net profit, refund, or cashout." });
  if (extraction.status === "partial_cashout") issues.push({ field: "status", code: "PARTIAL_CASHOUT", message: "Partial cashouts require manual accounting review." });
  if ((extraction.status === "void" || extraction.status === "push") && extraction.cashStake != null && extraction.displayedReturn != null && Math.abs(extraction.cashStake - extraction.displayedReturn) > 0.009) issues.push({ field: "displayedReturn", code: "REFUND_MISMATCH", message: "A void/push refund must match the visible cash stake." });
  if ((extraction.promotionalStake ?? 0) > 0 && extraction.status !== "lost") issues.push({ field: "promotionalStake", code: "PROMO_SETTLEMENT", message: "Promotional settlement accounting needs manual review." });
  if (extraction.betType === "accumulator" && extraction.legs.length < 2) issues.push({ field: "legs", code: "IMPLAUSIBLE_LEGS", message: "An accumulator should contain at least two selections." });

  let score = 100;
  score -= issues.length * 12;
  if (!extraction.bookmaker.name) score -= 5;
  if (!extraction.externalBetId) score -= 4;
  if (!extraction.settledAt) score -= 3;
  return { normalized, issues, score: Math.max(0, score), status: issues.length ? "needs_review" : "ready" };
}
