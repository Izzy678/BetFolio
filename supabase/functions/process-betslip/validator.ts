type Extraction = {
  bookmakerName?: string | null;
  betType?: string | null;
  status?: string | null;
  currency?: string | null;
  stake?: number | null;
  returnAmount?: number | null;
  totalOdds?: number | null;
  placedAt?: string | null;
  settledAt?: string | null;
};

const STATUSES = new Set(["won", "lost", "cashout", "pending"]);
const BET_TYPES = new Set(["single", "accumulator", "bet_builder", "system", "each_way", "other"]);
const SYMBOLS: Record<string, string> = { "£": "GBP", "$": "USD", "€": "EUR", "₦": "NGN" };

function money(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : null;
}

function normalizeBetType(value: unknown): string {
  if (typeof value !== "string") return "single";
  const raw = value.trim().toLowerCase();
  if (BET_TYPES.has(raw)) return raw;
  if (/multi|acca|accumulator|parlay|combo/.test(raw)) return "accumulator";
  if (/builder/.test(raw)) return "bet_builder";
  if (/system/.test(raw)) return "system";
  if (/each.?way|eachway/.test(raw)) return "each_way";
  return "single";
}

/** Keep day/month from OCR; force year to the current calendar year. */
function parseDate(value: unknown, now = new Date()): string | null {
  if (typeof value !== "string") return null;
  const raw = value.trim();
  if (!raw) return null;

  let date: Date | null = null;
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
    date = new Date(`${raw.slice(0, 10)}T12:00:00.000Z`);
  } else {
    const parsed = Date.parse(raw);
    if (!Number.isNaN(parsed)) date = new Date(parsed);
  }
  if (!date || Number.isNaN(date.getTime())) return null;

  date.setUTCFullYear(now.getUTCFullYear());
  date.setUTCHours(12, 0, 0, 0);
  return date.toISOString();
}

export function validateExtraction(input: unknown) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("GEMINI_INVALID_RESPONSE");
  const extraction = input as Extraction;
  const issues: Array<{ field: string; code: string; message: string }> = [];
  const currencyRaw = typeof extraction.currency === "string" ? extraction.currency.trim().toUpperCase() : null;
  const currency = currencyRaw ? SYMBOLS[currencyRaw] ?? (/^[A-Z]{3}$/.test(currencyRaw) ? currencyRaw : null) : null;
  const status = typeof extraction.status === "string" && STATUSES.has(extraction.status) ? extraction.status : null;
  const normalized = {
    bookmakerName: typeof extraction.bookmakerName === "string" ? extraction.bookmakerName.trim() || null : null,
    betType: normalizeBetType(extraction.betType),
    status,
    currency,
    stake: money(extraction.stake),
    returnAmount: money(extraction.returnAmount),
    totalOdds: money(extraction.totalOdds),
    placedAt: parseDate(extraction.placedAt),
    settledAt: status === "pending" ? null : parseDate(extraction.settledAt),
  };

  if (!normalized.bookmakerName) issues.push({ field: "bookmakerName", code: "MISSING_BOOKMAKER", message: "Bookmaker needs confirmation." });
  if (!currency) issues.push({ field: "currency", code: "MISSING_CURRENCY", message: "Currency needs confirmation." });
  if (normalized.stake == null) issues.push({ field: "stake", code: "MISSING_STAKE", message: "Stake needs confirmation." });
  if (!status) issues.push({ field: "status", code: "MISSING_STATUS", message: "Bet status needs confirmation." });
  if (!normalized.placedAt) issues.push({ field: "placedAt", code: "MISSING_PLACED_AT", message: "Enter the date this bet was placed (not the upload date)." });
  if (status === "won" && normalized.returnAmount == null) issues.push({ field: "returnAmount", code: "MISSING_RETURN", message: "Winning return is missing." });
  if (status === "cashout" && normalized.returnAmount == null) issues.push({ field: "returnAmount", code: "MISSING_RETURN", message: "Cashout amount is missing." });

  const score = Math.max(0, 100 - issues.length * 15);
  return { normalized, issues, score, status: issues.length ? "needs_review" : "ready" };
}
