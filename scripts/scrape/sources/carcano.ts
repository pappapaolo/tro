import * as cheerio from "cheerio";
import { fetchHtml } from "../lib/http";
import {
  type ScrapedEvent,
  absoluteUrl,
  cleanText,
  inferCategory,
  makeId,
  parseItalianRange,
  parseItalianRangeEnd,
  slugify,
} from "../lib/normalize";

const VENUE_SLUG = "teatro-carcano";
const VENUE_NAME = "Teatro Carcano";
const BASE = "https://teatrocarcano.com";
/**
 * Both seasons because Carcano flips over in summer — current season
 * (25-26) is winding down + next season (26-27) is publishing.
 */
const PAGES = [
  `${BASE}/rassegne/stagione-25-26.htm`,
  `${BASE}/rassegne/stagione-26-27.htm`,
];

export async function scrape(): Promise<ScrapedEvent[]> {
  const scrapedAt = new Date().toISOString();
  const out: ScrapedEvent[] = [];
  const seen = new Set<string>();

  for (const url of PAGES) {
    let html: string;
    try {
      html = await fetchHtml(url, { retries: 1 });
    } catch (err) {
      console.warn(`[carcano] fetch failed ${url}: ${(err as Error).message}`);
      continue;
    }

    const $ = cheerio.load(html);
    $(".single-spectacle-box").each((_, el) => {
      const box = $(el);
      // .Passed is Carcano's "already happened" flag
      if (box.hasClass("Passed")) return;

      const title = cleanText(box.find(".spec-title").first().text());
      if (!title) return;

      const dateText = cleanText(box.find(".date").first().text());
      const start = dateText ? parseItalianRange(dateText) : null;
      if (!start) return;
      const end = dateText ? parseItalianRangeEnd(dateText) ?? undefined : undefined;

      const id = makeId(VENUE_SLUG, title, start);
      if (seen.has(id)) return;
      seen.add(id);

      const link = box.find("a[href]").attr("href");
      const ticketUrl = absoluteUrl(BASE, link) ?? url;
      const image = absoluteUrl(BASE, box.find("img.spec-img").attr("src"));
      const subtitle = cleanText(box.find(".director").first().text());
      const description = cleanText(box.find(".short-desc").first().text());

      out.push({
        id,
        slug: `${slugify(title)}-${id}`,
        title,
        subtitle,
        category: inferCategory(`${title} ${subtitle ?? ""}`, "theater"),
        description,
        image,
        venueSlug: VENUE_SLUG,
        performances: [{ start, end }],
        ticketUrl,
        source: { venue: VENUE_NAME, url, scrapedAt },
      });
    });
  }

  console.log(`[carcano] ${out.length} events`);
  return out;
}
