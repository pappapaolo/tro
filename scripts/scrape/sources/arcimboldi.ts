import * as cheerio from "cheerio";
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

const VENUE_SLUG = "teatro-arcimboldi";
const VENUE_NAME = "Teatro degli Arcimboldi";
const SOURCE_URL = "https://www.teatroarcimboldi.it/";
const BASE = "https://www.teatroarcimboldi.it";

/**
 * Arcimboldi is behind Cloudflare's JS challenge. Regular fetch returns
 * 403 every time. We use Playwright (headless Chromium) to render the
 * page like a real browser and grab the resulting HTML.
 *
 * Optional: if Playwright isn't installed (e.g. in environments where we
 * skipped the browser download), this source returns an empty array and
 * logs a notice — the rest of the scrape continues unaffected.
 */
export async function scrape(): Promise<ScrapedEvent[]> {
  const scrapedAt = new Date().toISOString();

  let chromium: typeof import("playwright-core").chromium;
  try {
    ({ chromium } = await import("playwright-core"));
  } catch {
    console.warn("[arcimboldi] playwright-core not available, skipping");
    return [];
  }

  let html: string;
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const ctx = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
        "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      locale: "it-IT",
      viewport: { width: 1280, height: 800 },
    });
    const page = await ctx.newPage();
    await page.goto(SOURCE_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
    // Give Cloudflare a moment to drop the challenge cookie + render.
    await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
    html = await page.content();
  } catch (err) {
    console.warn(`[arcimboldi] playwright failed: ${(err as Error).message}`);
    return [];
  } finally {
    await browser?.close().catch(() => {});
  }

  const $ = cheerio.load(html);
  const out: ScrapedEvent[] = [];
  const seen = new Set<string>();

  // The Arcimboldi homepage shows upcoming shows as cards. We'll try a
  // generic strategy: pick links that point at /spettacolo/, /eventi/ or
  // similar, plus the page's structured "Tutti i prossimi" grid.
  const candidates = new Map<string, { title?: string; image?: string; date?: string }>();

  $("a[href]").each((_, el) => {
    const link = $(el);
    const href = link.attr("href");
    if (!href) return;
    const abs = absoluteUrl(BASE, href);
    if (!abs) return;
    if (!/teatroarcimboldi\.it\/(spettacolo|eventi|evento)\//i.test(abs)) return;

    const text = cleanText(link.text());
    const img = link.find("img").attr("src") ?? link.find("img").attr("data-src");
    const existing = candidates.get(abs) ?? {};
    if (text && !existing.title) existing.title = text;
    if (img && !existing.image) existing.image = absoluteUrl(BASE, img);
    // Look for a date nearby in the wrapper text
    if (!existing.date) {
      const wrapText = link.closest("div,article,li").text() ?? "";
      const m = wrapText.match(
        /\d{1,2}\s+(?:gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)(?:\s+\d{4})?/i,
      );
      if (m) existing.date = m[0];
    }
    candidates.set(abs, existing);
  });

  for (const [url, data] of candidates) {
    if (!data.title || !data.date) continue;
    const start = parseItalianRange(data.date);
    if (!start) continue;
    const end = parseItalianRangeEnd(data.date) ?? undefined;

    const id = makeId(VENUE_SLUG, data.title, start);
    if (seen.has(id)) continue;
    seen.add(id);

    out.push({
      id,
      slug: `${slugify(data.title)}-${id}`,
      title: data.title,
      category: inferCategory(data.title, "concert"),
      image: data.image,
      venueSlug: VENUE_SLUG,
      performances: [{ start, end }],
      ticketUrl: url,
      source: { venue: VENUE_NAME, url: SOURCE_URL, scrapedAt },
    });
  }

  console.log(`[arcimboldi] ${out.length} events`);
  return out;
}
