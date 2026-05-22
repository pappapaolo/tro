import * as cheerio from "cheerio";
import { fetchHtml } from "../lib/http";
import {
  type Category,
  type ScrapedEvent,
  absoluteUrl,
  cleanText,
  makeId,
  parseEnglishDate,
  slugify,
} from "../lib/normalize";

const VENUE_SLUG = "teatro-alla-scala";
const VENUE_NAME = "Teatro alla Scala";
const SOURCE_URL =
  "https://www.teatroallascala.org/en/season/2025-2026/index.html";
const BASE = "https://www.teatroallascala.org";

export async function scrape(): Promise<ScrapedEvent[]> {
  const scrapedAt = new Date().toISOString();
  let html: string;
  try {
    html = await fetchHtml(SOURCE_URL, { retries: 1 });
  } catch (err) {
    console.warn(`[scala] fetch failed: ${(err as Error).message}`);
    return [];
  }

  const $ = cheerio.load(html);
  const out: ScrapedEvent[] = [];
  const seen = new Set<string>();

  $("article.card4").each((_, el) => {
    const card = $(el);
    const title = cleanText(card.find(".card__title").first().text());
    const dateText = cleanText(card.find(".card__time").first().text());
    const href = card.find("footer a.btn-link").attr("href");
    if (!title || !dateText || !href) return;

    // Skip touring shows (these aren't at La Scala in Milan)
    if (href.includes("/tournee/")) return;

    const start = parseEnglishDate(dateText);
    if (!start) return;

    const id = makeId(VENUE_SLUG, title, start);
    if (seen.has(id)) return;
    seen.add(id);

    const ticketUrl = absoluteUrl(BASE, href) ?? BASE;
    const img = card.find(".card__figure img").attr("src");
    // La Scala's listing page uses a placeholder image for all cards;
    // detail pages have the real cover. Skip image at the listing layer.
    const image = img && !img.includes("header_1080x1080")
      ? absoluteUrl(BASE, img)
      : undefined;

    out.push({
      id,
      slug: `${slugify(title)}-${id}`,
      title,
      category: categoryFromUrl(href),
      image,
      venueSlug: VENUE_SLUG,
      performances: [{ start }],
      ticketUrl,
      source: { venue: VENUE_NAME, url: SOURCE_URL, scrapedAt },
    });
  });

  console.log(`[scala] ${out.length} events`);
  return out;
}

function categoryFromUrl(href: string): Category {
  if (href.includes("/opera/")) return "opera";
  if (href.includes("/ballet/")) return "ballet";
  if (href.includes("/concerts/")) return "concert";
  return "other";
}
