import eventsData from "@/data/events.json";
import venuesData from "@/data/venues.json";
import type { Event, Venue, Category } from "./types";

const allEvents = eventsData as Event[];
const allVenues = venuesData as Venue[];

const venueBySlug = new Map(allVenues.map((v) => [v.slug, v]));

export function getAllEvents(): Event[] {
  return [...allEvents].sort((a, b) => {
    const aStart = firstPerformanceTime(a);
    const bStart = firstPerformanceTime(b);
    return aStart - bStart;
  });
}

export function getUpcomingEvents(now: Date = new Date()): Event[] {
  const t = now.getTime();
  return getAllEvents().filter((e) => lastPerformanceTime(e) >= t);
}

export function getEventBySlug(slug: string): Event | undefined {
  return allEvents.find((e) => e.slug === slug);
}

export function getEventsByVenue(venueSlug: string): Event[] {
  return getAllEvents().filter((e) => e.venueSlug === venueSlug);
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
