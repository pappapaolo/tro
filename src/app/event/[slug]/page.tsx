import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getEventBySlug,
  getRelatedEvents,
  getVenueBySlug,
  getAllEvents,
} from "@/lib/events";
import { formatDateBadge, formatDateLong, formatPrice } from "@/lib/format";
import EventGrid from "@/components/EventGrid";

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
  return {
    title: event.title,
    description:
      event.description?.slice(0, 200) ??
      `${event.title} at ${venue?.name ?? "Milan"}.`,
    openGraph: event.image ? { images: [event.image] } : undefined,
  };
}

export default async function EventPage({ params }: PageProps) {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) notFound();

  const venue = getVenueBySlug(event.venueSlug);
  const related = getRelatedEvents(event, 6);
  const first = event.performances[0]?.start;
  const price = formatPrice(event.priceFrom, event.priceCurrency);

  return (
    <article className="mx-auto max-w-[1100px] px-4 sm:px-6 pt-8 pb-16">
      <div className="relative aspect-[16/9] sm:aspect-[16/7] w-full overflow-hidden bg-(--color-line) rounded-xl">
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
          <div className="flex h-full w-full items-center justify-center text-(--color-muted) uppercase tracking-widest">
            {event.category}
          </div>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">
        <div>
          {first && (
            <div className="text-sm font-medium tracking-wider text-black/80">
              {formatDateBadge(first)}
            </div>
          )}
          <h1 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight leading-tight">
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
          <div className="border border-(--color-line) rounded-xl p-5 space-y-4">
            <div className="space-y-1">
              <div className="text-xs uppercase tracking-wider text-(--color-muted)">
                When
              </div>
              {first && (
                <div className="text-sm font-medium">
                  {formatDateLong(first)}
                </div>
              )}
            </div>
            {venue && (
              <div className="space-y-1">
                <div className="text-xs uppercase tracking-wider text-(--color-muted)">
                  Where
                </div>
                <div className="text-sm font-medium">{venue.name}</div>
              </div>
            )}
            {price && (
              <div className="space-y-1">
                <div className="text-xs uppercase tracking-wider text-(--color-muted)">
                  Price
                </div>
                <div className="text-sm font-medium">{price}</div>
              </div>
            )}
            {event.ticketUrl && (
              <a
                href={event.ticketUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full rounded-full bg-black text-white text-center font-medium py-3 hover:bg-black/85 transition"
              >
                Get tickets
              </a>
            )}
            <p className="text-xs text-(--color-muted) leading-relaxed">
              tro links to the venue. Tickets are sold and fulfilled by{" "}
              {venue?.name ?? "the venue"}.
            </p>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="text-xl font-semibold mb-6">Also on in Milan</h2>
          <EventGrid events={related} />
        </section>
      )}
    </article>
  );
}
