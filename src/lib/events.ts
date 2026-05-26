import eventsData from "@/data/events.json";
import venuesData from "@/data/venues.json";
import type { Event, Venue, Category } from "./types";
import { deriveTags } from "./tags";

// We compute tags once at module load time so EventCard / Showtimes /
// search filter don't have to redo the regex work on every render.
// The downside: the tag vocabulary only updates at deploy time, which
// is fine because tags.ts is part of the source bundle anyway.
const allEvents: Event[] = (eventsData as Event[]).map((e) => ({
  ...e,
  tags: e.tags && e.tags.length > 0 ? e.tags : deriveTags(e),
}));
const allVenues = venuesData as Venue[];

const venueBySlug = new Map(allVenues.map((v) => [v.slug, v]));

export function getAllEvents(): Event[] {
  // Sort: rank desc (editorial pick first), then earliest start.
  return [...allEvents].sort((a, b) => {
    const dr = (b.rank ?? 0) - (a.rank ?? 0);
    if (dr !== 0) return dr;
    return firstPerformanceTime(a) - firstPerformanceTime(b);
  });
}

/**
 * Threshold above which an event is shown with an "Editor's pick" badge.
 * Tuned so that ~10-20% of the catalog gets the badge.
 */
export const EDITORS_PICK_THRESHOLD = 82;

export function getUpcomingEvents(now: Date = new Date()): Event[] {
  const t = now.getTime();
  return getAllEvents().filter((e) => lastPerformanceTime(e) >= t);
}

export function getEventBySlug(slug: string): Event | undefined {
  return allEvents.find((e) => e.slug === slug);
}

export function getEventsByVenue(venueSlug: string): Event[] {
  // Venue pages: show chronologically (people are looking at a specific
  // venue's calendar, not the editorial mix).
  return [...allEvents]
    .filter((e) => e.venueSlug === venueSlug)
    .sort((a, b) => firstPerformanceTime(a) - firstPerformanceTime(b));
}

export function getRelatedEvents(event: Event, limit = 6): Event[] {
  return getUpcomingEvents()
    .filter((e) => e.id !== event.id)
    .filter((e) => e.venueSlug === event.venueSlug || e.category === event.category)
    .slice(0, limit);
}

export function filterEvents(events: Event[], category?: Category): Event[] {
  if (!category) return events;
  return events.filter((e) => e.category === category);
}

export function getAllVenues(): Venue[] {
  return allVenues;
}

export function getVenueBySlug(slug: string): Venue | undefined {
  return venueBySlug.get(slug);
}

function firstPerformanceTime(e: Event): number {
  if (!e.performances.length) return Number.MAX_SAFE_INTEGER;
  return new Date(e.performances[0].start).getTime();
}

function lastPerformanceTime(e: Event): number {
  if (!e.performances.length) return 0;
  const last = e.performances[e.performances.length - 1];
  // For shows with a date range, the run is on as long as `end` hasn't passed.
  return new Date(last.end ?? last.start).getTime();
}
