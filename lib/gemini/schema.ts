import { z } from "zod";
import type { ConfirmedBetInput } from "@/lib/betting/types";
import { betTypes, type BetType } from "@/lib/betting/types";
import { fromDateInputValue } from "@/lib/dates";

export const extractionStatuses = ["won", "lost", "cashout", "pending"] as const;
export const extractionBetTypes = betTypes;

export const betslipExtractionSchema = z.object({
  bookmakerName: z.string().trim().nullable(),
  betType: z.enum(betTypes).nullable(),
  status: z.enum(extractionStatuses).nullable(),
  currency: z.string().trim().nullable(),
  stake: z.number().finite().nonnegative().nullable(),
  returnAmount: z.number().finite().nonnegative().nullable(),
  totalOdds: z.number().finite().nonnegative().nullable(),
  placedAt: z.string().trim().nullable(),
  settledAt: z.string().trim().nullable(),
});

export type BetslipExtraction = z.infer<typeof betslipExtractionSchema>;
export const EXTRACTION_SCHEMA_VERSION = "betslip-extraction-v4";

function toIsoDate(value: string | null) {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return fromDateInputValue(value);
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return null;
  return new Date(parsed).toISOString();
}

export function toConfirmedBetInput(extraction: BetslipExtraction): ConfirmedBetInput | null {
  if (!extraction.status || !extraction.currency || extraction.stake == null || !extraction.placedAt) return null;

  const placedAt = toIsoDate(extraction.placedAt);
  if (!placedAt) return null;
  const settledAt = extraction.status === "pending" ? null : toIsoDate(extraction.settledAt) ?? placedAt;

  return {
    bookmakerName: extraction.bookmakerName,
    externalBetId: null,
    betType: extraction.betType ?? "single",
    status: extraction.status,
    currency: extraction.currency.toUpperCase(),
    cashStake: extraction.stake,
    promotionalStake: 0,
    displayedReturn: extraction.status === "lost" ? 0 : extraction.returnAmount,
    returnKind: extraction.status === "won" ? "gross_return" : extraction.status === "cashout" ? "cashout" : null,
    totalOddsRaw: extraction.totalOdds == null ? null : String(extraction.totalOdds),
    totalOddsDecimal: extraction.totalOdds,
    oddsFormat: extraction.totalOdds == null ? null : "decimal",
    placedAt,
    settledAt,
    legs: [],
  };
}

export function normalizeBetType(value: unknown): BetType {
  if (typeof value !== "string") return "single";
  const raw = value.trim().toLowerCase();
  if ((betTypes as readonly string[]).includes(raw)) return raw as BetType;
  if (/multi|acca|accumulator|parlay|combo/.test(raw)) return "accumulator";
  if (/builder/.test(raw)) return "bet_builder";
  if (/system/.test(raw)) return "system";
  if (/each.?way|eachway/.test(raw)) return "each_way";
  return "single";
}
