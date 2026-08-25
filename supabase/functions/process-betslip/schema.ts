export const SCHEMA_VERSION = "betslip-extraction-v4";

export const responseJsonSchema = {
  type: "object",
  properties: {
    bookmakerName: { type: "string" },
    betType: { type: "string" },
    status: { type: "string" },
    currency: { type: "string" },
    stake: { type: "number" },
    returnAmount: { type: "number" },
    totalOdds: { type: "number" },
    placedAt: { type: "string" },
    settledAt: { type: "string" },
  },
};
