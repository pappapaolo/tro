const DOW = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as const;
const MON = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
] as const;

const MON_TITLE = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

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

/** "Through 7 Jun" — short month, year only if it crosses into next year. */
export function formatThrough(endIso: string, now: Date = new Date()): string {
  const d = new Date(endIso);
  const day = d.getUTCDate();
  const mon = MON_TITLE[d.getUTCMonth()];
  const sameYear = d.getUTCFullYear() === now.getUTCFullYear();
  return sameYear
    ? `Through ${day} ${mon}`
    : `Through ${day} ${mon} ${d.getUTCFullYear()}`;
}

/** True if performance has a real multi-day run (end ≥ 24h after start). */
export function isMultiDay(start: string, end?: string): boolean {
  if (!end) return false;
  return new Date(end).getTime() - new Date(start).getTime() >= 24 * 60 * 60 * 1000;
}

/** Lift the first sentence of a description to use as a card subtitle. */
export function firstSentence(text: string | undefined): string | undefined {
  if (!text) return undefined;
  const trimmed = text.trim();
  if (!trimmed) return undefined;
  const m = trimmed.match(/^[^.!?]{1,160}[.!?]/);
  if (m) return m[0].trim();
  return trimmed.length > 120 ? trimmed.slice(0, 120).trimEnd() + "…" : trimmed;
}
