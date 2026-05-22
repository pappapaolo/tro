import type { ScrapedEvent } from "./normalize";

/**
 * Per-venue prestige weight. Higher = bigger cultural draw. Tuned by hand
 * for Milan + Rome; revisit when adding new cities.
 */
const VENUE_PRESTIGE: Record<string, number> = {
  "teatro-alla-scala": 30,
  "teatro-opera-roma": 28,
  "piccolo-teatro": 22,
  "teatro-arcimboldi": 18,
  "auditorium-parco-della-musica": 18,
  "teatro-argentina": 16,
  "teatro-franco-parenti": 14,
  "teatro-elfo-puccini": 12,
  "teatro-manzoni": 10,
  "i-pomeriggi-musicali": 10,
  "teatro-dal-verme": 10,
  "teatro-carcano": 7,
  "teatro-nazionale": 6,
  "teatro-out-off": 5,
  "teatro-filodrammatici": 5,
  "teatro-litta": 5,
};

/** Lower-case match list of brand-name productions / composers / directors. */
const HEAVYWEIGHT = [
  // composers — opera/symphony
  "verdi", "puccini", "wagner", "mozart", "strauss", "tchaikovsky", "tchaikovskij",
  "bizet", "rossini", "donizetti", "bellini", "monteverdi", "händel", "handel",
  "haendel", "stravinsky", "stravinskij", "mahler", "bruckner", "shostakovich",
  // playwrights / authors
  "shakespeare", "pirandello", "goldoni", "ibsen", "čechov", "chekhov", "molière",
  "moliere", "brecht", "beckett", "fo", "eduardo", "de filippo",
  // conductors
  "barenboim", "chailly", "abbado", "muti", "salonen", "mehta",
  "bychkov", "rustioni", "mariotti", "viotti", "chung",
  // ballet
  "petipa", "balanchine", "nureyev", "fonteyn", "fracci", "bolle",
  // singers
  "netrebko", "florez", "rebeka", "bernheim", "meli", "salsi", "orlinski", "bartoli",
  // pianists/violinists
  "sokolov", "rana", "levit", "grimaud", "buchbinder", "argerich", "perahia",
  "bronfman", "trifonov", "kissin",
];

const PREMIERE_RE =
  /\b(premiere|première|prima\s+(?:assoluta|esecuzione)|world\s+premiere|nuova\s+produzione|new\s+production)\b/i;

export function computeRank(e: Pick<ScrapedEvent,
  "venueSlug" | "category" | "title" | "description" | "image" | "performances"
>): number {
  let r = 40; // baseline so the field is meaningful even for fringe events

  r += VENUE_PRESTIGE[e.venueSlug] ?? 0;

  // opera/ballet at prestigious venues get an extra bump — those are the
  // "going to a thing" moments most people search for.
  const prestige = VENUE_PRESTIGE[e.venueSlug] ?? 0;
  if (prestige >= 18 && (e.category === "opera" || e.category === "ballet")) {
    r += 10;
  }

  const text = `${e.title} ${e.description ?? ""}`.toLowerCase();
  if (PREMIERE_RE.test(text)) r += 10;

  let nameHits = 0;
  for (const name of HEAVYWEIGHT) {
    if (text.includes(name)) {
      nameHits++;
      if (nameHits >= 2) break;
    }
  }
  r += nameHits === 1 ? 4 : nameHits >= 2 ? 7 : 0;

  if (e.image) r += 3;

  // Longer runs usually mean the venue is committed to the show
  const p = e.performances[0];
  if (p?.end) {
    const days =
      (new Date(p.end).getTime() - new Date(p.start).getTime()) /
      (24 * 60 * 60 * 1000);
    if (days >= 21) r += 5;
    else if (days >= 7) r += 3;
  }

  return Math.max(0, Math.min(100, Math.round(r)));
}
