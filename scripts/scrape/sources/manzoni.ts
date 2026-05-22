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

const VENUE_SLUG = "teatro-manzoni";
const VENUE_NAME = "Teatro Manzoni";
const SOURCE_URL = "https://www.teatromanzoni.it/";
const BASE = "https://www.teatromanzoni.it";

export async function scrape(): Promise<ScrapedEvent[]> {
  const scrapedAt = new Date().toISOString();
  let html: string;
  try {
    html = await fetchHtml(SOURCE_URL, { retries: 1 });
  } catch (err) {
    console.warn(`[manzoni] fetch failed: ${(err as Error).message}`);
    return [];
  }

  const $ = cheerio.load(html);
  const eventLinks = new Set<string>();
  $('a[href*="/eventi/"]').each((_, el) => {
    const href = $(el).attr("href")?.trim();
    if (!href) return;
    const abs = absoluteUrl(BASE, href);
    if (abs && /\/eventi\/[a-z0-9-]+\/?$/i.test(abs)) eventLinks.add(abs);
  });

  const out: ScrapedEvent[] = [];
  const seen = new Set<string>();

  for (const url of eventLinks) {
    let detail: string;
    try {
      detail = await fetchHtml(url, { retries: 1 });
    } catch (err) {
      console.warn(`[manzoni] detail fetch failed ${url}: ${(err as Error).message}`);
      continue;
    }
    const d$ = cheerio.load(detail);
    const title =
      cleanText(d$('meta[property="og:title"]').attr("content")) ??
      cleanText(d$("h1").first().text());
    if (!title) continue;
    // Strip "- Teatro Manzoni" suffix when present.
    const cleanTitle = title.replace(/\s*[-–—]\s*Teatro Manzoni\s*$/i, "").trim();

    const description = cleanText(
      d$('meta[property="og:description"]').attr("content"),
    );
    const image = cleanText(d$('meta[property="og:image"]').attr("content"));

    // Search the body for the first Italian date.
    const bodyText = d$("body").text();
    const dateChunk = bodyText.match(
      /\d{1,2}\s+(?:gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)\s+\d{4}/i,
    );
    if (!dateChunk) continue;
    const start = parseItalianRange(dateChunk[0]);
    if (!start) continue;

    const id = makeId(VENUE_SLUG, cleanTitle, start);
    if (seen.has(id)) continue;
    seen.add(id);

    out.push({
      id,
      slug: `${slugify(cleanTitle)}-${id}`,
      title: cleanTitle,
      category: inferCategory(cleanTitle, "theater"),
      description,
      image,
      venueSlug: VENUE_SLUG,
      performances: [{ start }],
      ticketUrl: url,
      source: { venue: VENUE_NAME, url: SOURCE_URL, scrapedAt },
    });
  }

  console.log(`[manzoni] ${out.length} events`);
  return out;
}
