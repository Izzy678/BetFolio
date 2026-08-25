export const PROMPT_VERSION = "betslip-v3.2.0";

export const EXTRACTION_PROMPT = `Extract only the financial summary from this betting slip screenshot.

We track how much money goes into the market and what comes back. Do not list individual games, selections, or odds.

Return JSON with exactly these fields:
- bookmakerName: visible bookmaker brand, or your best guess from the screenshot
- betType: single | accumulator | bet_builder | system | each_way | other — infer from labels like "Multiple", "Acca", "Bet Builder", or one selection = single
- status: won | lost | cashout | pending
- currency: ISO code if visible, otherwise the currency symbol (for example GBP, NGN, USD). If no symbol is shown, infer from the bookmaker when reasonable (SportyBet -> NGN, Bet365 UK -> GBP).
- stake: cash amount staked
- returnAmount: amount won, cashed out, or returned. Use null for pending open bets and for lost bets unless a refund is shown.
- totalOdds: combined total odds as a decimal number when visible (for example 17.18 for a 17.18 acca). Use null if not shown.
- placedAt: the date/time the bet was placed, as shown on the slip. Prefer ISO 8601 (YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS). Keep the day and month from the slip. If the year is missing, unclear, or hard to read, use the current calendar year — never invent an old year like 2022. Never use the upload time. Use null if day/month are not visible.
- settledAt: the date/time the bet settled or was cashed out, as shown on the slip. Prefer ISO 8601. Same year rule as placedAt. Use null for pending bets or when not visible.

Use pending when the bet is still open and not settled. Use null when a value is missing or unclear. Do not invent numbers.`;
