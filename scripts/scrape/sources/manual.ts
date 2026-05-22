import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  type ScrapedEvent,
  makeId,
  slugify,
} from "../lib/normalize";

const here = dirname(fileURLToPath(import.meta.url));
const FILE = join(here, "manual-events.json");

/**
 * Hand-curated supplementary events for venues we haven't scraped yet.
 * Useful while we wire up more parsers. Edit `manual-events.json` to add or remove.
 */
export async function scrape(): Promise<ScrapedEvent[]> {
  let raw: string;
  try {
    raw = await readFile(FILE, "utf8");
  } catch {
    return [];
  }
  const items = JSON.parse(raw) as Partial<ScrapedEvent>[];
  const scrapedAt = new Date().toISOString();
  const out: ScrapedEvent[] = [];
  for (const item of items) {
    if (!item.title || !item.venueSlug || !item.performances?.length) continue;
    const start = item.performances[0].start;
    const id = item.id ?? makeId(item.venueSlug, item.title, start);
    out.push({
      id,
      slug: item.slug ?? `${slugify(item.title)}-${id}`,
      title: item.title,
      subtitle: item.subtitle,
      category: item.category ?? "theater",
      description: item.description,
      image: item.image,
      venueSlug: item.venueSlug,
      performances: item.performances,
      ticketUrl: item.ticketUrl,
      priceFrom: item.priceFrom,
      priceCurrency: item.priceCurrency,
      source: item.source ?? {
        venue: item.venueSlug,
        url: item.ticketUrl ?? "",
        scrapedAt,
      },
    });
  }
  console.log(`[manual] ${out.length} events`);
  return out;
}
