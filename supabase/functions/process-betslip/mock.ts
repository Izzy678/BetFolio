export const mockWinningAccumulator = {
  documentType: "settled_betslip", bookmaker: { name: "Bet365" }, externalBetId: "MOCK-ACC-9482612", betType: "accumulator", status: "won", currency: "GBP", cashStake: 20, promotionalStake: 0, displayedReturn: 94.4, returnKind: "gross_return", totalOddsRaw: "4.72", totalOddsDecimal: 4.72, oddsFormat: "decimal", placedAt: null, settledAt: null,
  legs: [{ position: 1, sport: "Football", competition: "Premier League", eventName: "Arsenal v Everton", market: "Match Result", selection: "Arsenal", oddsRaw: "1.65", oddsDecimal: 1.65, result: "won" }, { position: 2, sport: "Football", competition: "Premier League", eventName: "Liverpool v Brighton", market: "Total Goals", selection: "Over 2.5", oddsRaw: "2.86", oddsDecimal: 2.86, result: "won" }], evidence: { stakeText: "Stake £20.00", returnText: "Returns £94.40", statusText: "Won", betIdText: "MOCK-ACC-9482612" },
};

export function mockForFilename(filename: string) {
  const lower = filename.toLowerCase();
  if (lower.includes("lost")) return { ...mockWinningAccumulator, externalBetId: "MOCK-LOST-1", betType: "single", status: "lost", displayedReturn: 0, returnKind: "gross_return", legs: [mockWinningAccumulator.legs[0]] };
  if (lower.includes("void")) return { ...mockWinningAccumulator, externalBetId: "MOCK-VOID-1", betType: "single", status: "void", displayedReturn: 20, returnKind: "refund", legs: [] };
  if (lower.includes("cashout")) return { ...mockWinningAccumulator, externalBetId: "MOCK-CASH-1", betType: "single", status: "cashout", displayedReturn: 27.5, returnKind: "cashout", legs: [] };
  if (lower.includes("ambiguous")) return { ...mockWinningAccumulator, externalBetId: null, bookmaker: { name: null }, status: "partial_cashout", currency: null, cashStake: null, displayedReturn: 18, returnKind: "unknown", legs: [] };
  return mockWinningAccumulator;
}
