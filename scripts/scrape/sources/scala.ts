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
 * page has the real og:image AND the full performance schedule (every
 * date with hour, as `datetime="…"` attributes) AND the "In brief"
 * synopsis. We always follow detail pages on Scala — it's the only
 * place that data lives. ~90 fetches per scrape, daily CI cadence.
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
    // Fallback start from the listing in case the detail fetch fails.
    const listingStart = parseEnglishDate(card.dateText);
    if (!listingStart) continue;

    const ticketUrl = absoluteUrl(BASE, card.href) ?? BASE;
    let image: string | undefined;
    let description: string | undefined;
    let performances: { start: string }[] = [{ start: listingStart }];

    if (FOLLOW_DETAIL_PAGES) {
      try {
        const detail = await fetchHtml(ticketUrl, { retries: 1, timeoutMs: 12000 });
        const d$ = cheerio.load(detail);

        // og:image (skip the placeholder).
        const og = cleanText(d$('meta[property="og:image"]').attr("content"));
        if (og && !og.includes("header_1080x1080")) {
          image = absoluteUrl(BASE, og);
        }

        // Every <… datetime="2026-11-07T20:00:00+01:00"> is a performance.
        // Some shows have two datetimes per date when there's a matinée
        // and an evening — both are real, keep both. Dedupe and sort.
        const datetimes = new Set<string>();
        d$("[datetime]").each((_, el) => {
          const dt = d$(el).attr("datetime");
          // Filter to real performance datetimes (date + time, not
          // bare dates from publishing metadata).
          if (dt && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(dt)) {
            try {
              const iso = new Date(dt).toISOString();
              datetimes.add(iso);
            } catch {
              // Skip unparseable.
            }
          }
        });
        if (datetimes.size > 0) {
          performances = [...datetimes]
            .sort()
            .map((start) => ({ start }));
        }

        // Synopsis: "In brief" → following paragraph(s). The page uses
        // an <h2 class="mod__title">In brief</h2> heading, with the
        // body in following div(s). Extract the first 600 chars of
        // text that follows.
        const brief = d$('h2:contains("In brief")').first();
        if (brief.length) {
          // Take the nearest section's text after the heading.
          const sectionText = brief.parent().text().replace(/\s+/g, " ").trim();
          // Strip the heading itself.
          const withoutHeading = sectionText.replace(/^In brief\s*/, "");
          if (withoutHeading.length > 40) {
            description = withoutHeading.slice(0, 800).trim();
          }
        }
        // Fallback: meta description (short but better than nothing).
        if (!description) {
          const metaDesc = cleanText(d$('meta[name="description"]').attr("content"));
          if (metaDesc && metaDesc.length > 40) description = metaDesc;
        }
      } catch {
        // Detail fetch failures fall through; the card will render the
        // category illustration as a fallback and use the listing date.
      }
    }

    // If we got multi-day performances, mark end-of-run so the home
    // page "upcoming" filter keeps the show visible until the last
    // performance ends.
    if (performances.length > 1) {
      const last = new Date(performances[performances.length - 1].start);
      // 3 hours after curtain is a safe upper bound for opera / ballet
      // runs — long enough to still be "tonight" until the show ends.
      const end = new Date(last.getTime() + 3 * 60 * 60 * 1000);
      performances[performances.length - 1] = {
        ...performances[performances.length - 1],
        // @ts-expect-error: widening — ScrapedEvent perf accepts end
        end: end.toISOString(),
      };
    }

    const firstStart = performances[0].start;
    const id = makeId(VENUE_SLUG, card.title, firstStart);
    if (seen.has(id)) continue;
    seen.add(id);

    out.push({
      id,
      slug: `${slugify(card.title)}-${id}`,
      title: card.title,
      category: categoryFromUrl(card.href),
      description,
      image,
      venueSlug: VENUE_SLUG,
      performances,
      ticketUrl,
      source: { venue: VENUE_NAME, url: SOURCE_URL, scrapedAt },
    });
  }

  const totalPerfs = out.reduce((s, e) => s + e.performances.length, 0);
  const withDesc = out.filter((e) => e.description).length;
  console.log(
    `[scala] ${out.length} events, ${totalPerfs} performances, ${withDesc} with description`,
  );
  return out;
}

function categoryFromUrl(href: string): Category {
  if (href.includes("/opera/")) return "opera";
  if (href.includes("/ballet/")) return "ballet";
  if (href.includes("/concerts/")) return "concert";
  return "other";
}
