import { describe, expect, it } from "vitest";
import { assessExtraction } from "@/lib/betting/validation";
import { betslipExtractionSchema } from "@/lib/gemini/schema";
import { mockExtractions } from "@/lib/gemini/fixtures";

describe("extraction validation", () => {
  it("accepts a valid settled winner", () => expect(assessExtraction(mockExtractions.winning_accumulator).status).toBe("ready"));
  it("accepts a valid settled loser", () => expect(assessExtraction(mockExtractions.losing_single).issues).toHaveLength(0));
  it("requires missing currency", () => expect(assessExtraction({ ...mockExtractions.winning_single, currency: null }).issues.some((issue) => issue.code === "MISSING_CURRENCY")).toBe(true));
  it("rejects an unsettled slip", () => expect(assessExtraction({ ...mockExtractions.winning_single, documentType: "unsettled_betslip" }).issues.some((issue) => issue.code === "BET_NOT_SETTLED")).toBe(true));
  it("rejects a non-betslip", () => expect(assessExtraction({ ...mockExtractions.winning_single, documentType: "not_a_betslip" }).issues.some((issue) => issue.code === "NOT_A_BETSLIP")).toBe(true));
  it("flags ambiguous return semantics", () => expect(assessExtraction({ ...mockExtractions.winning_single, returnKind: "unknown" }).issues.some((issue) => issue.code === "AMBIGUOUS_RETURN")).toBe(true));
  it("flags partial cashout", () => expect(assessExtraction(mockExtractions.ambiguous).issues.some((issue) => issue.code === "PARTIAL_CASHOUT")).toBe(true));
  it("rejects malformed AI output", () => expect(betslipExtractionSchema.safeParse({ documentType: "settled_betslip" }).success).toBe(false));
});
