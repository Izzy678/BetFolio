import type { ConfirmedBetInput, LedgerEntry } from "./types";

function money(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function createLedgerEntries(input: Pick<ConfirmedBetInput, "status" | "currency" | "cashStake" | "displayedReturn" | "returnKind">): LedgerEntry[] {
  const entries: LedgerEntry[] = [];
  if (input.cashStake > 0) {
    entries.push({ type: "stake", amount: money(-input.cashStake), currency: input.currency });
  }

  if (input.status === "lost") return entries;

  if (input.status === "void" || input.status === "push") {
    if (input.displayedReturn != null && Math.abs(input.displayedReturn - input.cashStake) > 0.009) throw new Error("Refund must match cash stake.");
    entries.push({ type: "refund", amount: money(input.displayedReturn ?? input.cashStake), currency: input.currency });
    return entries;
  }

  if (input.status === "cashout") {
    if (input.displayedReturn == null) throw new Error("Cashout amount is required.");
    if (input.returnKind !== "cashout") throw new Error("Cashout return meaning must be confirmed.");
    entries.push({ type: "cashout", amount: money(input.displayedReturn), currency: input.currency });
    return entries;
  }

  if (input.status === "won") {
    if (input.displayedReturn == null) throw new Error("Return amount is required for a winning bet.");
    if (input.returnKind !== "gross_return" && input.returnKind !== "net_profit") throw new Error("Winning return meaning must be confirmed.");
    const gross = input.returnKind === "net_profit" ? input.displayedReturn + input.cashStake : input.displayedReturn;
    entries.push({ type: "settlement", amount: money(gross), currency: input.currency });
    return entries;
  }

  throw new Error("This settlement requires manual accounting review.");
}

export function calculatePnl(entries: LedgerEntry[]): number {
  return money(entries.reduce((sum, entry) => sum + entry.amount, 0));
}

export function calculateRoi(pnl: number, cashStaked: number): number | null {
  if (cashStaked === 0) return null;
  return money((pnl / cashStaked) * 100);
}
