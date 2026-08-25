export const mockDefault = {
  bookmakerName: "Bet365",
  betType: "accumulator",
  status: "won",
  currency: "GBP",
  stake: 20,
  returnAmount: 94.4,
  totalOdds: 4.72,
  placedAt: "2026-08-20T15:18:00.000Z",
  settledAt: "2026-08-20T20:42:00.000Z",
};

export function mockForFilename(filename: string) {
  const lower = filename.toLowerCase();
  if (lower.includes("lost")) return { ...mockDefault, bookmakerName: "Sky Bet", betType: "single", status: "lost", stake: 35, returnAmount: 0, totalOdds: 2.1, placedAt: "2026-08-19T18:00:00.000Z", settledAt: "2026-08-19T21:00:00.000Z" };
  if (lower.includes("cashout")) return { ...mockDefault, bookmakerName: "Betfair", betType: "single", status: "cashout", stake: 20, returnAmount: 27.5, placedAt: "2026-08-18T12:00:00.000Z", settledAt: "2026-08-18T16:20:00.000Z" };
  if (lower.includes("pending")) return { ...mockDefault, bookmakerName: "SportyBet", betType: "accumulator", status: "pending", currency: "NGN", stake: 500, returnAmount: null, settledAt: null };
  return mockDefault;
}
