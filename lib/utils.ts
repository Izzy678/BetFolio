export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatMoney(value: number, currency = "GBP", sign = false) {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    signDisplay: sign ? "always" : "auto",
    minimumFractionDigits: 2,
  }).format(value);
}

export function titleCase(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
