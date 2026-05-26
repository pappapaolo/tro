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
import { formatDateBadge, formatDateLong } from "@/lib/format";
import { illustrationForCategory } from "@/lib/illustrations";
import EventGrid from "@/components/EventGrid";
import EventActions from "@/components/EventActions";

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

  // schema.org Event — helps Google surface the show in event-rich results
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
    location: venue
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
      : undefined,
    offers:
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
        : undefined,
    organizer: venue
      ? { "@type": "Organization", name: venue.name, url: venue.website }
      : undefined,
  };

  return (
    <article className="mx-auto max-w-[1100px] px-4 sm:px-6 pt-8 pb-16">
      <script
        type="application/ld+json"
        // Server-rendered, no XSS risk — content from our own data file.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="relative aspect-[16/9] sm:aspect-[16/7] w-full overflow-hidden bg-white ring-1 ring-(--color-line) rounded-xl">
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
        {(event.rank ?? 0) >= EDITORS_PICK_THRESHOLD && (
          <span className="absolute top-4 left-4 inline-flex items-center gap-1 rounded-full bg-black/90 text-white text-xs font-medium tracking-wide px-3 py-1.5">
            <span aria-hidden className="text-(--color-accent)">★</span>
            Editor&apos;s pick
          </span>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">
        <div>
          {first && (
            <div className="text-sm font-medium tracking-wider text-black/80">
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

          {event.description && (
            <div className="mt-8 max-w-[680px] text-[17px] leading-[1.7] text-black/90 whitespace-pre-line">
              {event.description}
            </div>
          )}

          {event.performances.length > 1 && (
            <section className="mt-10">
              <h2 className="text-sm font-medium tracking-wider uppercase text-(--color-muted) mb-3">
                All performances
              </h2>
              <ul className="divide-y divide-(--color-line) border-y border-(--color-line)">
                {event.performances.map((p, i) => (
                  <li key={i} className="py-3 text-sm">
                    {formatDateLong(p.start)}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {venue && (
            <section className="mt-10">
              <h2 className="text-sm font-medium tracking-wider uppercase text-(--color-muted) mb-3">
                Venue
              </h2>
              <Link
                href={`/venue/${venue.slug}`}
                className="block border border-(--color-line) rounded-lg p-4 hover:border-black/40 transition"
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
          <h2 className="font-display text-2xl sm:text-3xl mb-6">
            More shows nearby
          </h2>
          <EventGrid events={related} />
        </section>
      )}

      {/* Mobile sticky bottom bar */}
      <EventActions event={event} venue={venue} variant="sticky" />
    </article>
  );
}
