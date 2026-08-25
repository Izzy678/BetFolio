import { describe, expect, it } from "vitest";
import { assessExtraction } from "@/lib/betting/validation";
import { betslipExtractionSchema, toConfirmedBetInput } from "@/lib/gemini/schema";
import { mockExtractions } from "@/lib/gemini/fixtures";

describe("extraction validation", () => {
  it("accepts a valid winner", () => expect(assessExtraction(mockExtractions.winning).status).toBe("ready"));
  it("accepts a valid loser", () => expect(assessExtraction(mockExtractions.losing).issues).toHaveLength(0));
  it("accepts a pending bet with stake only", () => expect(assessExtraction(mockExtractions.pending).status).toBe("ready"));
  it("requires missing currency", () => expect(assessExtraction({ ...mockExtractions.winning, currency: null }).issues.some((issue) => issue.code === "MISSING_CURRENCY")).toBe(true));
  it("requires return for a win", () => expect(assessExtraction({ ...mockExtractions.winning, returnAmount: null }).issues.some((issue) => issue.code === "MISSING_RETURN")).toBe(true));
  it("maps to a confirmed bet input", () => expect(toConfirmedBetInput(mockExtractions.winning)?.cashStake).toBe(20));
  it("maps total odds to decimal storage", () => expect(toConfirmedBetInput(mockExtractions.pending)?.totalOddsDecimal).toBe(17.18));
  it("requires a placement date before confirm", () => expect(toConfirmedBetInput({ ...mockExtractions.winning, placedAt: null })).toBeNull());
  it("maps placement date through to the confirmed bet", () => expect(toConfirmedBetInput(mockExtractions.winning)?.placedAt).toBe("2026-08-20T15:18:00.000Z"));
  it("forces AI slip years to the current year", () => {
    const assessed = assessExtraction({ ...mockExtractions.winning, placedAt: "2022-08-22", settledAt: "2022-08-22" });
    const year = new Date().getUTCFullYear();
    expect(assessed.normalized.placedAt).toBe(`${year}-08-22T12:00:00.000Z`);
    expect(assessed.normalized.settledAt).toBe(`${year}-08-22T12:00:00.000Z`);
  });
  it("maps bet type through to the confirmed bet", () => expect(toConfirmedBetInput(mockExtractions.winning)?.betType).toBe("accumulator"));
  it("rejects malformed AI output", () => expect(betslipExtractionSchema.safeParse({ status: "won" }).success).toBe(false));
});
