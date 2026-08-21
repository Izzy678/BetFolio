export const SCHEMA_VERSION = "betslip-extraction-v1";

const nullableString = { anyOf: [{ type: "string" }, { type: "null" }] };
const nullableNumber = { anyOf: [{ type: "number", minimum: 0 }, { type: "null" }] };
const nullableEnum = (values: string[]) => ({ anyOf: [{ type: "string", enum: values }, { type: "null" }] });

export const responseJsonSchema = {
  type: "object", additionalProperties: false,
  required: ["documentType","bookmaker","externalBetId","betType","status","currency","cashStake","promotionalStake","displayedReturn","returnKind","totalOddsRaw","totalOddsDecimal","oddsFormat","placedAt","settledAt","legs","evidence"],
  properties: {
    documentType: { type: "string", enum: ["settled_betslip","unsettled_betslip","not_a_betslip","unknown"] },
    bookmaker: { type: "object", additionalProperties: false, required: ["name"], properties: { name: nullableString } },
    externalBetId: nullableString, betType: nullableEnum(["single","accumulator","bet_builder","system","each_way","other"]), status: nullableEnum(["won","lost","void","push","cashout","partial_cashout","settled_unknown"]), currency: nullableString,
    cashStake: nullableNumber, promotionalStake: nullableNumber, displayedReturn: nullableNumber, returnKind: nullableEnum(["gross_return","net_profit","refund","cashout","unknown"]), totalOddsRaw: nullableString, totalOddsDecimal: nullableNumber, oddsFormat: nullableEnum(["decimal","fractional","american","unknown"]), placedAt: nullableString, settledAt: nullableString,
    legs: { type: "array", maxItems: 100, items: { type: "object", additionalProperties: false, required: ["position","sport","competition","eventName","market","selection","oddsRaw","oddsDecimal","result"], properties: { position: { type: "integer", minimum: 1 }, sport: nullableString, competition: nullableString, eventName: nullableString, market: nullableString, selection: nullableString, oddsRaw: nullableString, oddsDecimal: nullableNumber, result: { type: "string", enum: ["won","lost","void","push","unknown"] } } } },
    evidence: { type: "object", additionalProperties: false, required: ["stakeText","returnText","statusText","betIdText"], properties: { stakeText: nullableString, returnText: nullableString, statusText: nullableString, betIdText: nullableString } },
  },
};
