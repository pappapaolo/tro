# Launch posts — drafts for you to post

I can't post these for you (would be self-promotion under my account and that's bad form). Copy + edit + post under your own handle. Each draft is tuned to the community's norms.

---

## Reddit — r/Milano (Italian)

**Title:** Ho fatto un sito per vedere tutto quello che c'è a teatro a Milano in un posto solo

**Body:**

Ciao,

Da un po' mi infastidiva il fatto che per sapere cosa c'è in programma a teatro a Milano dovevo aprire 10 siti diversi (La Scala, Piccolo, Franco Parenti, Elfo, Manzoni, Arcimboldi...). Ho fatto **tro** ([tro-eight.vercel.app](https://tro-eight.vercel.app)) — un aggregatore che mette tutto in un unico calendario.

- Aggiorna ogni notte dai siti dei teatri
- Filtra per data, categoria, prezzo, teatro
- Funziona anche in italiano (auto-detect dalla lingua del browser)
- Non vendo biglietti, il link va sempre al teatro

Per ora ci sono Milano e Roma (parziale). Apro a feedback — cosa manca? Quali teatri vorreste vedere? Open source su GitHub.

---

## Reddit — r/InternetIsBeautiful (English)

**Title:** I built a clean aggregator for theater, opera and ballet in Milan & Rome — one calendar instead of 15 venue websites

**Body:**

Hi all,

[tro-eight.vercel.app](https://tro-eight.vercel.app)

I got tired of opening La Scala + Piccolo Teatro + 8 other venue sites every time I wanted to see what was on. So I built **tro** — listings scraped nightly from venues, ranked by an editorial heuristic (La Scala opera/ballet, premieres, brand-name productions surface first), with proper filters.

- Search + filter by category, date, venue, price
- Italian / English auto-detect
- Editor's pick badges (heuristic, not fake user ratings)
- Saves to localStorage (no accounts)
- Open Graph cards so links look good when shared

Cities so far: Milan (8 venues), Rome (3 venues). Open source. Built with Next.js. Tickets always go through to the venue — no markup.

---

## Hacker News — Show HN

**Title:** Show HN: Tro – Performing-arts aggregator for Milan and Rome

**Body:**

Hi HN. I built [tro](https://tro-eight.vercel.app) because finding what's on at Milan's theaters meant clicking through ~10 venue sites with very different UX. Tro is a single calendar pulled from 8 Milan venues (La Scala, Piccolo, Franco Parenti, Elfo, Manzoni, Arcimboldi, Filodrammatici, Nazionale, Carcano + Auditorium Parco della Musica in Rome and the Teatro dell'Opera di Roma).

A few decisions worth flagging:

- **No ticketing.** Every event links straight to the venue's own page. tro never sits between you and the venue's checkout.
- **No fake ratings.** Per-show user reviews don't really exist for theater (Google rates the building, not the production). Instead there's an "Editor's pick" heuristic based on venue prestige + premiere/brand-name keywords.
- **Scraping is honest.** Each source is in `scripts/scrape/sources/`. The hard ones (La Scala bot-walls non-browsers, Arcimboldi runs Cloudflare's JS challenge) are tagged with what we do — UA spoofing for La Scala, Playwright for Arcimboldi.
- **Nightly refresh.** GitHub Actions cron + commits to main, Vercel auto-deploys.
- **Stack:** Next.js 16 App Router, Tailwind v4, TypeScript. Static export, deployed on Vercel.

Code: https://github.com/pappapaolo/tro

I'd love feedback on the editorial-heuristic ranking and on which other cities/venues would be most useful.

---

## Twitter / X — launch tweet

> Built **tro** ↗ tro-eight.vercel.app
>
> A clean calendar for theater, opera and ballet in Milan and Rome.
> Nightly refresh from 11 venue websites — La Scala, Piccolo Teatro, Teatro dell'Opera di Roma…
>
> No ticketing. No fake ratings. Just one place to see what's on.

(Attach: home page screenshot, or a screen-record of switching categories.)

---

## LinkedIn / Mastodon — softer version

> I got tired of clicking through ten different theater websites to figure out what was on in Milan tonight, so I built one calendar for all of them.
>
> tro pulls live listings from La Scala, Piccolo Teatro, Teatro dell'Opera di Roma and seven other venues, ranks them by an editorial heuristic, and links straight out to each venue's box office. No tickets sold by me, no fake reviews. Italian/English auto-switch.
>
> Open source if you want to add a city or a venue: github.com/pappapaolo/tro
>
> Live: https://tro-eight.vercel.app

---

## ProductHunt — eventual launch when domain is on

Hold this until you have a custom domain and one or two screen recordings. ProductHunt rewards polished, ready-to-share product pages. Don't burn the launch on the auto-named vercel host.

---

## Backlinks that aren't spam

The kind of backlinks worth chasing (none of these I can do for you, but listing so you can plan):

- **Italian theater directories** — milanoteatri.it, teatroamilano.it. Most accept submissions via a contact form. Pitch: "free alternative aggregator, open source, no ticketing competition with venues."
- **University theater clubs / arts journalism programs** in Milan — they often maintain calendars and link out.
- **HN/Reddit organic mentions** — see above.
- **r/Italy, r/europe travel-y subs** — only when content fits.
- **A short blog post on your own site** describing how you built it (the Next.js/Tailwind/scraping angle) — this is the link-worthy version that other tech-leaning sites might pick up.

What I'd avoid: paid backlink farms, mass-submission to "100 free directories" sites, reciprocal-link schemes. Google now penalizes those harder than the lift is worth.
