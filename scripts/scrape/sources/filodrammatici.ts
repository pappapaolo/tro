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

const VENUE_SLUG = "teatro-filodrammatici";
const VENUE_NAME = "Teatro Filodrammatici";
const SOURCE_URL = "https://www.teatrofilodrammatici.eu/";
const BASE = "https://www.teatrofilodrammatici.eu";

export async function scrape(): Promise<ScrapedEvent[]> {
  const scrapedAt = new Date().toISOString();
  let html: string;
  try {
    html = await fetchHtml(SOURCE_URL, { retries: 1 });
  } catch (err) {
    console.warn(`[filodrammatici] fetch failed: ${(err as Error).message}`);
    return [];
  }

  const $ = cheerio.load(html);
  const out: ScrapedEvent[] = [];
  const seen = new Set<string>();

  interface Card {
    title: string;
    ticketUrl: string;
    start: string;
    end?: string;
    image?: string;
  }
  const cards: Card[] = [];

  $(".spettacoli-card").each((_, el) => {
    const card = $(el);
    const title = cleanText(card.find("h5 a").first().text());
    if (!title) return;
    const link = card.find("h5 a").attr("href");
    const ticketUrl = absoluteUrl(BASE, link) ?? SOURCE_URL;

    const dateText = cleanText(card.find("p").first().text());
    const start = dateText ? parseItalianRange(dateText) : null;
    if (!start) return;
    const end = dateText ? parseItalianRangeEnd(dateText) ?? undefined : undefined;

    // image is in CSS background-image
    const bgStyle = card.find(".image-container a").attr("style") ?? "";
    const imgMatch = bgStyle.match(/url\(['"]?([^'")\s]+)['"]?\)/);
    const image = imgMatch ? absoluteUrl(BASE, imgMatch[1]) : undefined;

    cards.push({ title, ticketUrl, start, end, image });
  });

  for (const card of cards) {
    const id = makeId(VENUE_SLUG, card.title, card.start);
    if (seen.has(id)) continue;
    seen.add(id);

    // Detail page exposes a meta description with the show synopsis.
    let description: string | undefined;
    if (card.ticketUrl !== SOURCE_URL) {
      try {
        const detail = await fetchHtml(card.ticketUrl, {
          retries: 1,
          timeoutMs: 10000,
        });
        const d$ = cheerio.load(detail);
        const meta =
          cleanText(d$('meta[name="description"]').attr("content")) ??
          cleanText(d$('meta[property="og:description"]').attr("content"));
        if (meta && meta.length > 60) description = meta;
      } catch {
        // Detail fetch failed; skip description.
      }
    }

    out.push({
      id,
      slug: `${slugify(card.title)}-${id}`,
      title: card.title,
      category: inferCategory(card.title, "theater"),
      description,
      image: card.image,
      venueSlug: VENUE_SLUG,
      performances: [{ start: card.start, end: card.end }],
      ticketUrl: card.ticketUrl,
      source: { venue: VENUE_NAME, url: SOURCE_URL, scrapedAt },
    });
  }

  console.log(`[filodrammatici] ${out.length} events`);
  return out;
}
