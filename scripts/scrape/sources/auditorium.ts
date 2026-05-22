import * as cheerio from "cheerio";
import { fetchHtml } from "../lib/http";
import {
  type ScrapedEvent,
  absoluteUrl,
  cleanText,
  inferCategory,
  makeId,
  parseItalianRange,
  slugify,
} from "../lib/normalize";

const VENUE_SLUG = "auditorium-parco-della-musica";
const VENUE_NAME = "Auditorium Parco della Musica";
const SOURCE_URL = "https://www.auditorium.com/it/eventi/";
const BASE = "https://www.auditorium.com";

export async function scrape(): Promise<ScrapedEvent[]> {
  const scrapedAt = new Date().toISOString();
  let html: string;
  try {
    html = await fetchHtml(SOURCE_URL, { retries: 1 });
  } catch (err) {
    console.warn(`[auditorium] fetch failed: ${(err as Error).message}`);
    return [];
  }

  const $ = cheerio.load(html);
  const out: ScrapedEvent[] = [];
  const seen = new Set<string>();

  $(".event-card").each((_, el) => {
    const card = $(el);
    const title = cleanText(card.find(".text-card-title").first().text());
    if (!title) return;

    const dateText = cleanText(card.find(".event-info-flex").first().text());
    if (!dateText) return;
    const start = parseItalianRange(dateText);
    if (!start) return;

    const id = makeId(VENUE_SLUG, title, start);
    if (seen.has(id)) return;
    seen.add(id);

    const festLabel = cleanText(
      card.find(".event-card-descr-label").first().text(),
    );
    const genreLabel = cleanText(card.find(".text-label").first().text());

    // Image: prefer the noscript srcset which has the real URL; fall back to data-srcset.
    let image: string | undefined;
    const noscript = card.find("noscript").first().html();
    if (noscript) {
      const m = noscript.match(/srcset="([^"]+)"/i);
      if (m) image = m[1].split(",")[0].trim().split(" ")[0];
    }
    if (!image) {
      const lazy = card.find("img.lazyload").first();
      const dsrc = lazy.attr("data-srcset") ?? lazy.attr("data-src");
      if (dsrc) image = dsrc.split(",")[0].trim().split(" ")[0];
    }
    image = image ? absoluteUrl(BASE, image) : undefined;

    const ticketHref = card.find(".event-ticket-link").attr("href");
    const detailHref = card.find(".apm-card-link").attr("href");
    const ticketUrl =
      absoluteUrl(BASE, ticketHref) ?? absoluteUrl(BASE, detailHref) ?? BASE;

    out.push({
      id,
      slug: `${slugify(title)}-${id}`,
      title,
      subtitle: festLabel,
      category: inferCategory(`${title} ${genreLabel ?? ""}`, "concert"),
      description: genreLabel ? `${genreLabel}.` : undefined,
      image,
      venueSlug: VENUE_SLUG,
      performances: [{ start }],
      ticketUrl,
      source: { venue: VENUE_NAME, url: SOURCE_URL, scrapedAt },
    });
  });

  console.log(`[auditorium] ${out.length} events`);
  return out;
}
