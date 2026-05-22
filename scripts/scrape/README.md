# Scrapers

Each source under `sources/` exports `scrape(): Promise<ScrapedEvent[]>`. The runner in `index.ts` calls them, dedupes by id, and writes to `src/data/events.json`.

```bash
npm run scrape
```

## Status

| Venue | Source | Status |
|---|---|---|
| Teatro Franco Parenti | `sources/parenti.ts` | ✅ scrapes homepage mosaic tiles |
| Curated supplement | `sources/manual.ts` + `manual-events.json` | ✅ static |
| I Pomeriggi Musicali | `sources/ipomeriggi.ts` | 🚧 attempts JSON-LD; site doesn't publish Event LD on listing pages — currently inert |
| Piccolo Teatro | — | TODO. HTML has clean `.views-row` cards on `/it/2025-2026`, but dates only live on detail pages embedded in prose ("LUNEDÌ 24 NOVEMBRE 2025 ore 20.45"). Needs detail-page follow + Italian date parsing. |
| Teatro Manzoni | — | TODO. Homepage `.work-item` cards link to event detail pages where dates and titles live. |
| Teatro Arcimboldi | — | TODO. Eventim-backed ticket URLs are stable; their listing markup needs inspection. |
| Teatro Elfo Puccini | — | TODO. HappyTicket-backed, server-rendered. |
| Teatro alla Scala | — | BLOCKED. Returns 403 to non-browser User-Agents. Likely needs headless browser or the TicketOne distributor feed. |
| Teatro Litta | — | BLOCKED. Connection refused from non-IT IPs. Re-probe from a residential IT egress. |

## Conventions

- Output `ScrapedEvent` shape matches `src/lib/types.ts:Event`.
- IDs are `sha1(venueSlug|title|firstStart).slice(0,10)` — stable across runs so re-scraping doesn't churn IDs.
- All scrapers must tolerate a single failed venue without crashing the whole run.
- Always link `ticketUrl` to the venue's own ticket page. tro never sells tickets.

## Adding a new source

1. Create `sources/<venue>.ts` exporting `scrape()`.
2. Register it in `index.ts:SOURCES`.
3. Run `npm run scrape` and inspect the diff in `src/data/events.json`.
