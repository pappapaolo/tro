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

// ─────────────────────────────────────────────────────────────────────────
// Locale-aware date/time helpers for the showtimes UI.
// We render performance dates in three places (card, detail page, calendar
// grouped view) — keeping the formatting in one place so they stay in
// sync across English and Italian.
// ─────────────────────────────────────────────────────────────────────────

const DOW_LONG_EN = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
] as const;
const DOW_LONG_IT = [
  "Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato",
] as const;
const DOW_SHORT_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const DOW_SHORT_IT = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"] as const;
const MON_LONG_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;
const MON_LONG_IT = [
  "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
  "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre",
] as const;
const MON_SHORT_EN = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;
const MON_SHORT_IT = [
  "Gen", "Feb", "Mar", "Apr", "Mag", "Giu",
  "Lug", "Ago", "Set", "Ott", "Nov", "Dic",
] as const;

export type ShortLocale = "en" | "it";

/** "Mon 7 Nov · 20:00" (en) / "Lun 7 nov · 20:00" (it) — for compact rows. */
export function formatPerfShort(iso: string, locale: ShortLocale = "en"): string {
  const d = new Date(iso);
  const dow = (locale === "it" ? DOW_SHORT_IT : DOW_SHORT_EN)[d.getUTCDay()];
  const day = d.getUTCDate();
  const mon = (locale === "it" ? MON_SHORT_IT : MON_SHORT_EN)[d.getUTCMonth()];
  const time = formatTimeOnly(iso);
  return time ? `${dow} ${day} ${mon} · ${time}` : `${dow} ${day} ${mon}`;
}

/** "Monday 7 November · 20:00" — for the detail page list rows. */
export function formatPerfLong(iso: string, locale: ShortLocale = "en"): string {
  const d = new Date(iso);
  const dow = (locale === "it" ? DOW_LONG_IT : DOW_LONG_EN)[d.getUTCDay()];
  const day = d.getUTCDate();
  const mon = (locale === "it" ? MON_LONG_IT : MON_LONG_EN)[d.getUTCMonth()];
  const time = formatTimeOnly(iso);
  return time ? `${dow} ${day} ${mon} · ${time}` : `${dow} ${day} ${mon}`;
}

/** "November 2026" / "Novembre 2026" — group heading. */
export function formatMonthYear(iso: string, locale: ShortLocale = "en"): string {
  const d = new Date(iso);
  const mon = (locale === "it" ? MON_LONG_IT : MON_LONG_EN)[d.getUTCMonth()];
  return `${mon} ${d.getUTCFullYear()}`;
}

/** "20:00" — or empty when the perf was scheduled at midnight (no time set). */
export function formatTimeOnly(iso: string): string {
  const d = new Date(iso);
  const hh = d.getUTCHours().toString().padStart(2, "0");
  const mm = d.getUTCMinutes().toString().padStart(2, "0");
  if (hh === "00" && mm === "00") return "";
  return `${hh}:${mm}`;
}

/**
 * Group an ordered list of ISO timestamps by month-year, in input order.
 * Used by the detail-page calendar view so we can render an
 * "October 2026" / "November 2026" heading above each cluster of dates.
 */
export function groupByMonth<T extends { start: string }>(
  performances: T[],
  locale: ShortLocale = "en",
): { label: string; performances: T[] }[] {
  const map = new Map<string, { label: string; performances: T[] }>();
  for (const p of performances) {
    const d = new Date(p.start);
    const key = `${d.getUTCFullYear()}-${d.getUTCMonth()}`;
    if (!map.has(key)) {
      map.set(key, { label: formatMonthYear(p.start, locale), performances: [] });
    }
    map.get(key)!.performances.push(p);
  }
  return [...map.values()];
}
