import type { Event } from "./types";
import { tagLabel, tagsMatchingQuery } from "./tags";

export type WhenFilter = "tonight" | "weekend" | "week" | "month";
export type PriceFilter = "free" | "lt20" | "lt50" | "50plus";

export interface FilterState {
  q?: string;
  cat?: string;
  when?: WhenFilter;
  price?: PriceFilter;
  city?: string;
  venue?: string;
}

export function applyFilters(
  events: Event[],
  state: FilterState,
  venueCity: (slug: string) => string | undefined,
): Event[] {
  const { q, cat, when, price, city, venue } = state;
  const qLower = q?.trim().toLowerCase();
  const now = new Date();
  const range = whenRange(when, now);

  return events.filter((e) => {
    if (cat && e.category !== cat) return false;
    if (venue && e.venueSlug !== venue) return false;
    if (city) {
      const eCity = venueCity(e.venueSlug)?.toLowerCase();
      if (eCity !== city.toLowerCase()) return false;
    }
    if (price && !matchesPrice(e, price)) return false;
    if (range && !matchesRange(e, range)) return false;
    if (qLower && !matchesQuery(e, qLower, venueCity)) return false;
    return true;
  });
}

function matchesPrice(e: Event, filter: PriceFilter): boolean {
  // Events without price data are hidden by any price filter — we can't infer.
  if (e.priceFrom == null) return false;
  switch (filter) {
    case "free":
      return e.priceFrom === 0;
    case "lt20":
      return e.priceFrom < 20;
    case "lt50":
      return e.priceFrom < 50;
    case "50plus":
      return e.priceFrom >= 50;
  }
}

function matchesQuery(
  e: Event,
  q: string,
  venueCity: (slug: string) => string | undefined,
): boolean {
  if (e.title.toLowerCase().includes(q)) return true;
  if (e.subtitle?.toLowerCase().includes(q)) return true;
  if (e.description?.toLowerCase().includes(q)) return true;
  const v = venueCity(e.venueSlug);
  if (v?.toLowerCase().includes(q)) return true;

  // Tag-aware search: typing "commedia" / "classical" / etc. maps to
  // tag slugs and matches events that carry those tags. We check both
  // (a) does the event's own tag list contain a tag whose IT or EN
  // label contains the query, and (b) does the query directly hit a
  // tag definition that the event has.
  if (e.tags && e.tags.length > 0) {
    // Direct label match — fast path for typing the exact tag name.
    for (const slug of e.tags) {
      if (tagLabel(slug, "it").toLowerCase().includes(q)) return true;
      if (tagLabel(slug, "en").toLowerCase().includes(q)) return true;
      if (slug.includes(q)) return true;
    }
    // Fuzzy fallback: query matches a tag definition (e.g. "comedy"
    // → tag with label "Commedia"), and the event carries that tag.
    const matchedTags = tagsMatchingQuery(q);
    if (matchedTags.length > 0) {
      const tagSet = new Set(e.tags);
      if (matchedTags.some((t) => tagSet.has(t.slug))) return true;
    }
  }
  return false;
}

interface DateRange {
  start: number;
  end: number;
}

function whenRange(when: WhenFilter | undefined, now: Date): DateRange | null {
  if (!when) return null;
  const startOfDay = new Date(now);
  startOfDay.setUTCHours(0, 0, 0, 0);

  switch (when) {
    case "tonight": {
      const end = new Date(startOfDay);
      end.setUTCDate(end.getUTCDate() + 1);
      return { start: now.getTime(), end: end.getTime() };
    }
    case "weekend": {
      // Friday 18:00 → Sunday end-of-day (interpret weekend as Fri evening to Sun)
      const dow = startOfDay.getUTCDay(); // 0=Sun
      const daysUntilFriday = (5 - dow + 7) % 7;
      const friday = new Date(startOfDay);
      friday.setUTCDate(startOfDay.getUTCDate() + daysUntilFriday);
      friday.setUTCHours(18, 0, 0, 0);
      const sundayEnd = new Date(friday);
      sundayEnd.setUTCDate(friday.getUTCDate() + 2);
      sundayEnd.setUTCHours(23, 59, 59, 999);
      return { start: Math.max(now.getTime(), friday.getTime()), end: sundayEnd.getTime() };
    }
    case "week": {
      const end = new Date(startOfDay);
      end.setUTCDate(startOfDay.getUTCDate() + 7);
      end.setUTCHours(23, 59, 59, 999);
      return { start: now.getTime(), end: end.getTime() };
    }
    case "month": {
      const end = new Date(startOfDay);
      end.setUTCDate(startOfDay.getUTCDate() + 30);
      end.setUTCHours(23, 59, 59, 999);
      return { start: now.getTime(), end: end.getTime() };
    }
  }
}

function matchesRange(e: Event, range: DateRange): boolean {
  // An event matches if any performance, or its run, overlaps the window.
  return e.performances.some((p) => {
    const start = new Date(p.start).getTime();
    const end = p.end ? new Date(p.end).getTime() : start;
    return end >= range.start && start <= range.end;
  });
}
