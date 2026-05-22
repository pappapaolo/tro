import { createHash } from "node:crypto";

export type Category =
  | "theater"
  | "opera"
  | "ballet"
  | "dance"
  | "concert"
  | "other";

export interface ScrapedEvent {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  category: Category;
  description?: string;
  image?: string;
  venueSlug: string;
  performances: { start: string; end?: string }[];
  ticketUrl?: string;
  priceFrom?: number;
  priceCurrency?: string;
  source: { venue: string; url: string; scrapedAt: string };
}

export function slugify(s: string): string {
  return s
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function makeId(venueSlug: string, title: string, firstStart: string) {
  return createHash("sha1")
    .update(`${venueSlug}|${title}|${firstStart}`)
    .digest("hex")
    .slice(0, 10);
}

export function inferCategory(
  title: string,
  fallback: Category,
): Category {
  const t = title.toLowerCase();
  if (/\bopera\b|\bopéra\b/.test(t)) return "opera";
  if (/\bbal{1,2}et+o?\b|\bbal{1,2}et+\b/.test(t)) return "ballet";
  if (/\bdanza\b|\bdance\b/.test(t)) return "dance";
  if (/\bconcert(o|i)?\b|\bsinfonic[oa]\b|\bsinfonia\b/.test(t))
    return "concert";
  return fallback;
}

const MONTHS_IT: Record<string, number> = {
  gennaio: 0, gen: 0,
  febbraio: 1, feb: 1,
  marzo: 2, mar: 2,
  aprile: 3, apr: 3,
  maggio: 4, mag: 4,
  giugno: 5, giu: 5,
  luglio: 6, lug: 6,
  agosto: 7, ago: 7,
  settembre: 8, set: 8, sett: 8,
  ottobre: 9, ott: 9,
  novembre: 10, nov: 10,
  dicembre: 11, dic: 11,
};

/** Parse an Italian date like "23 maggio 2026" or "23 mag" optionally with "ore 20.00". */
export function parseItalianDate(text: string, year?: number): string | null {
  const cleaned = text.replace(/\s+/g, " ").trim().toLowerCase();
  const dateRe =
    /(\d{1,2})\s+(gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre|gen|feb|mar|apr|mag|giu|lug|ago|set|sett|ott|nov|dic)\.?\s*(\d{4})?/i;
  const tRe = /(?:ore|h\.?)\s*(\d{1,2})[:.](\d{2})/i;
  const m = cleaned.match(dateRe);
  if (!m) return null;
  const day = parseInt(m[1], 10);
  const month = MONTHS_IT[m[2].toLowerCase()];
  if (month == null) return null;
  const y =
    m[3] != null
      ? parseInt(m[3], 10)
      : year ?? inferYear(month);
  const tm = cleaned.match(tRe);
  const hh = tm ? parseInt(tm[1], 10) : 20;
  const mm = tm ? parseInt(tm[2], 10) : 0;
  const d = new Date(Date.UTC(y, month, day, hh, mm));
  if (isNaN(d.getTime())) return null;
  return d.toISOString();
}

function inferYear(month: number): number {
  const now = new Date();
  const y = now.getUTCFullYear();
  // If month is earlier than current month, assume next year.
  return month < now.getUTCMonth() ? y + 1 : y;
}

/**
 * Same shape as parseItalianRange but returns the END of the range.
 * For single-day inputs ("8 giugno 2026") this returns the same day.
 */
export function parseItalianRangeEnd(text: string): string | null {
  if (!text) return null;
  const cleaned = text.replace(/\s+/g, " ").trim();
  const months = Object.keys(MONTHS_IT).join("|");
  const lastMonthRe = new RegExp(`(${months})(?!.*(${months}))`, "i");
  const monthMatch = cleaned.match(lastMonthRe);
  if (!monthMatch) return null;
  const month = MONTHS_IT[monthMatch[1].toLowerCase()];
  if (month == null) return null;

  const yearMatch = cleaned.match(/(20\d{2})/g);
  const year = yearMatch
    ? parseInt(yearMatch[yearMatch.length - 1], 10)
    : inferYear(month);

  // End day: last 1–2 digit number before that final month name
  const beforeMonth = cleaned.slice(0, monthMatch.index);
  const allDigits = [...beforeMonth.matchAll(/\b(\d{1,2})\b/g)];
  if (!allDigits.length) return null;
  const day = parseInt(allDigits[allDigits.length - 1][1], 10);

  // End-of-day so currently-running shows survive same-day filtering
  const d = new Date(Date.UTC(year, month, day, 23, 59));
  return isNaN(d.getTime()) ? null : d.toISOString();
}

/**
 * Parses an Italian date range like "20 Maggio - 7 Giugno 2026" or
 * "19 - 31 Maggio 2026" or Elfo's "7 / 31 maggio 2026" or a single
 * "8 giugno 2026". Returns the start as an ISO string.
 *
 * Strategy: find the first month name. Take the first 1–2 digit number
 * before that month as the start day. Pull the year from anywhere in
 * the text (defaulting to current/next year). Time defaults to 20:00.
 */
export function parseItalianRange(text: string): string | null {
  if (!text) return null;
  const cleaned = text.replace(/\s+/g, " ").trim();
  const monthRe =
    /(gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)/i;
  const monthMatch = cleaned.match(monthRe);
  if (!monthMatch) return null;
  const month = MONTHS_IT[monthMatch[1].toLowerCase()];
  if (month == null) return null;

  const yearMatch = cleaned.match(/(20\d{2})/);
  const year = yearMatch ? parseInt(yearMatch[1], 10) : inferYear(month);

  const beforeMonth = cleaned.slice(0, monthMatch.index);
  const dayMatch = beforeMonth.match(/\d{1,2}/);
  if (!dayMatch) return null;
  const day = parseInt(dayMatch[0], 10);

  const tMatch = cleaned.match(/(?:ore|h\.?)\s*(\d{1,2})[:.](\d{2})/i);
  const hh = tMatch ? parseInt(tMatch[1], 10) : 20;
  const mm = tMatch ? parseInt(tMatch[2], 10) : 0;

  const d = new Date(Date.UTC(year, month, day, hh, mm));
  return isNaN(d.getTime()) ? null : d.toISOString();
}

const MONTHS_EN: Record<string, number> = {
  january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
  july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
};

/**
 * Parses an English date like "4 December 2025" or a range
 * "From 7 to 30 December 2025" / "From 7 September to 30 December 2025".
 * Returns the start as an ISO string. Time defaults to 20:00.
 */
export function parseEnglishDate(text: string): string | null {
  if (!text) return null;
  const cleaned = text.replace(/\s+/g, " ").trim();

  const monthRe =
    /(january|february|march|april|may|june|july|august|september|october|november|december)/i;
  const monthMatch = cleaned.match(monthRe);
  if (!monthMatch) return null;
  const month = MONTHS_EN[monthMatch[1].toLowerCase()];

  const yearMatch = cleaned.match(/(20\d{2})/);
  const year = yearMatch ? parseInt(yearMatch[1], 10) : inferYear(month);

  let day: number | null = null;
  const fromMatch = cleaned.match(/^\s*from\s+(\d{1,2})\s+to\s+/i);
  if (fromMatch) {
    day = parseInt(fromMatch[1], 10);
  } else {
    const dayMatch = cleaned.match(
      /(\d{1,2})\s+(?:january|february|march|april|may|june|july|august|september|october|november|december)/i,
    );
    if (dayMatch) day = parseInt(dayMatch[1], 10);
  }
  if (day == null) return null;

  const d = new Date(Date.UTC(year, month, day, 20, 0));
  return isNaN(d.getTime()) ? null : d.toISOString();
}

export function cleanText(s: string | undefined | null): string | undefined {
  if (!s) return undefined;
  const t = s.replace(/\s+/g, " ").trim();
  return t.length ? t : undefined;
}

export function absoluteUrl(base: string, href: string | undefined): string | undefined {
  if (!href) return undefined;
  try {
    return new URL(href, base).toString();
  } catch {
    return undefined;
  }
}
