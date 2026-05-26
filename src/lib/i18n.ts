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

    // Event detail
    "event.when": "When",
    "event.where": "Where",
    "event.price": "Price",
    "event.getTickets": "Get tickets",
    "event.allPerformances": "All performances",
    "event.venue": "Venue",
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

    "browse.heading": "trova il tuo prossimo spettacolo.",
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

    "event.when": "Quando",
    "event.where": "Dove",
    "event.price": "Prezzo",
    "event.getTickets": "Acquista biglietti",
    "event.allPerformances": "Tutte le repliche",
    "event.venue": "Teatro",
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
