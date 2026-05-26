/**
 * Genre / style tags that get derived from an event's title +
 * subtitle + description + category at runtime. The user can search
 * the catalogue for "commedia", "classico", "contemporaneo", etc.
 * and tagged events surface accordingly.
 *
 * Tags are intentionally generated from text rather than scraped per
 * venue, so a) all 128 existing events get tagged without a re-scrape
 * and b) the vocabulary can evolve (just edit this file) without
 * touching the data pipeline.
 */

import type { Event } from "./types";

export interface Tag {
  slug: string;
  it: string;
  en: string;
  /**
   * Regex patterns matched against title + subtitle + description.
   * Use word boundaries (\b) so "opera" doesn't match "operaio". For
   * multi-word patterns use \s+ between words to absorb whitespace.
   * Patterns are matched case-insensitively.
   */
  patterns: RegExp[];
  /**
   * When set, the tag is auto-applied to events of these categories,
   * even when no pattern matches. Use for "every opera is classical"
   * / "every ballet is classical-ish" defaults so search queries like
   * "classico" return a useful set.
   */
  defaultForCategory?: Event["category"][];
  /**
   * Broad tags (e.g. "classico", "sinfonico") are searchable but get
   * filtered out of the visible chip list on cards when more specific
   * tags exist for the same event. Keeps the chip rows clean.
   */
  broad?: boolean;
}

/**
 * Canonical tag list. Order is the rendering priority — when multiple
 * tags match, we keep the first N. Specific tags come first; broad
 * defaults come last.
 */
