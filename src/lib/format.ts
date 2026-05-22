const DOW = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MON = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

export function formatDateBadge(iso: string): string {
  const d = new Date(iso);
  const dow = DOW[d.getUTCDay()];
  const day = d.getUTCDate();
  const mon = MON[d.getUTCMonth()];
  const hh = d.getUTCHours().toString().padStart(2, "0");
  const mm = d.getUTCMinutes().toString().padStart(2, "0");
  const hasTime = !(hh === "00" && mm === "00");
  return hasTime
    ? `${dow} ${day} ${mon} · ${hh}:${mm}`
    : `${dow} ${day} ${mon}`;
}

export function formatDateLong(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
}

export function formatPrice(from?: number, currency = "EUR"): string | null {
  if (from == null) return null;
  const symbol = currency === "EUR" ? "€" : currency;
  return `from ${symbol}${from.toFixed(0)}`;
}
