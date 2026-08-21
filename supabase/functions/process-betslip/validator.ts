type Extraction = Record<string, unknown> & { documentType?: string; bookmaker?: { name?: string | null }; externalBetId?: string | null; betType?: string | null; status?: string | null; currency?: string | null; cashStake?: number | null; promotionalStake?: number | null; displayedReturn?: number | null; returnKind?: string | null; totalOddsRaw?: string | null; totalOddsDecimal?: number | null; oddsFormat?: string | null; legs?: unknown[] };

const SYMBOLS: Record<string,string> = { "£":"GBP", "$":"USD", "€":"EUR", "₦":"NGN" };
export function validateExtraction(input: unknown) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("GEMINI_INVALID_RESPONSE");
  const extraction = input as Extraction; const issues: Array<{ field: string; code: string; message: string }> = [];
  const currencyRaw = typeof extraction.currency === "string" ? extraction.currency.trim().toUpperCase() : null;
  const currency = currencyRaw ? SYMBOLS[currencyRaw] ?? (/^[A-Z]{3}$/.test(currencyRaw) ? currencyRaw : null) : null;
  const normalized = { ...extraction, currency };
  if (extraction.documentType !== "settled_betslip") issues.push({ field: "documentType", code: extraction.documentType === "unsettled_betslip" ? "BET_NOT_SETTLED" : "NOT_A_BETSLIP", message: "Only visibly settled betslips can be imported." });
  for (const [field,value] of [["cashStake",extraction.cashStake],["promotionalStake",extraction.promotionalStake],["displayedReturn",extraction.displayedReturn],["totalOddsDecimal",extraction.totalOddsDecimal]] as const) if (value != null && (typeof value !== "number" || !Number.isFinite(value) || value < 0)) issues.push({ field, code: "INVALID_MONEY", message: `${field} must be a non-negative number.` });
  if (!currency) issues.push({ field: "currency", code: "MISSING_CURRENCY", message: "Settlement currency needs confirmation." });
  if (extraction.cashStake == null) issues.push({ field: "cashStake", code: "MISSING_STAKE", message: "Cash stake needs confirmation." });
  if (!extraction.status) issues.push({ field: "status", code: "MISSING_STATUS", message: "Settlement status needs confirmation." });
  if (extraction.status === "won" && extraction.displayedReturn == null) issues.push({ field: "displayedReturn", code: "MISSING_RETURN", message: "Winning bet return is missing." });
  if (["won","cashout"].includes(extraction.status ?? "") && (!extraction.returnKind || extraction.returnKind === "unknown")) issues.push({ field: "returnKind", code: "AMBIGUOUS_RETURN", message: "Return meaning needs confirmation." });
  if (extraction.status === "partial_cashout") issues.push({ field: "status", code: "PARTIAL_CASHOUT", message: "Partial cashouts require manual review." });
  if ((extraction.status === "void" || extraction.status === "push") && extraction.cashStake != null && extraction.displayedReturn != null && Math.abs(extraction.cashStake - extraction.displayedReturn) > 0.009) issues.push({ field: "displayedReturn", code: "REFUND_MISMATCH", message: "A void/push refund must match the visible cash stake." });
  if ((extraction.promotionalStake ?? 0) > 0 && extraction.status !== "lost") issues.push({ field: "promotionalStake", code: "PROMO_SETTLEMENT", message: "Promotional settlement accounting needs manual review." });
  if (!Array.isArray(extraction.legs)) throw new Error("GEMINI_INVALID_RESPONSE");
  const score = 100 - issues.length * 12 - (!extraction.bookmaker?.name ? 5 : 0) - (!extraction.externalBetId ? 4 : 0);
  return { normalized, issues, score: Math.max(0, score), status: issues.length ? "needs_review" : "ready" };
}
