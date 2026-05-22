import { fetchHtml } from "../lib/http";
import { extractJsonLd, iterEvents } from "../lib/jsonld";
import {
  type ScrapedEvent,
  cleanText,
  inferCategory,
  makeId,
  slugify,
} from "../lib/normalize";

const VENUE_SLUG = "i-pomeriggi-musicali";
const VENUE_NAME = "I Pomeriggi Musicali";
const PAGES = [
  "https://www.ipomeriggi.it/stagione/",
  "https://www.ipomeriggi.it/",
];

export async function scrape(): Promise<ScrapedEvent[]> {
  const scrapedAt = new Date().toISOString();
  const seen = new Set<string>();
  const out: ScrapedEvent[] = [];

  for (const url of PAGES) {
    let html: string;
    try {
      html = await fetchHtml(url, { retries: 1 });
    } catch (err) {
      console.warn(`[ipomeriggi] fetch failed ${url}: ${(err as Error).message}`);
      continue;
    }

    const ld = extractJsonLd(html);
    for (const ev of iterEvents(ld)) {
      const title = cleanText(asString(ev["name"]));
      const startRaw = asString(ev["startDate"]);
      if (!title || !startRaw) continue;
      const start = normalizeDate(startRaw);
      if (!start) continue;

      const id = makeId(VENUE_SLUG, title, start);
      if (seen.has(id)) continue;
      seen.add(id);

      const description = cleanText(asString(ev["description"]));
      const image = pickImage(ev["image"]);
      const ticketUrl = asString(ev["url"]) ?? asString(asObj(ev["offers"])?.url);
      const offer = asObj(ev["offers"]);
      const priceFrom = parseNumber(offer?.["lowPrice"] ?? offer?.["price"]);
      const priceCurrency = asString(offer?.["priceCurrency"]) ?? "EUR";

      out.push({
        id,
        slug: `${slugify(title)}-${id}`,
        title,
        category: inferCategory(title, "concert"),
        description,
        image,
        venueSlug: VENUE_SLUG,
        performances: [{ start }],
        ticketUrl,
        priceFrom,
        priceCurrency: priceFrom != null ? priceCurrency : undefined,
        source: { venue: VENUE_NAME, url, scrapedAt },
      });
    }
  }

  console.log(`[ipomeriggi] ${out.length} events`);
  return out;
}

function asString(v: unknown): string | undefined {
  if (typeof v === "string") return v;
  if (Array.isArray(v) && typeof v[0] === "string") return v[0];
  return undefined;
}

function asObj(v: unknown): Record<string, unknown> | undefined {
  if (v && typeof v === "object" && !Array.isArray(v)) {
    return v as Record<string, unknown>;
  }
  return undefined;
}

function parseNumber(v: unknown): number | undefined {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const n = parseFloat(v.replace(",", "."));
    return isNaN(n) ? undefined : n;
  }
  return undefined;
}

function pickImage(v: unknown): string | undefined {
  if (typeof v === "string") return v;
  if (Array.isArray(v) && v.length) {
    const first = v[0];
    if (typeof first === "string") return first;
    if (first && typeof first === "object") {
      const url = (first as Record<string, unknown>)["url"];
      if (typeof url === "string") return url;
    }
  }
  if (v && typeof v === "object") {
    const url = (v as Record<string, unknown>)["url"];
    if (typeof url === "string") return url;
  }
  return undefined;
}

function normalizeDate(raw: string): string | null {
  const d = new Date(raw);
  if (!isNaN(d.getTime())) return d.toISOString();
  return null;
}
