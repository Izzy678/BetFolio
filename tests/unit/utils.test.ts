import { describe, expect, it } from "vitest";
import { formatMoney } from "@/lib/utils";

describe("formatMoney", () => {
  it("formats a valid ISO currency", () => expect(formatMoney(1000, "NGN")).toContain("1,000.00"));
  it("does not throw for partial currency codes while typing", () => expect(formatMoney(1500, "N")).toBe("1,500.00 N"));
});
