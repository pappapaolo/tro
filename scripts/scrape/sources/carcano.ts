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

const MONTHS_IT: Record<string, number> = {
  gen: 0, feb: 1, mar: 2, apr: 3, mag: 4, giu: 5,
  lug: 6, ago: 7, set: 8, ott: 9, nov: 10, dic: 11,
};

/**
 * Pick the year for a parsed (day, month) tuple given a "now" anchor.
 * Carcano lists upcoming shows only, so if the month/day is already
 * in the past for the current year, the show is in the next one.
 */
function pickYear(month: number, day: number, now = new Date()): number {
  const cy = now.getUTCFullYear();
  const probe = new Date(Date.UTC(cy, month, day));
  if (probe.getTime() < now.getTime() - 24 * 60 * 60 * 1000) return cy + 1;
  return cy;
}

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
    interface Card {
      title: string;
      dateText: string;
      ticketUrl: string;
      image?: string;
      subtitle?: string;
      shortDesc?: string;
    }
    const cards: Card[] = [];

    $(".single-spectacle-box").each((_, el) => {
      const box = $(el);
      if (box.hasClass("Passed")) return;
      const title = cleanText(box.find(".spec-title").first().text());
      if (!title) return;
      const dateText = cleanText(box.find(".date").first().text()) ?? "";
      const link = box.find("a[href]").attr("href");
      const ticketUrl = absoluteUrl(BASE, link) ?? url;
      const image = absoluteUrl(BASE, box.find("img.spec-img").attr("src"));
      const subtitle = cleanText(box.find(".director").first().text());
      const shortDesc = cleanText(box.find(".short-desc").first().text());
      cards.push({ title, dateText, ticketUrl, image, subtitle, shortDesc });
    });

    for (const card of cards) {
      const fallbackStart = card.dateText ? parseItalianRange(card.dateText) : null;
      let performances: { start: string; end?: string }[] = [];
      let description = card.shortDesc;
      let priceFrom: number | undefined;

      // Detail page has the per-performance schedule, the full
      // description and prices. Fetch it.
      try {
        const detailHtml = await fetchHtml(card.ticketUrl, {
          retries: 1,
          timeoutMs: 12000,
        });
        const d$ = cheerio.load(detailHtml);

        // Long synopsis.
        const main = d$(".main-description").first().text().replace(/\s+/g, " ").trim();
        if (main.length > 80) description = main.slice(0, 1500);

        // Schedule table: rows look like "Gio 29 ott / 19:30 / € 36,75".
        // Each row has three text nodes (day, time, price). We walk the
        // whole document text and pick triples matching that shape —
        // simpler than locating the exact selector since the markup
        // mixes container divs.
        const docText = d$("body").text().replace(/ /g, " ");
        const rowRe =
          /(lun|mar|mer|gio|ven|sab|dom)\s+(\d{1,2})\s+(gen|feb|mar|apr|mag|giu|lug|ago|set|ott|nov|dic)\s+(\d{1,2}):(\d{2})\s*(?:€\s*([\d.,]+))?/gi;
        const seenPerf = new Set<string>();
        let m: RegExpExecArray | null;
        while ((m = rowRe.exec(docText)) !== null) {
          const day = parseInt(m[2], 10);
          const month = MONTHS_IT[m[3].toLowerCase()];
          if (month === undefined) continue;
          const hh = parseInt(m[4], 10);
          const mm = parseInt(m[5], 10);
          const year = pickYear(month, day);
          const start = new Date(Date.UTC(year, month, day, hh, mm)).toISOString();
          if (!seenPerf.has(start)) {
            seenPerf.add(start);
            performances.push({ start });
          }
          if (m[6]) {
            const price = parseFloat(m[6].replace(/\./g, "").replace(",", "."));
            if (!Number.isNaN(price) && (priceFrom == null || price < priceFrom)) {
              priceFrom = Math.round(price);
            }
          }
        }
      } catch {
        // Detail fetch failed; fall through to listing-only data.
      }

      if (performances.length === 0) {
        // Fallback to the listing's date range.
        if (!fallbackStart) continue;
        const end = card.dateText ? parseItalianRangeEnd(card.dateText) ?? undefined : undefined;
        performances = [{ start: fallbackStart, end }];
      } else {
        performances.sort(
          (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
        );
        // Synthesize end for the last performance so range-aware
        // filtering keeps the show visible through curtain.
        if (performances.length > 1) {
          const last = new Date(performances[performances.length - 1].start);
          last.setUTCHours(last.getUTCHours() + 3);
          performances[performances.length - 1] = {
            ...performances[performances.length - 1],
            end: last.toISOString(),
          };
        }
      }

      const id = makeId(VENUE_SLUG, card.title, performances[0].start);
      if (seen.has(id)) continue;
      seen.add(id);

      out.push({
        id,
        slug: `${slugify(card.title)}-${id}`,
        title: card.title,
        subtitle: card.subtitle,
        category: inferCategory(`${card.title} ${card.subtitle ?? ""}`, "theater"),
        description,
        image: card.image,
        venueSlug: VENUE_SLUG,
        performances,
        ticketUrl: card.ticketUrl,
        priceFrom,
        priceCurrency: priceFrom != null ? "EUR" : undefined,
        source: { venue: VENUE_NAME, url, scrapedAt },
      });
    }
  }

  const totalPerfs = out.reduce((s, e) => s + e.performances.length, 0);
  const withDesc = out.filter((e) => e.description && e.description.length > 80).length;
  const withPrice = out.filter((e) => e.priceFrom != null).length;
  console.log(
    `[carcano] ${out.length} events, ${totalPerfs} performances, ${withDesc} with description, ${withPrice} with price`,
  );
  return out;
}
