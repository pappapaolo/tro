import type { MetadataRoute } from "next";
import { getAllEvents, getAllVenues } from "@/lib/events";
import { allCityCategoryPairs } from "@/lib/routes";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tro-eight.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const fixed: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/saved`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE}/guides`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    {
      url: `${BASE}/guides/best-opera-milan`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE}/guides/best-ballet-milan`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE}/guides/theater-milan-this-week`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE}/guides/first-time-la-scala`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    // Italian-language category × city landing pages — the ones we
    // actively want to rank for ("spettacoli teatro milano", "opera lirica
    // roma", etc.). Listings refresh nightly so changeFrequency is daily.
    ...[
      "spettacoli-teatro-milano",
      "spettacoli-teatro-roma",
      "opera-lirica-milano",
      "opera-lirica-roma",
      "balletto-milano",
      "balletto-roma",
      "concerti-milano",
      "concerti-roma",
    ].map((slug) => ({
      url: `${BASE}/guides/${slug}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    // Clean-URL category × city landing pages — /milano/teatro,
    // /roma/opera, etc. Higher priority than the guides because they
    // ARE the listing (live catalogue, not just editorial copy).
    ...allCityCategoryPairs().map(({ city, category }) => ({
      url: `${BASE}/${city}/${category}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.9,
    })),
  ];

  const events: MetadataRoute.Sitemap = getAllEvents().map((e) => ({
    url: `${BASE}/event/${e.slug}`,
    lastModified: new Date(e.source.scrapedAt),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const venues: MetadataRoute.Sitemap = getAllVenues().map((v) => ({
    url: `${BASE}/venue/${v.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...fixed, ...events, ...venues];
}
