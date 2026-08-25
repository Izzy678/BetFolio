export type BetListItem = {
  id: string;
  bookmaker: string;
  externalBetId: string | null;
  betType: string;
  status: string;
  currency: string;
  cashStake: number;
  odds: number | null;
  pnl: number;
  placedAt: string | null;
  settledAt: string | null;
};

export const previewBets: BetListItem[] = [
  { id: "preview-1", bookmaker: "Bet365", externalBetId: "O/9482612/0001876", betType: "accumulator", status: "won", currency: "GBP", cashStake: 20, odds: 4.72, pnl: 74.4, placedAt: "2026-08-20T15:18:00Z", settledAt: "2026-08-20T20:42:00Z" },
  { id: "preview-2", bookmaker: "Sky Bet", externalBetId: "SB-813842", betType: "single", status: "lost", currency: "GBP", cashStake: 35, odds: 2.1, pnl: -35, placedAt: "2026-08-19T18:00:00Z", settledAt: "2026-08-19T21:00:00Z" },
  { id: "preview-3", bookmaker: "Paddy Power", externalBetId: "PP-339120", betType: "single", status: "cashout", currency: "GBP", cashStake: 25, odds: 3.4, pnl: 12.5, placedAt: "2026-08-18T12:00:00Z", settledAt: "2026-08-18T16:20:00Z" },
  { id: "preview-4", bookmaker: "William Hill", externalBetId: "WH-382934", betType: "bet_builder", status: "void", currency: "GBP", cashStake: 15, odds: 5.1, pnl: 0, placedAt: "2026-08-16T10:00:00Z", settledAt: "2026-08-16T14:05:00Z" },
];
