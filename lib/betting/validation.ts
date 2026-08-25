import type { BetslipExtraction } from "@/lib/gemini/schema";
import { normalizeBetType } from "@/lib/gemini/schema";
import { parseFlexibleDate } from "@/lib/dates";

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
  const normalized: BetslipExtraction = {
    ...extraction,
    bookmakerName: extraction.bookmakerName?.trim() || null,
    betType: normalizeBetType(extraction.betType ?? "single"),
    currency: normalizeCurrency(extraction.currency),
    placedAt: parseFlexibleDate(extraction.placedAt),
    settledAt: parseFlexibleDate(extraction.settledAt),
  };

  if (!normalized.bookmakerName) issues.push({ field: "bookmakerName", code: "MISSING_BOOKMAKER", message: "Enter the bookmaker shown on the slip." });
  if (!normalized.currency) issues.push({ field: "currency", code: "MISSING_CURRENCY", message: "Choose the currency." });
  if (normalized.stake == null) issues.push({ field: "stake", code: "MISSING_STAKE", message: "Enter the stake amount." });
  if (!normalized.status) issues.push({ field: "status", code: "MISSING_STATUS", message: "Choose the bet result." });
  if (!normalized.placedAt) issues.push({ field: "placedAt", code: "MISSING_PLACED_AT", message: "Enter the date this bet was placed (not the upload date)." });
  if (normalized.status === "won" && normalized.returnAmount == null) issues.push({ field: "returnAmount", code: "MISSING_RETURN", message: "Enter the amount won." });
  if (normalized.status === "cashout" && normalized.returnAmount == null) issues.push({ field: "returnAmount", code: "MISSING_RETURN", message: "Enter the cashout amount." });

  let score = 100;
  score -= issues.length * 15;
  return { normalized, issues, score: Math.max(0, score), status: issues.length ? "needs_review" : "ready" };
}
