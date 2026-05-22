# Scrapers

Each source under `sources/` exports `scrape(): Promise<ScrapedEvent[]>`. The runner in `index.ts` calls them, dedupes by id, filters out runs that ended more than 14 days ago, and writes to `src/data/events.json`.

```bash
npm run scrape
```

## Status

| Venue | Source | Events | Notes |
|---|---|---|---|
| Teatro alla Scala | `sources/scala.ts` | ~90 | Scrapes the EN season catalog at `/en/season/2025-2026/index.html`. Tournée dates excluded (they're not in Milan). Listing uses placeholder images — covers will need a detail-page follow later. |
| Teatro Elfo Puccini | `sources/elfo.ts` | ~40 upcoming | `Blocks` listing on `/rassegne/tutti-gli-spettacoli.htm`. Date strings like `"7 / 31 maggio 2026"` parsed via shared Italian range helper. |
| Teatro Manzoni | `sources/manzoni.ts` | ~9 | Pulls event URLs from the homepage, then fetches each detail page for title (og:title), image (og:image) and the first Italian date in the body. |
| Teatro Franco Parenti | `sources/parenti.ts` | ~7 | Homepage mosaic tiles. Cleanest of the lot. |
| Curated supplement | `sources/manual.ts` + `manual-events.json` | 0 | Empty by default. Drop hand-curated entries here when a scraper is offline or to surface something special. |
| **Teatro degli Arcimboldi** | — | — | **Cloudflare-walled.** Every endpoint 403s for non-JS clients, including `/sitemap.xml`. Needs a JS-executing fetch (Playwright / browserless / Vercel edge with chrome-aws-lambda) or an Eventim feed via partnership. |
| Piccolo Teatro | — | — | Clean `.views-row` listing on `/it/2025-2026`, but dates only live on detail pages embedded in prose (`"LUNEDÌ 24 NOVEMBRE 2025 ore 20.45"`). Needs detail-page follow + an Italian long-form date parser. |
| I Pomeriggi Musicali | `sources/ipomeriggi.ts` | 0 | Stub. Their Yoast JSON-LD doesn't include `Event` objects — needs HTML parsing of the season list. |
| Teatro Carcano, Out Off, Filodrammatici, Nazionale | — | — | Lower priority, doable. Cards are standard WordPress. |
| Teatro Litta | — | — | Connection refused from this IP — likely geo-filtered. Re-probe from an IT egress. |

## Conventions

- Output `ScrapedEvent` shape matches `src/lib/types.ts:Event`.
- IDs are `sha1(venueSlug|title|firstStart).slice(0,10)` — stable across runs so re-scraping doesn't churn IDs.
- Each performance carries `start` and (when known) `end`. The UI filter keeps a show visible until `end` has passed, so a multi-week run is current the whole time, not just on opening night.
- All scrapers must tolerate a single failed venue without crashing the whole run.
- Always link `ticketUrl` to the venue's own ticket page. tro never sells tickets.

## Adding a new source

1. Create `sources/<venue>.ts` exporting `scrape()`.
2. Register it in `index.ts:SOURCES`.
3. Run `npm run scrape` and inspect the diff in `src/data/events.json`.
