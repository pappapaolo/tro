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

  // Two-phase: scrape the listing for cards, then follow each detail
  // page for the long synopsis. Elfo's listing has the dates and image
  // but only the cast as description — the proper write-up lives on
  // /spettacoli/.../<slug>.htm in .TabsPagesContent blocks.
  interface Card {
    title: string;
    subtitle?: string;
    cast?: string;
    start: string;
    end?: string;
    image?: string;
    ticketUrl: string;
  }
  const cards: Card[] = [];

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

    const subtitle = cleanText(block.find(".Sottotitolo").first().text());
    const cast = cleanText(block.find(".Attori").first().text());
    const link = block.find("a.MainLink").attr("href");
    const ticketUrl = absoluteUrl(BASE, link) ?? BASE;
    const image = absoluteUrl(BASE, block.find("img").first().attr("src"));

    cards.push({ title, subtitle, cast, start, end, image, ticketUrl });
  });

  for (const card of cards) {
    const id = makeId(VENUE_SLUG, card.title, card.start);
    if (seen.has(id)) continue;
    seen.add(id);

    let description: string | undefined;
    if (card.ticketUrl !== BASE) {
      try {
        const detail = await fetchHtml(card.ticketUrl, {
          retries: 1,
          timeoutMs: 12000,
        });
        const d$ = cheerio.load(detail);
        // .TabsPagesContent holds the synopsis (and other tabs like
        // notes, reviews). The longest is the show write-up.
        let longest = "";
        d$(".TabsPagesContent").each((_, el) => {
          const text = d$(el).text().replace(/\s+/g, " ").trim();
          if (text.length > longest.length) longest = text;
        });
        if (longest.length > 80) description = longest.slice(0, 1500);
      } catch {
        // Detail fetch failed; fall back to cast-only.
      }
    }
    // Cast adds context after the synopsis when both are available;
    // when there's no synopsis, the cast line stands on its own
    // (keeps current behaviour for shows where the detail page fails).
    if (card.cast) {
      description = description
        ? `${description}\n\nCon ${card.cast}.`
        : `Con ${card.cast}.`;
    }

    out.push({
      id,
      slug: `${slugify(card.title)}-${id}`,
      title: card.title,
      subtitle: card.subtitle,
      category: inferCategory(
        `${card.title} ${card.subtitle ?? ""}`,
        "theater",
      ),
      description,
      image: card.image,
      venueSlug: VENUE_SLUG,
      performances: [{ start: card.start, end: card.end }],
      ticketUrl: card.ticketUrl,
      source: { venue: VENUE_NAME, url: SOURCE_URL, scrapedAt },
    });
  }

  const withDesc = out.filter((e) => e.description && e.description.length > 80).length;
  console.log(`[elfo] ${out.length} events (${withDesc} with description)`);
  return out;
}
