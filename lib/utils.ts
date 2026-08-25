export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function isIsoCurrency(code: string) {
  return /^[A-Z]{3}$/.test(code);
}

export function formatMoney(value: number, currency = "GBP", sign = false) {
  const code = currency.trim().toUpperCase();
  const amount = value.toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const prefix = sign && value > 0 ? "+" : "";

  if (!isIsoCurrency(code)) {
    return code ? `${prefix}${amount} ${code}` : `${prefix}${amount}`;
  }

  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency: code,
      signDisplay: sign ? "always" : "auto",
      minimumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${prefix}${amount} ${code}`;
  }
}

export function titleCase(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
