import * as cheerio from "cheerio";
import { fetchHtml } from "../lib/http";
import {
  type ScrapedEvent,
  absoluteUrl,
  cleanText,
  inferCategory,
  makeId,
  slugify,
} from "../lib/normalize";

const VENUE_SLUG = "piccolo-teatro";
const VENUE_NAME = "Piccolo Teatro di Milano";
const CALENDAR_URL = "https://www.piccoloteatro.org/it/calendar";
const BASE = "https://www.piccoloteatro.org";

const MONTHS_IT: Record<string, number> = {
  gennaio: 0, febbraio: 1, marzo: 2, aprile: 3, maggio: 4, giugno: 5,
  luglio: 6, agosto: 7, settembre: 8, ottobre: 9, novembre: 10, dicembre: 11,
};

interface ShowAggregate {
  title: string;
  image?: string;
  theatre?: string;
  link: string;
  performances: { start: string }[];
}

export async function scrape(): Promise<ScrapedEvent[]> {
  const scrapedAt = new Date().toISOString();
  let html: string;
  try {
    html = await fetchHtml(CALENDAR_URL, { retries: 1 });
  } catch (err) {
    console.warn(`[piccolo] fetch failed: ${(err as Error).message}`);
    return [];
  }

  const $ = cheerio.load(html);

  // Header carries the displayed month ("maggio 2026"). Without it we
  // can't anchor the day cells to a real date.
  const text = $("body").text().replace(/\s+/g, " ");
  const monthMatch = text.match(
    /(gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)\s+(\d{4})/i,
  );
  if (!monthMatch) {
    console.warn("[piccolo] couldn't find displayed month");
    return [];
  }
  const displayedMonth = MONTHS_IT[monthMatch[1].toLowerCase()];
  const displayedYear = parseInt(monthMatch[2], 10);

  const shows = new Map<string, ShowAggregate>();

  // Walk cells in order, tracking which month each day belongs to.
  // The grid starts with a few previous-month spillover days, then the
  // displayed month, then optional next-month spillover at the end.
  let phase: "before" | "during" | "after" = "before";

  $(".calendar-view-day").each((_, cell) => {
    const c = $(cell);
    const numText = c.find(".calendar-view-day__number").text().trim();
    const dayMatch = numText.match(/(\d{1,2})/);
    if (!dayMatch) return;
    const day = parseInt(dayMatch[1], 10);

    if (phase === "before" && day === 1) phase = "during";
    else if (phase === "during" && day === 1) phase = "after";

    let useMonth = displayedMonth;
    let useYear = displayedYear;
    if (phase === "before") {
      useMonth -= 1;
      if (useMonth < 0) {
        useMonth = 11;
        useYear -= 1;
      }
    } else if (phase === "after") {
      useMonth += 1;
      if (useMonth > 11) {
        useMonth = 0;
        useYear += 1;
      }
    }

    c.find(".calendar-show-detail").each((_, row) => {
      const r = $(row);
      const title = cleanText(r.find(".title-item").text());
      const link = r.find(".title-item a").attr("href");
      if (!title || !link) return;

      const timeRaw = r.find(".time-item").text().trim();
      const timeMatch = timeRaw.match(/(\d{1,2}):(\d{2})/);
      const hh = timeMatch ? parseInt(timeMatch[1], 10) : 20;
      const mm = timeMatch ? parseInt(timeMatch[2], 10) : 30;

      const start = new Date(
        Date.UTC(useYear, useMonth, day, hh, mm),
      ).toISOString();

      const theatre = cleanText(r.find(".theatre-item").text());
      const imgSrc = r.find("img").attr("src");
      // Piccolo's calendar serves 72x72 thumbnails via Drupal image styles.
      // Strip the style transform + itok query to get the full-res hero
      // (same URL that og:image points at on the detail page).
      const fullRes = imgSrc
        ?.replace(/\/styles\/[^/]+\/public\//, "/")
        .replace(/\?itok=[^&]*/, "");
      const image = absoluteUrl(BASE, fullRes);

      const key = link;
      if (!shows.has(key)) {
        shows.set(key, {
          title,
          image,
          theatre,
          link,
          performances: [],
        });
      }
      shows.get(key)!.performances.push({ start });
    });
  });

  const out: ScrapedEvent[] = [];
  for (const show of shows.values()) {
    const perfs = show.performances.sort(
      (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
    );
    if (!perfs.length) continue;

    // For range-aware UI filtering: synthesize end-of-last-performance.
    if (perfs.length > 1) {
      const lastStart = new Date(perfs[perfs.length - 1].start);
      lastStart.setUTCHours(23, 59);
      perfs[perfs.length - 1] = {
        ...perfs[perfs.length - 1],
        // @ts-expect-error widening; ScrapedEvent performance accepts end
        end: lastStart.toISOString(),
      };
    }

    const start = perfs[0].start;
    const id = makeId(VENUE_SLUG, show.title, start);
    const ticketUrl = absoluteUrl(BASE, show.link) ?? CALENDAR_URL;

    out.push({
      id,
      slug: `${slugify(show.title)}-${id}`,
      title: show.title,
      subtitle: show.theatre,
      category: inferCategory(show.title, "theater"),
      image: show.image,
      venueSlug: VENUE_SLUG,
      performances: perfs,
      ticketUrl,
      source: { venue: VENUE_NAME, url: CALENDAR_URL, scrapedAt },
    });
  }

  console.log(
    `[piccolo] ${out.length} events (${[...shows.values()].reduce((s, x) => s + x.performances.length, 0)} performances)`,
  );
  return out;
}