export const TAGS: Tag[] = [
  // Tone / genre
  {
    slug: "commedia",
    it: "Commedia",
    en: "Comedy",
    patterns: [
      /\bcommedi[ae]\b/i,
      /\bcomic[ao]\b/i,
      /\bcomedy\b/i,
      /\bfarsa\b/i,
      /\bsatir[ae]\b/i,
      /\bironic[ao]\b/i,
      /\bdivertente\b/i,
    ],
  },
  {
    slug: "drammatico",
    it: "Drammatico",
    en: "Drama",
    patterns: [
      /\bdrammatic[ao]\b/i,
      /\bdramma\b/i,
      /\btragedi[ae]\b/i,
      /\btragic[ao]\b/i,
      /\btragedy\b/i,
      /\bverismo\b/i,
    ],
  },
  {
    slug: "musical",
    it: "Musical",
    en: "Musical",
    patterns: [/\bmusical\b/i, /\bbroadway\b/i, /\bwest end\b/i],
  },
  {
    slug: "dj-set",
    it: "DJ set",
    en: "DJ set",
    patterns: [/\bdj set\b/i, /\bdj\s*set\b/i, /\bbpm\b/i],
  },
  // Period / style
  {
    slug: "classico",
    it: "Classico",
    en: "Classical",
    patterns: [
      /\bclassic[ao]\b/i,
      /\bclassical\b/i,
      /\brepertorio\b/i,
      /\bottocent[ao]\b/i,
      /\bromantic\b/i,
      /\bromantic[ao]\b/i,
    ],
    // Every opera, ballet, and orchestral concert is "classico" by
    // default — keeps "cerca classico" useful even when the show
    // text doesn't say so explicitly.
    defaultForCategory: ["opera", "ballet", "concert"],
    broad: true,
  },
  {
    slug: "contemporaneo",
    it: "Contemporaneo",
    en: "Contemporary",
    patterns: [
      /\bcontemporane[ao]\b/i,
      /\bcontemporary\b/i,
      /\bnovecent[ao]\b/i,
      /\b21[°\s-]*secolo\b/i,
      /\b20th century\b/i,
      /\bnuov[ao] (?:creazione|produzione)\b/i,
      /\bworld premiere\b/i,
      /\bprima assoluta\b/i,
    ],
  },
  // Children & family
  {
    slug: "famiglia",
    it: "Per famiglie",
    en: "Family",
    patterns: [
      /\bper (?:bambin[io]|ragazz[io]|famiglie)\b/i,
      /\bbambin[io]\b/i,
      /\bragazz[io]\b/i,
      /\bfamily\b/i,
      /\bkids\b/i,
      /\b(?:il )?piccolo principe\b/i,
      /\bcappuccett[oa] rosso\b/i,
      // [’'] absorbs both curly and straight apostrophes — scraped
      // titles vary by source (Scala uses curly, others straight).
      /\balice(?:[’']s)?\s+(?:adventures?\s+)?in wonderland\b/i,
      /\balice nel paese\b/i,
      /\bpinocchio\b/i,
      /\bcenerentola\b/i,
    ],
  },
  // Composer-anchored / by-the-book classics
  {
    slug: "shakespeare",
    it: "Shakespeare",
    en: "Shakespeare",
    patterns: [
      /\bshakespeare\b/i,
      /\bromeo (?:e |and )?giulietta\b/i,
      /\bromeo (?:and )?juliet\b/i,
      /\bamleto\b/i,
      /\bhamlet\b/i,
      /\bmacbeth\b/i,
      /\botello\b/i,
      /\bothello\b/i,
      /\bmidsummer night/i,
      /\bsogno di una notte di mezza estate\b/i,
    ],
  },
  {
    slug: "verdi",
    it: "Verdi",
    en: "Verdi",
    patterns: [
      /\bverdi\b/i,
      /\bla traviata\b/i,
      /\baida\b/i,
      /\botello\b/i,
      /\brigoletto\b/i,
      // Match Nabucco and Nabucodonosor (one or two C's) — the title
      // is published both ways across Italian theaters.
      /\bnabuc[co]+(?:donosor)?\b/i,
      /\bfalstaff\b/i,
      /\b(?:il )?trovatore\b/i,
      /\bmacbeth\b/i,
      /\brequiem\b/i,
    ],
  },
  {
    slug: "puccini",
    it: "Puccini",
    en: "Puccini",
    patterns: [
      /\bpuccini\b/i,
      /\btosca\b/i,
      /\bla boh[eè]me\b/i,
      /\bturandot\b/i,
      /\bmadama butterfly\b/i,
      /\bmadam butterfly\b/i,
      /\bgianni schicchi\b/i,
    ],
  },
  {
    slug: "mozart",
    it: "Mozart",
    en: "Mozart",
    patterns: [
      /\bmozart\b/i,
      /\b(?:le )?nozze di figaro\b/i,
      /\b(?:il )?flauto magico\b/i,
      /\bdon giovanni\b/i,
      /\bcos[iì] fan tutte\b/i,
      /\brequiem\b/i,
    ],
  },
  {
    slug: "wagner",
    it: "Wagner",
    en: "Wagner",
    patterns: [
      /\bwagner\b/i,
      /\bring (?:cycle|del nibelungo|of the nibelung)\b/i,
      /\btristan(?: und| e) isolde?\b/i,
      /\bparsifal\b/i,
      /\bvalchirie\b/i,
      /\bwalk[üu]re\b/i,
    ],
  },
  {
    slug: "donizetti",
    it: "Donizetti",
    en: "Donizetti",
    patterns: [
      /\bdonizetti\b/i,
      /\blucia di lammermoor\b/i,
      /\bl[’']elisir d[’']amore\b/i,
      /\bl[’']?elisir\b/i,
      /\bdon pasquale\b/i,
      /\banna bolena\b/i,
      /\broberto devereux\b/i,
      /\b(?:la )?fille du r[ée]giment\b/i,
      /\b(?:la )?figlia del reggimento\b/i,
    ],
  },
  {
    slug: "rossini",
    it: "Rossini",
    en: "Rossini",
    patterns: [
      /\brossini\b/i,
      /\b(?:il )?barbiere di siviglia\b/i,
      /\bbarber of seville\b/i,
      /\b(?:la )?cenerentola\b/i,
      /\b(?:l[’']?italiana in algeri)\b/i,
      /\b(?:il )?turco in italia\b/i,
      /\bguillaume tell\b/i,
      /\bguglielmo tell\b/i,
    ],
  },
  {
    slug: "bellini",
    it: "Bellini",
    en: "Bellini",
    patterns: [
      /\bbellini\b/i,
      /\bnorma\b/i,
      /\b(?:i )?puritani\b/i,
      /\b(?:la )?sonnambula\b/i,
      /\bcapuleti e i montecchi\b/i,
    ],
  },
  {
    slug: "bizet",
    it: "Bizet",
    en: "Bizet",
    patterns: [
      /\bbizet\b/i,
      /\bcarmen\b/i,
      /\b(?:les )?p[êe]cheurs de perles\b/i,
    ],
  },
  // Dance subgenres
  {
    slug: "balletto-classico",
    it: "Balletto classico",
    en: "Classical ballet",
    patterns: [
      /\b(?:lago dei cigni|swan lake)\b/i,
      /\bgiselle\b/i,
      /\b(?:don chisciotte|don quixote)\b/i,
      /\b(?:la bayad[èe]re|bayadere)\b/i,
      /\b(?:lo )?schiaccianoci\b/i,
      /\bnutcracker\b/i,
      /\b(?:la )?bella addormentata\b/i,
      /\bsleeping beauty\b/i,
    ],
    defaultForCategory: ["ballet"],
  },
  {
    slug: "danza-contemporanea",
    it: "Danza contemporanea",
    en: "Contemporary dance",
    patterns: [
      /\bbausch\b/i,
      /\bnaharin\b/i,
      /\bforsythe\b/i,
      /\bpina bausch\b/i,
      /\btanztheater\b/i,
    ],
    defaultForCategory: ["dance"],
  },
  // Music subgenres
  {
    slug: "sinfonico",
    it: "Sinfonico",
    en: "Symphonic",
    patterns: [
      /\bsinfonic[ao]\b/i,
      /\bsymphonic?\b/i,
      /\bsinfonia\b/i,
      /\borchestra\s+sinfonic[ao]\b/i,
      /\bmahler\b/i,
      /\bbeethoven\b/i,
      /\bbrahms\b/i,
    ],
    defaultForCategory: ["concert"],
  },
  {
    slug: "cameristica",
    it: "Cameristica",
    en: "Chamber music",
    patterns: [
      /\bcameristic[ao]\b/i,
      /\bchamber music\b/i,
      /\bquartetto\b/i,
      /\bquintetto\b/i,
      /\bsonata\b/i,
      /\brecital\b/i,
    ],
    defaultForCategory: ["concert"],
  },
  {
    slug: "jazz",
    it: "Jazz",
    en: "Jazz",
    patterns: [/\bjazz\b/i, /\bswing\b/i, /\bbebop\b/i, /\bblues\b/i],
  },
];

/**
 * Derive tag slugs for an event from its text content + category.
 * Returns up to `limit` slugs, in priority order — specific tags
 * (composer names, sub-genres) first, broad defaults (classico,
 * sinfonico) last.
 */
export function deriveTags(event: Event, limit = 6): string[] {
  const haystack = [event.title, event.subtitle, event.description]
    .filter(Boolean)
    .join(" ");
  const out: string[] = [];

  // 1) Pattern matches against text — these are the most specific.
  for (const tag of TAGS) {
    if (out.length >= limit) break;
    if (tag.patterns.some((p) => p.test(haystack))) {
      out.push(tag.slug);
    }
  }

  // 2) Category defaults — fills in broad tags (classico, sinfonico)
  //    so search queries like "classico" still return all opera /
  //    ballet / orchestral concerts even when the title is just a
  //    composer name with no "classical" word in it.
  for (const tag of TAGS) {
    if (out.length >= limit) break;
    if (out.includes(tag.slug)) continue;
    if (tag.defaultForCategory?.includes(event.category)) {
      out.push(tag.slug);
    }
  }

  return out;
}

/**
 * Filter a tag list down to the "specific" tags worth showing on
 * cards as chips. Broad defaults (classico, sinfonico) are still
 * searchable but hidden visually when more specific tags exist —
 * keeps the chip rows from being noisy.
 */
export function visibleChipTags(slugs: string[] | undefined): string[] {
  if (!slugs || slugs.length === 0) return [];
  const specific = slugs.filter((s) => !TAGS_BY_SLUG.get(s)?.broad);
  // If the only tags are broad defaults, show them — better than
  // showing nothing on a Tosca card that's only tagged "classico".
  return specific.length > 0 ? specific : slugs;
}

/** Look up a tag definition by slug. */
const TAGS_BY_SLUG = new Map(TAGS.map((t) => [t.slug, t]));
export function getTag(slug: string): Tag | undefined {
  return TAGS_BY_SLUG.get(slug);
}

/**
 * Locale-aware display label.
 */
export function tagLabel(slug: string, locale: "en" | "it"): string {
  const t = TAGS_BY_SLUG.get(slug);
  if (!t) return slug;
  return locale === "it" ? t.it : t.en;
}

/**
 * Return the tag definitions whose IT or EN label matches a free-text
 * query (substring match). Used by the search bar so typing "commedia"
 * or "classical" maps to actual tags.
 */
export function tagsMatchingQuery(q: string): Tag[] {
  const qLower = q.toLowerCase().trim();
  if (!qLower) return [];
  return TAGS.filter(
    (t) =>
      t.it.toLowerCase().includes(qLower) ||
      t.en.toLowerCase().includes(qLower) ||
      t.slug.includes(qLower),
  );
}
