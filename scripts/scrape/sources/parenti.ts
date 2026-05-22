import * as cheerio from "cheerio";
import { fetchHtml } from "../lib/http";
import {
  type ScrapedEvent,
  type Category,
  absoluteUrl,
  cleanText,
  inferCategory,
  makeId,
  parseItalianRange,
  parseItalianRangeEnd,
  slugify,
} from "../lib/normalize";

const VENUE_SLUG = "teatro-franco-parenti";
const VENUE_NAME = "Teatro Franco Parenti";
const SOURCE_URL = "https://www.teatrofrancoparenti.it/";

export async function scrape(): Promise<ScrapedEvent[]> {
  const scrapedAt = new Date().toISOString();
  let html: string;
  try {
    html = await fetchHtml(SOURCE_URL, { retries: 1 });
  } catch (err) {
    console.warn(`[parenti] fetch failed: ${(err as Error).message}`);
    return [];
  }

  const $ = cheerio.load(html);
  const out: ScrapedEvent[] = [];
  const seen = new Set<string>();

  $(".mosaic-tile").each((_, el) => {
    const tile = $(el);
    const title = cleanText(tile.find("h2").first().text());
    if (!title) return;

    const categoryText = cleanText(tile.find("p.as-h6").first().text());
    const paragraphs = tile.find(".mosaic-tile-content p").toArray();
    // paragraphs: [as-h6 category, description, date range]
    const descRaw =
      paragraphs.length >= 2 ? cleanText($(paragraphs[1]).text()) : undefined;
    const dateRaw =
      paragraphs.length >= 3 ? cleanText($(paragraphs[2]).text()) : undefined;
    const image = absoluteUrl(SOURCE_URL, tile.find("img").attr("src"));
    const link = tile.find("a.absl").attr("href");
    const ticketUrl = absoluteUrl(SOURCE_URL, link) ?? SOURCE_URL;

    const start = parseItalianRange(dateRaw ?? "");
    if (!start) return; // skip tiles without parseable dates (e.g. "Stagione 25/26")
    const end = parseItalianRangeEnd(dateRaw ?? "") ?? undefined;

    const id = makeId(VENUE_SLUG, title, start);
    if (seen.has(id)) return;
    seen.add(id);

    const category: Category = inferCategory(
      `${title} ${categoryText ?? ""}`,
      mapCategory(categoryText),
    );

    out.push({
      id,
      slug: `${slugify(title)}-${id}`,
      title,
      category,
      description: descRaw,
      image,
      venueSlug: VENUE_SLUG,
      performances: [{ start, end }],
      ticketUrl,
      source: { venue: VENUE_NAME, url: SOURCE_URL, scrapedAt },
    });
  });

  console.log(`[parenti] ${out.length} events`);
  return out;
}

function mapCategory(text: string | undefined): Category {
  if (!text) return "theater";
  const t = text.toLowerCase();
  if (t.includes("opera")) return "opera";
  if (t.includes("danza")) return "dance";
  if (t.includes("ballet")) return "ballet";
  if (t.includes("concert") || t.includes("music")) return "concert";
  return "theater";
}
