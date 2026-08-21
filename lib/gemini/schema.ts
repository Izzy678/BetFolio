import { z } from "zod";
import { betStatuses, betTypes, legResults, returnKinds } from "@/lib/betting/types";

const nullableNumber = z.number().finite().nonnegative().nullable();

export const betslipExtractionSchema = z.object({
  documentType: z.enum(["settled_betslip", "unsettled_betslip", "not_a_betslip", "unknown"]),
  bookmaker: z.object({ name: z.string().trim().min(1).nullable() }),
  externalBetId: z.string().trim().min(1).nullable(),
  betType: z.enum(betTypes).nullable(),
  status: z.enum(betStatuses).nullable(),
  currency: z.string().trim().nullable(),
  cashStake: nullableNumber,
  promotionalStake: nullableNumber,
  displayedReturn: nullableNumber,
  returnKind: z.enum(returnKinds).nullable(),
  totalOddsRaw: z.string().trim().nullable(),
  totalOddsDecimal: nullableNumber,
  oddsFormat: z.enum(["decimal", "fractional", "american", "unknown"]).nullable(),
  placedAt: z.string().nullable(),
  settledAt: z.string().nullable(),
  legs: z.array(z.object({
    position: z.number().int().positive(),
    sport: z.string().nullable(),
    competition: z.string().nullable(),
    eventName: z.string().nullable(),
    market: z.string().nullable(),
    selection: z.string().nullable(),
    oddsRaw: z.string().nullable(),
    oddsDecimal: nullableNumber,
    result: z.enum(legResults),
  })).max(100),
  evidence: z.object({
    stakeText: z.string().nullable(),
    returnText: z.string().nullable(),
    statusText: z.string().nullable(),
    betIdText: z.string().nullable(),
  }),
});

export type BetslipExtraction = z.infer<typeof betslipExtractionSchema>;
export const EXTRACTION_SCHEMA_VERSION = "betslip-extraction-v1";
