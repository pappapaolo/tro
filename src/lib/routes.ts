/**
 * Clean-URL routing maps for /[city]/[category] landing pages.
 *
 * URL slugs are Italian for SEO ("teatro", "opera", "balletto" — these
 * are the search terms we want to rank for). Internally we still use
 * the English enum values from types.ts (theater, opera, ballet,
 * dance, concert) so this module is the one place we translate between
 * the two.
 */

import type { Category } from "./types";
import type { CityId } from "./cities";

export interface CityRoute {
  slug: string;
  id: CityId;
  /** Singular accusative ("a Milano", "a Roma") used in page titles. */
  it: string;
  en: string;
}

export const CITY_ROUTES: CityRoute[] = [
  { slug: "milano", id: "milan", it: "Milano", en: "Milan" },
  { slug: "roma", id: "rome", it: "Roma", en: "Rome" },
];

export interface CategoryRoute {
  slug: string;
  id: Category;
  /** Italian plural — "teatro" stays singular, the rest are plural. */
  it: string;
  itLong: string;
  en: string;
  enLong: string;
}

export const CATEGORY_ROUTES: CategoryRoute[] = [
  {
    slug: "teatro",
    id: "theater",
    it: "teatro",
    itLong: "Spettacoli di teatro",
    en: "theater",
    enLong: "Theater shows",
  },
  {
    slug: "opera",
    id: "opera",
    it: "opera lirica",
    itLong: "Opera lirica",
    en: "opera",
    enLong: "Opera",
  },
  {
    slug: "balletto",
    id: "ballet",
    it: "balletto",
    itLong: "Balletto",
    en: "ballet",
    enLong: "Ballet",
  },
  {
    slug: "danza",
    id: "dance",
    it: "danza",
    itLong: "Spettacoli di danza",
    en: "dance",
    enLong: "Dance shows",
  },
  {
    slug: "concerti",
    id: "concert",
    it: "concerti",
    itLong: "Concerti",
    en: "concerts",
    enLong: "Concerts",
  },
];

export function findCityRoute(slug: string): CityRoute | undefined {
  return CITY_ROUTES.find((c) => c.slug === slug);
}

export function findCategoryRoute(slug: string): CategoryRoute | undefined {
  return CATEGORY_ROUTES.find((c) => c.slug === slug);
}

/** All city × category combinations — drives generateStaticParams + sitemap. */
export function allCityCategoryPairs(): { city: string; category: string }[] {
  const out: { city: string; category: string }[] = [];
  for (const c of CITY_ROUTES) {
    for (const cat of CATEGORY_ROUTES) {
      out.push({ city: c.slug, category: cat.slug });
    }
  }
  return out;
}
