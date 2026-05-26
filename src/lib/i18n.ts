export type Locale = "en" | "it";

export const LOCALES: { id: Locale; label: string }[] = [
  { id: "en", label: "English" },
  { id: "it", label: "Italiano" },
];

export const DEFAULT_LOCALE: Locale = "en";

const TRANSLATIONS = {
  en: {
    // Nav / chrome
    "nav.about": "About",
    "nav.savedAria": "Saved shows",
    "nav.searchPlaceholder": "Search shows, venues, artists",
    "nav.cityAria": "Change city",
    "nav.languageAria": "Change language",

    // City
    "city.milan": "Milan",
    "city.rome": "Rome",

    // Categories
    "cat.theater": "Theater",
    "cat.opera": "Opera",
    "cat.ballet": "Ballet",
    "cat.dance": "Dance",
    "cat.concert": "Concert",
    "cat.other": "Other",

    // Browse
    "browse.heading": "Find your next show.",
    "browse.tagline":
      "Theater, opera, ballet and concerts. All in one place.",
    "browse.filters.all": "All",
    "browse.filters.anyDate": "Any date",
    "browse.filters.anyVenue": "Any venue",
    "browse.filters.anyPrice": "Any price",
    "browse.filters.tonight": "Tonight",
    "browse.filters.weekend": "This weekend",
    "browse.filters.week": "This week",
    "browse.filters.month": "This month",
    "browse.filters.free": "Free",
    "browse.filters.lt20": "Under €20",
    "browse.filters.lt50": "Under €50",
    "browse.filters.50plus": "€50+",
    "browse.clearAll": "Clear all",
    "browse.results.one": "1 show",
    "browse.results.many": "{n} shows",
    "browse.sort.featured": "Featured",
    "browse.sort.date": "Soonest",
    "browse.empty.noEvents": "No events in {city} yet.",
    "browse.empty.noMatchCat": "No {category} matches that filter.",
    "browse.empty.noMatch": "Nothing matches that filter. Try clearing it.",

    // Cards
    "card.editorsPick": "Editor's pick",
    "card.through": "Through {date}",
    "card.performances.many": "{n} performances",
    "showtimes.moreDates": "+ {n} more dates",
    "showtimes.heading": "All performances",

    // Event detail
    "event.when": "When",
    "event.where": "Where",
    "event.price": "Price",
    "event.getTickets": "Get tickets",
    "event.allPerformances": "All performances",
    "event.venue": "Venue",
    "event.related": "More shows nearby",
    "event.alsoOn": "Also on in {city}",
    "event.tropolicy":
      "tro links to the venue. Tickets are sold and fulfilled by {venue}.",
    "event.share": "Share",
    "event.addToCalendar": "Add to calendar",
    "event.shareCopied": "Link copied",

    // Saved
    "saved.heading": "Saved",
    "saved.tagline": "Shows you've hearted. Saved on this device only — for now.",
    "saved.empty": "You haven't saved anything yet.",
    "saved.browse": "Browse what's on",
    "save.save": "Save",
    "save.saved": "Saved",
    "save.ariaSave": "Save for later",
    "save.ariaRemove": "Remove from saved",

    // Footer
    "footer.tagline": "what's on in Milan",
    "footer.about": "About",
    "footer.github": "GitHub",

    // About page
    "about.title": "About tro",
    "about.p1":
      "tro is an aggregator for the performing arts in Milan and Rome — theater, opera, ballet, dance and concerts. Today every venue has its own site, its own calendar and its own ticketing flow. Finding what's on tonight means clicking through fifteen tabs. tro puts it in one place.",
    "about.p2":
      "We don't sell tickets. Each event links out to the venue's own ticket page, so you pay the venue directly. No markup, no middleman.",
    "about.listingsHeading": "How the listings get here",
    "about.listingsP1Pre":
      "Most events are scraped from venue websites — the same listings the venues publish themselves. We refresh regularly. If something is wrong or missing, ",
    "about.listingsLink": "open an issue",
    "about.listingsP1Post": ".",
    "about.roadmapHeading": "Roadmap",
    "about.roadmap.venues": "More venues, beyond the initial set.",
    "about.roadmap.sync": "Saved events that sync across your devices.",
    "about.roadmap.cities": "More cities — Florence, Naples, Turin.",
    "about.roadmap.native":
      "Native iOS app (today it's a PWA — works the same once installed).",

    // SEO copy
    "seo.home.heading": "What's on in {city} this week",
    "seo.home.p1":
      "tro is the easiest way to find theater, opera, ballet, dance and concerts in {city}. We pull live listings from the city's major stages — La Scala, Piccolo Teatro, Teatro alla Scala, Teatro dell'Opera di Roma, Auditorium Parco della Musica and more — into one calendar, so you can stop chopping between venue websites and just pick something to do tonight.",
    "seo.home.p2":
      "Browse by date, price or category. Filter for shows under €20, free events, this weekend only — or sort by what's coming up soonest. Every show on tro links straight back to the venue's official ticket page: we don't resell, we don't mark up, we don't take a cut.",
    "seo.home.p3":
      "New venues and shows are added every week. Save the ones you like to your device, share them with friends, or drop them straight into your calendar with one tap.",
    "seo.venue.intro":
      "Browse upcoming performances at {venue}. tro tracks the official programme for {venue} so you can see every show in one place, with dates, prices and direct links to the venue's own ticket pages.",
    "seo.event.intro":
      "Looking for {title} tickets{where}? Below you'll find the full performance schedule, official ticket links and everything you need to know before going.",
    "seo.browse.heading": "Browse by category and city",
    "seo.guides.heading": "Read more",
    "seo.link.theaterMilan": "Theater shows in Milan",
    "seo.link.theaterRome": "Theater shows in Rome",
    "seo.link.operaMilan": "Opera in Milan",
    "seo.link.operaRome": "Opera in Rome",
    "seo.link.balletMilan": "Ballet in Milan",
    "seo.link.balletRome": "Ballet in Rome",
    "seo.link.danceMilan": "Dance in Milan",
    "seo.link.danceRome": "Dance in Rome",
    "seo.link.concertMilan": "Concerts in Milan",
    "seo.link.concertRome": "Concerts in Rome",
  },
  it: {
    "nav.about": "Info",
    "nav.savedAria": "Spettacoli salvati",
    "nav.searchPlaceholder": "Cerca spettacoli, teatri, artisti",
    "nav.cityAria": "Cambia città",
    "nav.languageAria": "Cambia lingua",

    "city.milan": "Milano",
    "city.rome": "Roma",

    "cat.theater": "Teatro",
    "cat.opera": "Opera",
    "cat.ballet": "Balletto",
    "cat.dance": "Danza",
    "cat.concert": "Concerto",
    "cat.other": "Altro",

    "browse.heading": "Trova il tuo prossimo spettacolo.",
    "browse.tagline":
      "Teatro, opera, balletto e concerti. Tutto in un unico posto.",
    "browse.filters.all": "Tutti",
    "browse.filters.anyDate": "Qualsiasi data",
    "browse.filters.anyVenue": "Qualsiasi teatro",
    "browse.filters.anyPrice": "Qualsiasi prezzo",
    "browse.filters.tonight": "Stasera",
    "browse.filters.weekend": "Weekend",
    "browse.filters.week": "Questa settimana",
    "browse.filters.month": "Questo mese",
    "browse.filters.free": "Gratis",
    "browse.filters.lt20": "Sotto €20",
    "browse.filters.lt50": "Sotto €50",
    "browse.filters.50plus": "Da €50",
    "browse.clearAll": "Cancella tutto",
    "browse.results.one": "1 spettacolo",
    "browse.results.many": "{n} spettacoli",
    "browse.sort.featured": "In evidenza",
    "browse.sort.date": "Prossimi",
    "browse.empty.noEvents": "Nessuno spettacolo a {city} per ora.",
    "browse.empty.noMatchCat": "Nessuno spettacolo di {category} corrisponde.",
    "browse.empty.noMatch": "Nessun risultato. Prova a togliere i filtri.",

    "card.editorsPick": "Scelto da tro",
    "card.through": "Fino al {date}",
    "card.performances.many": "{n} repliche",
    "showtimes.moreDates": "+ altre {n} date",
    "showtimes.heading": "Tutte le repliche",

    "event.when": "Quando",
    "event.where": "Dove",
    "event.price": "Prezzo",
    "event.getTickets": "Acquista biglietti",
    "event.allPerformances": "Tutte le repliche",
    "event.venue": "Teatro",
    "event.related": "Spettacoli nelle vicinanze",
    "event.alsoOn": "Anche a {city}",
    "event.tropolicy":
      "tro rimanda al teatro. I biglietti sono venduti da {venue}.",
    "event.share": "Condividi",
    "event.addToCalendar": "Aggiungi al calendario",
    "event.shareCopied": "Link copiato",

    "saved.heading": "Salvati",
    "saved.tagline":
      "Gli spettacoli che hai salvato. Solo su questo dispositivo — per ora.",
    "saved.empty": "Non hai ancora salvato niente.",
    "saved.browse": "Sfoglia il cartellone",
    "save.save": "Salva",
    "save.saved": "Salvato",
    "save.ariaSave": "Salva per dopo",
    "save.ariaRemove": "Rimuovi dai salvati",

    "footer.tagline": "cosa c'è a Milano",
    "footer.about": "Info",
    "footer.github": "GitHub",

    "about.title": "Cos'è tro",
    "about.p1":
      "tro è un aggregatore di spettacoli dal vivo a Milano e a Roma — teatro, opera, balletto, danza e concerti. Oggi ogni teatro ha il suo sito, il suo calendario e il suo sistema di biglietteria. Per scoprire cosa c'è stasera bisogna aprire quindici schede. tro raccoglie tutto in un unico posto.",
    "about.p2":
      "Non vendiamo biglietti. Ogni spettacolo rimanda direttamente alla pagina ufficiale del teatro, così paghi il teatro direttamente. Niente commissioni, niente intermediari.",
    "about.listingsHeading": "Come arrivano gli spettacoli",
    "about.listingsP1Pre":
      "La maggior parte degli eventi viene raccolta automaticamente dai siti dei teatri — gli stessi listini che i teatri pubblicano da sé. Aggiorniamo regolarmente. Se qualcosa non torna o manca, ",
    "about.listingsLink": "apri una segnalazione",
    "about.listingsP1Post": ".",
    "about.roadmapHeading": "Cosa stiamo facendo",
    "about.roadmap.venues": "Più teatri, oltre a quelli iniziali.",
    "about.roadmap.sync": "Spettacoli salvati che si sincronizzano fra i tuoi dispositivi.",
    "about.roadmap.cities": "Più città — Firenze, Napoli, Torino.",
    "about.roadmap.native":
      "App iOS nativa (oggi è una PWA — una volta installata funziona allo stesso modo).",

    "seo.home.heading": "Cosa c'è in scena a {city} questa settimana",
    "seo.home.p1":
      "tro è il modo più semplice per trovare teatro, opera, balletto, danza e concerti a {city}. Raccogliamo i cartelloni live dei principali palcoscenici della città — La Scala, Piccolo Teatro, Teatro dell'Opera di Roma, Auditorium Parco della Musica e altri — in un unico calendario, così smetti di rimbalzare tra i siti dei teatri e scegli direttamente cosa fare stasera.",
    "seo.home.p2":
      "Sfoglia per data, prezzo o categoria. Filtra gli spettacoli sotto i €20, gli eventi gratuiti, solo quelli del weekend — oppure ordinali per data più vicina. Ogni spettacolo su tro rimanda direttamente alla biglietteria ufficiale del teatro: non rivendiamo, non aggiungiamo commissioni, non prendiamo percentuali.",
    "seo.home.p3":
      "Aggiungiamo nuovi teatri e spettacoli ogni settimana. Salva quelli che ti piacciono sul tuo dispositivo, condividili con gli amici o aggiungili al calendario con un tap.",
    "seo.venue.intro":
      "Sfoglia i prossimi spettacoli al {venue}. tro segue il cartellone ufficiale del {venue} così puoi vedere tutti gli appuntamenti in un colpo solo, con date, prezzi e link diretti alla biglietteria del teatro.",
    "seo.event.intro":
      "Cerchi i biglietti per {title}{where}? Qui sotto trovi tutte le repliche, i link ufficiali per acquistare e tutto quello che serve sapere prima di andare.",
    "seo.browse.heading": "Sfoglia per categoria e città",
    "seo.guides.heading": "Approfondisci",
    "seo.link.theaterMilan": "Spettacoli di teatro a Milano",
    "seo.link.theaterRome": "Spettacoli di teatro a Roma",
    "seo.link.operaMilan": "Opera lirica a Milano",
    "seo.link.operaRome": "Opera lirica a Roma",
    "seo.link.balletMilan": "Balletto a Milano",
    "seo.link.balletRome": "Balletto a Roma",
    "seo.link.danceMilan": "Spettacoli di danza a Milano",
    "seo.link.danceRome": "Spettacoli di danza a Roma",
    "seo.link.concertMilan": "Concerti a Milano",
    "seo.link.concertRome": "Concerti a Roma",
  },
} as const satisfies Record<Locale, Record<string, string>>;

export type TranslationKey = keyof (typeof TRANSLATIONS)["en"];

export function translate(
  locale: Locale,
  key: TranslationKey,
  vars?: Record<string, string | number>,
): string {
  const table = TRANSLATIONS[locale] ?? TRANSLATIONS.en;
  let s = (table as Record<string, string>)[key] ?? TRANSLATIONS.en[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      s = s.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    }
  }
  return s;
}

export function detectLocale(): Locale {
  if (typeof navigator === "undefined") return DEFAULT_LOCALE;
  const langs = navigator.languages?.length
    ? navigator.languages
    : [navigator.language ?? DEFAULT_LOCALE];
  for (const l of langs) {
    if (typeof l !== "string") continue;
    if (l.toLowerCase().startsWith("it")) return "it";
  }
  return "en";
}
