import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  EDITORS_PICK_THRESHOLD,
  getEventBySlug,
  getRelatedEvents,
  getVenueBySlug,
  getAllEvents,
} from "@/lib/events";
import { formatDateBadge } from "@/lib/format";
import { illustrationForCategory } from "@/lib/illustrations";
import EventGrid from "@/components/EventGrid";
import EventActions from "@/components/EventActions";
import Showtimes from "@/components/Showtimes";
import TagChips from "@/components/TagChips";
import {
  EditorsPickBadge,
  RelatedHeading,
  VenueHeading,
} from "@/components/EventDetailHeadings";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllEvents().map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) return {};
  const venue = getVenueBySlug(event.venueSlug);
  const subtitle = event.subtitle ? ` — ${event.subtitle}` : "";
  const where = venue ? ` at ${venue.name}` : "";
  const dateBit = event.performances[0]?.start
    ? ` (${new Date(event.performances[0].start).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      })})`
    : "";
  const description =
    event.description?.slice(0, 200) ??
    `${event.title}${subtitle}${where}${dateBit}. Live listing on tro.`;

  // opengraph-image.tsx generates the share card automatically. Setting
  // alternates.canonical is what makes the per-event URL the SEO-canonical
  // one (the ticket URL is on the venue's site).
  return {
    title: `${event.title}${where}`,
    description,
    alternates: {
      canonical: `/event/${event.slug}`,
    },
    openGraph: {
      type: "article",
      title: event.title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: event.title,
      description,
    },
  };
}

export default async function EventPage({ params }: PageProps) {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) notFound();

  const venue = getVenueBySlug(event.venueSlug);
  const related = getRelatedEvents(event, 6);
  const first = event.performances[0]?.start;
  const last = event.performances[event.performances.length - 1];

  // schema.org Event — helps Google surface the show in event-rich
  // results. When a show has multiple performances we expose them as
  // subEvent[] so each date can show as a separate sitelink in Google's
  // event card. The parent Event carries the overall run (first start →
  // last end), the children carry the individual performances.
  const placeLd = venue
    ? {
        "@type": "Place",
        name: venue.name,
        address: venue.address
          ? {
              "@type": "PostalAddress",
              streetAddress: venue.address,
              addressLocality: venue.city,
              addressCountry: "IT",
            }
          : undefined,
      }
    : undefined;
  const offerLd =
    event.priceFrom != null
      ? {
          "@type": "Offer",
          price: event.priceFrom,
          priceCurrency: event.priceCurrency ?? "EUR",
          url: event.ticketUrl,
          availability: "https://schema.org/InStock",
        }
      : event.ticketUrl
      ? { "@type": "Offer", url: event.ticketUrl }
      : undefined;
  const subEvents =
    event.performances.length > 1
      ? event.performances.map((p) => ({
          "@type": "Event",
          name: event.title,
          startDate: p.start,
          endDate: p.end ?? p.start,
          eventStatus: "https://schema.org/EventScheduled",
          eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
          location: placeLd,
          offers: offerLd,
        }))
      : undefined;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.description?.slice(0, 500),
    image: event.image ? [event.image] : undefined,
    startDate: first,
    endDate: last?.end ?? last?.start,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: placeLd,
    offers: offerLd,
    organizer: venue
      ? { "@type": "Organization", name: venue.name, url: venue.website }
      : undefined,
    subEvent: subEvents,
  };

  return (
    <article className="mx-auto max-w-[1100px] px-4 sm:px-6 pt-8 pb-16">
      <script
        type="application/ld+json"
        // Server-rendered, no XSS risk — content from our own data file.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="relative aspect-[16/9] sm:aspect-[16/7] w-full overflow-hidden bg-bg ring-1 ring-(--color-line) rounded-xl">
        {event.image ? (
          <Image
            src={event.image}
            alt=""
            fill
            sizes="100vw"
            priority
            className="object-cover"
          />
        ) : (
          <Image
            src={illustrationForCategory(event.category).src}
            alt={illustrationForCategory(event.category).alt}
            fill
            sizes="100vw"
            priority
            className="object-contain p-10 sm:p-16"
          />
        )}
        {(event.rank ?? 0) >= EDITORS_PICK_THRESHOLD && <EditorsPickBadge />}
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">
        <div>
          {first && (
            <div className="text-sm font-medium tracking-wider text-fg/80">
              {formatDateBadge(first)}
            </div>
          )}
          <h1 className="mt-2 font-display text-4xl sm:text-5xl leading-[1.05]">
            {event.title}
          </h1>
          {event.subtitle && (
            <p className="mt-2 text-lg text-(--color-muted)">
              {event.subtitle}
            </p>
          )}

          {event.tags && event.tags.length > 0 && (
            <div className="mt-4">
              <TagChips tags={event.tags} variant="detail" limit={6} />
            </div>
          )}

          <p className="mt-6 max-w-[680px] text-[15px] leading-[1.75] text-(--color-muted)">
            Looking for {event.title} tickets
            {venue ? ` at ${venue.name}` : ""}
            {venue?.city ? ` in ${venue.city}` : ""}? Below you&apos;ll find
            the full performance schedule, official ticket links and
            everything you need to know before going. tro never resells —
            every ticket link goes straight to {venue?.name ?? "the venue"}.
          </p>

          {event.description && (
            <div className="mt-8 max-w-[680px] text-[17px] leading-[1.7] text-fg/90 whitespace-pre-line">
              {event.description}
            </div>
          )}

          {event.performances.length > 0 && (
            <div className="mt-10">
              <Showtimes performances={event.performances} variant="full" />
            </div>
          )}

          {venue && (
            <section className="mt-10">
              <VenueHeading />
              <Link
                href={`/venue/${venue.slug}`}
                className="block border border-(--color-line) rounded-lg p-4 hover:border-fg/40 transition"
              >
                <div className="font-semibold">{venue.name}</div>
                {venue.address && (
                  <div className="text-sm text-(--color-muted) mt-0.5">
                    {venue.address}
                  </div>
                )}
              </Link>
            </section>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start space-y-4">
          <EventActions event={event} venue={venue} />
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mt-20 mb-24 lg:mb-0">
          <RelatedHeading />
          <EventGrid events={related} />
        </section>
      )}

      {/* Mobile sticky bottom bar */}
      <EventActions event={event} venue={venue} variant="sticky" />
    </article>
  );
}
