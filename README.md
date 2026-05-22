# tro

An aggregator for theater, opera, ballet and dance in Milan. Modeled on Dice and Luma: black and white, sentence case, square cards. The point is to make it easy to see what's on tonight and where to buy.

tro **does not sell tickets**. Each event links out to the venue. No markup, no middleman.

## Stack

- Next.js 16 (App Router, Turbopack) + React 19 + TypeScript
- Tailwind v4
- Inter via `next/font/google`
- Data is a static JSON file (`src/data/events.json`) populated by venue scrapers
- PWA via `app/manifest.ts`

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Refresh the events

```bash
npm run scrape
```

This runs the venue parsers in `scripts/scrape/sources/` and rewrites `src/data/events.json`. Source status and the roadmap for the next venues are in [`scripts/scrape/README.md`](scripts/scrape/README.md).

## Deploy

Designed for Vercel. `npm run build` produces a fully static site (all event detail and venue pages prerendered via `generateStaticParams`). Run the scraper, commit `src/data/events.json`, push — that's the entire release flow.

## Status

This is v1 MVP.

- ✅ Browse, event detail, venue pages
- ✅ Real listings from Teatro Franco Parenti (scraped)
- ✅ Curated supplement for Scala, Piccolo, Arcimboldi, I Pomeriggi
- ✅ Installable as PWA
- 🚧 More venue scrapers (Piccolo, Manzoni, Arcimboldi, Elfo)
- 🚧 City switcher (Milan-only for now)
- 🚧 Saved events
