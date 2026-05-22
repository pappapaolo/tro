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

const VENUE_SLUG = "teatro-elfo-puccini";
const VENUE_NAME = "Teatro Elfo Puccini";
const SOURCE_URL = "https://www.elfo.org/rassegne/tutti-gli-spettacoli.htm";
const BASE = "https://www.elfo.org";

export async function scrape(): Promise<ScrapedEvent[]> {
  const scrapedAt = new Date().toISOString();
  let html: string;
  try {
    html = await fetchHtml(SOURCE_URL, { retries: 1 });
  } catch (err) {
    console.warn(`[elfo] fetch failed: ${(err as Error).message}`);
    return [];
  }

  const $ = cheerio.load(html);
  const out: ScrapedEvent[] = [];
  const seen = new Set<string>();

  $(".Blocks").each((_, el) => {
    const block = $(el);
    const title = cleanText(block.find(".Titolo").first().text());
    if (!title) return;

    // Elfo splits date metadata across <br>s within .Date — replace them with " · "
    const dateHtml = block.find(".Date").first().html() ?? "";
    const dateText = cleanText(
      cheerio
        .load(`<div>${dateHtml.replace(/<br\s*\/?>/gi, " · ")}</div>`)("div")
        .text(),
    );
    if (!dateText) return;

    const start = parseItalianRange(dateText);
    if (!start) return;
    const end = parseItalianRangeEnd(dateText) ?? undefined;

    const id = makeId(VENUE_SLUG, title, start);
    if (seen.has(id)) return;
    seen.add(id);

    const subtitle = cleanText(block.find(".Sottotitolo").first().text());
    const cast = cleanText(block.find(".Attori").first().text());
    const link = block.find("a.MainLink").attr("href");
    const ticketUrl = absoluteUrl(BASE, link) ?? BASE;
    const image = absoluteUrl(BASE, block.find("img").first().attr("src"));

    out.push({
      id,
      slug: `${slugify(title)}-${id}`,
      title,
      subtitle,
      category: inferCategory(`${title} ${subtitle ?? ""}`, "theater"),
      description: cast ? `Con ${cast}.` : undefined,
      image,
      venueSlug: VENUE_SLUG,
      performances: [{ start, end }],
      ticketUrl,
      source: { venue: VENUE_NAME, url: SOURCE_URL, scrapedAt },
    });
  });

  console.log(`[elfo] ${out.length} events`);
  return out;
}
