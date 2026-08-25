import { describe, expect, it } from "vitest";
import { calculatePnl, calculateRoi, createLedgerEntries } from "@/lib/betting/ledger";

const base = { currency: "GBP", cashStake: 20 } as const;
describe("deterministic ledger", () => {
  it("records a loss as cash stake only", () => expect(calculatePnl(createLedgerEntries({ ...base, status: "lost", displayedReturn: 0, returnKind: "gross_return" }))).toBe(-20));
  it("records a win as stake plus gross settlement", () => expect(calculatePnl(createLedgerEntries({ ...base, status: "won", displayedReturn: 50, returnKind: "gross_return" }))).toBe(30));
  it("converts net winnings to a gross settlement", () => expect(calculatePnl(createLedgerEntries({ ...base, status: "won", displayedReturn: 30, returnKind: "net_profit" }))).toBe(30));
  it("records a void as a neutral refund", () => expect(calculatePnl(createLedgerEntries({ ...base, status: "void", displayedReturn: 20, returnKind: "refund" }))).toBe(0));
  it("records full cashout", () => expect(calculatePnl(createLedgerEntries({ ...base, status: "cashout", displayedReturn: 27.5, returnKind: "cashout" }))).toBe(7.5));
  it("records pending stake as money at risk", () => expect(calculatePnl(createLedgerEntries({ ...base, status: "pending", displayedReturn: null, returnKind: null }))).toBe(-20));
  it("calculates ROI and avoids division by zero", () => { expect(calculateRoi(30, 100)).toBe(30); expect(calculateRoi(30, 0)).toBeNull(); });
});
