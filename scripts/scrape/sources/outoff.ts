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

const VENUE_SLUG = "teatro-out-off";
const VENUE_NAME = "Teatro Out Off";
const SOURCE_URL = "https://teatrooutoff.it/stagione-2025-2026/";
const BASE = "https://teatrooutoff.it";

export async function scrape(): Promise<ScrapedEvent[]> {
  const scrapedAt = new Date().toISOString();
  let html: string;
  try {
    html = await fetchHtml(SOURCE_URL, { retries: 1 });
  } catch (err) {
    console.warn(`[outoff] fetch failed: ${(err as Error).message}`);
    return [];
  }

  const $ = cheerio.load(html);
  const urls = new Set<string>();
  $("a[href*='/spettacoli/']").each((_, el) => {
    const h = $(el).attr("href");
    if (!h) return;
    const abs = absoluteUrl(BASE, h);
    if (abs && /\/spettacoli\/[a-z0-9-]+\/?$/.test(abs)) urls.add(abs);
  });

  const out: ScrapedEvent[] = [];
  const seen = new Set<string>();

  for (const url of urls) {
    let detail: string;
    try {
      detail = await fetchHtml(url, { retries: 1 });
    } catch (err) {
      console.warn(`[outoff] detail failed ${url}: ${(err as Error).message}`);
      continue;
    }
    const d$ = cheerio.load(detail);
    const ogTitle = cleanText(d$('meta[property="og:title"]').attr("content"));
    if (!ogTitle) continue;
    const title = ogTitle.replace(/\s*[-–—]\s*Teatro\s+Out\s+Off\s*$/i, "").trim();
    if (!title) continue;

    const description = cleanText(
      d$('meta[property="og:description"]').attr("content"),
    );
    const image = cleanText(d$('meta[property="og:image"]').attr("content"));

    const text = d$("body").text().replace(/\s+/g, " ");
    const dateMatch = text.match(
      /\d{1,2}\s+(?:gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)\s+\d{4}/i,
    );
    if (!dateMatch) continue;
    const start = parseItalianRange(dateMatch[0]);
    if (!start) continue;

    const id = makeId(VENUE_SLUG, title, start);
    if (seen.has(id)) continue;
    seen.add(id);

    out.push({
      id,
      slug: `${slugify(title)}-${id}`,
      title,
      category: inferCategory(title, "theater"),
      description,
      image,
      venueSlug: VENUE_SLUG,
      performances: [{ start }],
      ticketUrl: url,
      source: { venue: VENUE_NAME, url: SOURCE_URL, scrapedAt },
    });
  }

  console.log(`[outoff] ${out.length} events`);
  return out;
}
