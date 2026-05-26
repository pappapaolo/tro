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

/**
 * The listing page returns a placeholder for every cover. The detail
 * page has the real og:image. Following each detail adds ~90 fetches
 * per scrape — acceptable given the CI cadence (daily).
 */
const FOLLOW_DETAIL_PAGES = true;

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

  const cards: { title: string; dateText: string; href: string }[] = [];
  $("article.card4").each((_, el) => {
    const card = $(el);
    const title = cleanText(card.find(".card__title").first().text());
    const dateText = cleanText(card.find(".card__time").first().text());
    const href = card.find("footer a.btn-link").attr("href");
    if (!title || !dateText || !href) return;
    if (href.includes("/tournee/")) return;
    cards.push({ title, dateText, href });
  });

  for (const card of cards) {
    const start = parseEnglishDate(card.dateText);
    if (!start) continue;

    const id = makeId(VENUE_SLUG, card.title, start);
    if (seen.has(id)) continue;
    seen.add(id);

    const ticketUrl = absoluteUrl(BASE, card.href) ?? BASE;
    let image: string | undefined;

    if (FOLLOW_DETAIL_PAGES) {
      try {
        const detail = await fetchHtml(ticketUrl, { retries: 1, timeoutMs: 12000 });
        const d$ = cheerio.load(detail);
        const og = cleanText(d$('meta[property="og:image"]').attr("content"));
        // Skip the same placeholder when it leaks through.
        if (og && !og.includes("header_1080x1080")) {
          image = absoluteUrl(BASE, og);
        }
      } catch {
        // Detail fetch failures fall through to no-image; the card will
        // render the category illustration as a fallback.
      }
    }

    out.push({
      id,
      slug: `${slugify(card.title)}-${id}`,
      title: card.title,
      category: categoryFromUrl(card.href),
      image,
      venueSlug: VENUE_SLUG,
      performances: [{ start }],
      ticketUrl,
      source: { venue: VENUE_NAME, url: SOURCE_URL, scrapedAt },
    });
  }

  console.log(`[scala] ${out.length} events`);
  return out;
}

function categoryFromUrl(href: string): Category {
  if (href.includes("/opera/")) return "opera";
  if (href.includes("/ballet/")) return "ballet";
  if (href.includes("/concerts/")) return "concert";
  return "other";
}
