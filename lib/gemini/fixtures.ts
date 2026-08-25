import type { BetslipExtraction } from "./schema";

export const mockExtractions: Record<string, BetslipExtraction> = {
  winning: { bookmakerName: "Bet365", betType: "accumulator", status: "won", currency: "GBP", stake: 20, returnAmount: 94.4, totalOdds: 4.72, placedAt: "2026-08-20T15:18:00.000Z", settledAt: "2026-08-20T20:42:00.000Z" },
  losing: { bookmakerName: "Sky Bet", betType: "single", status: "lost", currency: "GBP", stake: 35, returnAmount: 0, totalOdds: 2.1, placedAt: "2026-08-19T18:00:00.000Z", settledAt: "2026-08-19T21:00:00.000Z" },
  cashout: { bookmakerName: "Betfair", betType: "single", status: "cashout", currency: "GBP", stake: 20, returnAmount: 27.5, totalOdds: 1.38, placedAt: "2026-08-18T12:00:00.000Z", settledAt: "2026-08-18T16:20:00.000Z" },
  pending: { bookmakerName: "SportyBet", betType: "accumulator", status: "pending", currency: "NGN", stake: 500, returnAmount: null, totalOdds: 17.18, placedAt: "2026-08-22T10:00:00.000Z", settledAt: null },
  incomplete: { bookmakerName: null, betType: null, status: "won", currency: null, stake: null, returnAmount: 18, totalOdds: null, placedAt: null, settledAt: null },
};
