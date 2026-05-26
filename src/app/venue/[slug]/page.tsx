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
  const description = `What's on at ${venue.name} in ${venue.city}. Upcoming theater, opera, ballet and dance, with links to the venue's own ticket pages.`;
  return {
    title: venue.name,
    description,
    alternates: { canonical: `/venue/${venue.slug}` },
    openGraph: {
      type: "website",
      title: venue.name,
      description,
    },
    twitter: {
      card: "summary",
      title: venue.name,
      description,
    },
  };
}

export default async function VenuePage({ params }: PageProps) {
  const { slug } = await params;
  const venue = getVenueBySlug(slug);
  if (!venue) notFound();
  const events = getEventsByVenue(slug);

  // schema.org Place — better organic ranking on venue searches
  const placeLd = {
    "@context": "https://schema.org",
    "@type": "PerformingArtsTheater",
    name: venue.name,
    address: venue.address
      ? {
          "@type": "PostalAddress",
          streetAddress: venue.address,
          addressLocality: venue.city,
          addressCountry: "IT",
        }
      : undefined,
    url: venue.website,
    sameAs: venue.website ? [venue.website] : undefined,
  };

  return (
    <div className="mx-auto max-w-[1200px] px-4 sm:px-6 pt-10 pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(placeLd) }}
      />
      <header className="mb-10 sm:mb-12 max-w-2xl">
        <h1 className="font-display text-4xl sm:text-6xl leading-[1.05]">
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

      <p className="mb-8 text-[15px] leading-[1.75] text-(--color-muted) max-w-2xl">
        Browse upcoming performances at {venue.name}
        {venue.city ? ` in ${venue.city}` : ""}. tro tracks the official
        programme so you can see every show in one place — dates, prices, and a
        direct link to the venue&apos;s own ticket page. No markup, no
        middleman.
      </p>

      <EventGrid
        events={events}
        emptyHint="No upcoming shows for this venue yet."
      />

      <section className="mt-20 pt-10 border-t border-(--color-line) text-[15px] leading-[1.75] text-(--color-muted) max-w-3xl">
        <h2 className="font-display text-2xl sm:text-3xl text-black mb-4">
          About {venue.name}
        </h2>
        <p className="mb-4">
          {venue.name} is one of the venues tracked on tro
          {venue.city ? `, located in ${venue.city}` : ""}. We pull the
          official programme directly from the venue&apos;s site and refresh
          regularly, so the listings above stay up to date with what the box
          office is actually selling.
        </p>
        <p>
          Looking for something different? Explore other theaters, opera houses
          and concert halls on the{" "}
          <a
            href="/"
            className="underline underline-offset-4 hover:no-underline"
          >
            tro home page
          </a>
          , or read more about what tro is on the{" "}
          <a
            href="/about"
            className="underline underline-offset-4 hover:no-underline"
          >
            about page
          </a>
          .
        </p>
      </section>
    </div>
  );
}
