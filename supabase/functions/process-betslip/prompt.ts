export const PROMPT_VERSION = "betslip-v1.0.0";

export const EXTRACTION_PROMPT = `You are extracting structured data from a settled sports betting slip.

Do not provide betting advice. Do not calculate P&L. Do not infer values that are not supported by the document. Use null when information is absent or ambiguous.

Distinguish carefully between stake, potential return, actual return, winnings/net profit, refund, and cashout value. Only treat the document as settled when it visibly indicates a final result or settlement. If it is open, classify it as unsettled_betslip. Preserve the bookmaker's visible Bet ID exactly when possible. For accumulators, extract each leg separately, but never assign monetary P&L to a leg. Preserve raw odds and normalize to decimal only when unambiguous.

Return only JSON matching the supplied schema.`;
