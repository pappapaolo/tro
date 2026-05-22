import { notFound } from "next/navigation";
import type { Metadata } from "next";
import EventGrid from "@/components/EventGrid";
import {
  getVenueBySlug,
  getEventsByVenue,
  getAllVenues,
} from "@/lib/events";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllVenues().map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const venue = getVenueBySlug(slug);
  if (!venue) return {};
  return {
    title: venue.name,
    description: `What's on at ${venue.name} in ${venue.city}.`,
  };
}

export default async function VenuePage({ params }: PageProps) {
  const { slug } = await params;
  const venue = getVenueBySlug(slug);
  if (!venue) notFound();
  const events = getEventsByVenue(slug);

  return (
    <div className="mx-auto max-w-[1200px] px-4 sm:px-6 pt-10 pb-16">
      <header className="mb-10 sm:mb-12 max-w-2xl">
        <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight">
          {venue.name}
        </h1>
        {venue.address && (
          <p className="mt-3 text-(--color-muted)">{venue.address}</p>
        )}
        {venue.website && (
          <p className="mt-1">
            <a
              href={venue.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm underline underline-offset-4 hover:no-underline"
            >
              Venue website ↗
            </a>
          </p>
        )}
      </header>

      <EventGrid
        events={events}
        emptyHint="No upcoming shows for this venue yet."
      />
    </div>
  );
}
