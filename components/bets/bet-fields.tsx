"use client";

import { Field, Input, Select } from "@/components/ui/field";
import { DatePicker } from "@/components/ui/date-picker";
import { toDateInputValue } from "@/lib/dates";
import { extractionBetTypes, extractionStatuses, type BetslipExtraction } from "@/lib/gemini/schema";
import { titleCase } from "@/lib/utils";

const COMMON_CURRENCIES = ["NGN", "GBP", "USD", "EUR", "KES", "GHS", "ZAR", "CAD", "AUD"] as const;

export function BetFields({
  form,
  onChange,
  warningFields,
}: {
  form: BetslipExtraction;
  onChange: <K extends keyof BetslipExtraction>(key: K, value: BetslipExtraction[K]) => void;
  warningFields?: Set<string>;
}) {
  const warnings = warningFields ?? new Set<string>();
  const currency = form.currency?.toUpperCase() ?? "";
  const currencyOptions = currency && !(COMMON_CURRENCIES as readonly string[]).includes(currency)
    ? [currency, ...COMMON_CURRENCIES]
    : [...COMMON_CURRENCIES];

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Field label="Bookmaker" error={warnings.has("bookmakerName") ? "Confirm this field" : undefined}>
        <Input value={form.bookmakerName ?? ""} onChange={(e) => onChange("bookmakerName", e.target.value || null)} placeholder="SportyBet" />
      </Field>
      <Field label="Bet type">
        <Select value={form.betType ?? "single"} onChange={(e) => onChange("betType", e.target.value as BetslipExtraction["betType"])}>
          {extractionBetTypes.map((value) => <option key={value} value={value}>{titleCase(value)}</option>)}
        </Select>
      </Field>
      <Field label="Result" error={warnings.has("status") ? "Confirm this field" : undefined}>
        <Select value={form.status ?? ""} onChange={(e) => onChange("status", e.target.value as BetslipExtraction["status"])}>
          <option value="">Choose result</option>
          {extractionStatuses.map((value) => <option key={value} value={value}>{titleCase(value)}</option>)}
        </Select>
      </Field>
      <Field label="Stake" error={warnings.has("stake") ? "Stake is required" : undefined}>
        <Input type="number" min="0" step="0.01" value={form.stake ?? ""} onChange={(e) => onChange("stake", e.target.value === "" ? null : Number(e.target.value))} />
      </Field>
      <Field
        label={form.status === "cashout" ? "Cashout amount" : form.status === "won" ? "Amount won" : "Return amount"}
        error={warnings.has("returnAmount") ? "Return is required for this result" : undefined}
      >
        <Input
          type="number"
          min="0"
          step="0.01"
          value={form.returnAmount ?? ""}
          onChange={(e) => onChange("returnAmount", e.target.value === "" ? null : Number(e.target.value))}
          disabled={form.status === "lost" || form.status === "pending"}
        />
      </Field>
      <Field label="Currency" error={warnings.has("currency") ? "Currency is required" : undefined}>
        <Select value={currency} onChange={(e) => onChange("currency", e.target.value || null)}>
          <option value="">Choose currency</option>
          {currencyOptions.map((value) => <option key={value} value={value}>{value}</option>)}
        </Select>
      </Field>
      <Field label="Total odds (decimal)">
        <Input type="number" min="0" step="0.001" value={form.totalOdds ?? ""} onChange={(e) => onChange("totalOdds", e.target.value === "" ? null : Number(e.target.value))} placeholder="17.18" />
      </Field>
      <Field label="Placed on" error={warnings.has("placedAt") ? "Placement date is required" : undefined}>
        <DatePicker value={toDateInputValue(form.placedAt)} onChange={(value) => onChange("placedAt", value || null)} aria-label="Placed on" />
      </Field>
      <Field label="Settled on">
        <DatePicker value={toDateInputValue(form.settledAt)} onChange={(value) => onChange("settledAt", value || null)} disabled={form.status === "pending"} aria-label="Settled on" />
      </Field>
    </div>
  );
}

export const emptyBetForm: BetslipExtraction = {
  bookmakerName: null,
  betType: "single",
  status: null,
  currency: null,
  stake: null,
  returnAmount: null,
  totalOdds: null,
  placedAt: null,
  settledAt: null,
};
