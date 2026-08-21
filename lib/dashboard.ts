export type DashboardSnapshot = {
  currency: string;
  summary: { netPnl: number; cashStaked: number; totalReturned: number; roi: number | null; totalBets: number; winRate: number | null };
  daily: Array<{ date: string; pnl: number; cumulative: number }>;
  bookmakers: Array<{ name: string; pnl: number; bets: number }>;
  recent: Array<{ id: string; bookmaker: string; betType: string; status: string; stake: number; pnl: number; settledAt: string }>;
  currencies: string[];
};

export const previewDashboard: DashboardSnapshot = {
  currency: "GBP",
  summary: { netPnl: 1284.6, cashStaked: 8420, totalReturned: 9704.6, roi: 15.26, totalBets: 142, winRate: 54.8 },
  daily: [
    { date: "2026-07-23", pnl: 90, cumulative: 90 }, { date: "2026-07-27", pnl: -45, cumulative: 45 }, { date: "2026-07-31", pnl: 186, cumulative: 231 },
    { date: "2026-08-03", pnl: 72, cumulative: 303 }, { date: "2026-08-07", pnl: -30, cumulative: 273 }, { date: "2026-08-11", pnl: 316, cumulative: 589 },
    { date: "2026-08-14", pnl: 204, cumulative: 793 }, { date: "2026-08-17", pnl: 156, cumulative: 949 }, { date: "2026-08-20", pnl: 335.6, cumulative: 1284.6 },
  ],
  bookmakers: [{ name: "Bet365", pnl: 624.4, bets: 48 }, { name: "Sky Bet", pnl: 311.2, bets: 36 }, { name: "Paddy Power", pnl: 204.5, bets: 31 }, { name: "William Hill", pnl: 144.5, bets: 27 }],
  recent: [
    { id: "preview-1", bookmaker: "Bet365", betType: "accumulator", status: "won", stake: 20, pnl: 74.4, settledAt: "2026-08-20T18:40:00Z" },
    { id: "preview-2", bookmaker: "Sky Bet", betType: "single", status: "lost", stake: 35, pnl: -35, settledAt: "2026-08-19T21:00:00Z" },
    { id: "preview-3", bookmaker: "Paddy Power", betType: "single", status: "cashout", stake: 25, pnl: 12.5, settledAt: "2026-08-18T16:20:00Z" },
  ],
  currencies: ["GBP", "EUR"],
};
