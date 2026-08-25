export const betTypes = ["single", "accumulator", "bet_builder", "system", "each_way", "other"] as const;
export const betStatuses = ["won", "lost", "void", "push", "cashout", "partial_cashout", "settled_unknown", "pending"] as const;
export const legResults = ["won", "lost", "void", "push", "unknown"] as const;
export const returnKinds = ["gross_return", "net_profit", "refund", "cashout", "unknown"] as const;
export const transactionTypes = ["stake", "settlement", "refund", "cashout", "bonus", "fee", "tax", "adjustment"] as const;

export type BetType = (typeof betTypes)[number];
export type BetStatus = (typeof betStatuses)[number];
export type ReturnKind = (typeof returnKinds)[number];
export type TransactionType = (typeof transactionTypes)[number];

export type BetLegInput = {
  position: number;
  sport: string | null;
  competition: string | null;
  eventName: string | null;
  market: string | null;
  selection: string | null;
  oddsRaw: string | null;
  oddsDecimal: number | null;
  result: (typeof legResults)[number];
};

export type ConfirmedBetInput = {
  bookmakerName: string | null;
  externalBetId: string | null;
  betType: BetType;
  status: BetStatus;
  currency: string;
  cashStake: number;
  promotionalStake: number;
  displayedReturn: number | null;
  returnKind: ReturnKind | null;
  totalOddsRaw: string | null;
  totalOddsDecimal: number | null;
  oddsFormat: "decimal" | "fractional" | "american" | "unknown" | null;
  placedAt: string | null;
  settledAt: string | null;
  legs: BetLegInput[];
};

export type LedgerEntry = {
  type: TransactionType;
  amount: number;
  currency: string;
};
