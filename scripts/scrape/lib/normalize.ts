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
