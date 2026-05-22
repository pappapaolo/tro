export type Category =
  | "theater"
  | "opera"
  | "ballet"
  | "dance"
  | "concert"
  | "other";

export const CATEGORIES: { id: Category; label: string }[] = [
  { id: "theater", label: "Theater" },
  { id: "opera", label: "Opera" },
  { id: "ballet", label: "Ballet" },
  { id: "dance", label: "Dance" },
  { id: "concert", label: "Concert" },
];

export interface Venue {
  slug: string;
  name: string;
  city: string;
  address?: string;
  website?: string;
}

export interface Performance {
  start: string; // ISO datetime, local time without offset is fine for v1
  end?: string;
}

export interface Event {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  category: Category;
  description?: string;
  image?: string;
  venueSlug: string;
  performances: Performance[];
  ticketUrl?: string;
  priceFrom?: number;
  priceCurrency?: string;
  source: {
    venue: string;
    url: string;
    scrapedAt: string;
  };
}
