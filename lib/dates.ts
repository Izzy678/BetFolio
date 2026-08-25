import { format, parseISO } from "date-fns";

/** Convert ISO/timestamptz to `YYYY-MM-DD` for `<input type="date">`. */
export function toDateInputValue(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);
  return date.toISOString().slice(0, 10);
}

/** Convert date-only input to a timezone-bearing ISO string (noon UTC). */
export function fromDateInputValue(value: string) {
  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return null;
  return `${trimmed}T12:00:00.000Z`;
}

/**
 * Parse slip dates from AI/OCR. Keeps month/day, forces the year to the current
 * calendar year — models often misread years (e.g. 2022) when the slip only
 * shows day/month clearly.
 */
export function parseFlexibleDate(value: unknown, now = new Date()): string | null {
  if (typeof value !== "string") return null;
  const raw = value.trim();
  if (!raw) return null;

  let date: Date | null = null;
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
    date = new Date(`${raw.slice(0, 10)}T12:00:00.000Z`);
  } else {
    const parsed = Date.parse(raw);
    if (!Number.isNaN(parsed)) date = new Date(parsed);
  }
  if (!date || Number.isNaN(date.getTime())) return null;

  const year = now.getUTCFullYear();
  date.setUTCFullYear(year);
  // Keep noon UTC so date-only values don't shift by timezone.
  date.setUTCHours(12, 0, 0, 0);
  return date.toISOString();
}

/** Stable display date — same on server and client (avoids hydration mismatch). */
export function formatDisplayDate(value: string | null | undefined, pattern = "d MMM yyyy") {
  if (!value) return "—";
  try {
    const date = value.length <= 10 ? parseISO(`${value.slice(0, 10)}T12:00:00`) : parseISO(value);
    if (Number.isNaN(date.getTime())) return "—";
    return format(date, pattern);
  } catch {
    return "—";
  }
}
