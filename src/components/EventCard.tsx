import Image from "next/image";
import Link from "next/link";
import type { Event } from "@/lib/types";
import { EDITORS_PICK_THRESHOLD, getVenueBySlug } from "@/lib/events";
import { formatDateBadge, formatPrice } from "@/lib/format";
import { illustrationForCategory } from "@/lib/illustrations";

interface Props {
  event: Event;
}

export default function EventCard({ event }: Props) {
  const venue = getVenueBySlug(event.venueSlug);
  const first = event.performances[0]?.start;
  const price = formatPrice(event.priceFrom, event.priceCurrency);
  const fallback = illustrationForCategory(event.category);
  const isPick = (event.rank ?? 0) >= EDITORS_PICK_THRESHOLD;

  return (
    <Link
      href={`/event/${event.slug}`}
      className="group block focus:outline-none"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-white rounded-lg ring-1 ring-(--color-line) group-hover:ring-black/60 transition">
        {event.image ? (
          <Image
            src={event.image}
            alt=""
            fill
            sizes="(min-width:1200px) 33vw, (min-width:768px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <Image
            src={fallback.src}
            alt={fallback.alt}
            fill
            sizes="(min-width:1200px) 33vw, (min-width:768px) 50vw, 100vw"
            className="object-contain p-10 transition-transform duration-300 group-hover:scale-[1.04]"
          />
        )}
        {isPick && (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-black/90 text-white text-[11px] font-medium tracking-wide px-2.5 py-1">
            <span aria-hidden className="text-(--color-accent)">★</span>
            Editor&apos;s pick
          </span>
        )}
      </div>
      <div className="mt-3 space-y-1">
        {first && (
          <div className="text-xs font-medium tracking-wider text-black/80">
            {formatDateBadge(first)}
          </div>
        )}
        <h3 className="text-base font-semibold leading-snug line-clamp-2 group-hover:text-(--color-accent) transition-colors">
          {event.title}
        </h3>
        <div className="flex items-baseline justify-between gap-2 text-sm text-(--color-muted)">
          <span className="truncate">{venue?.name ?? "—"}</span>
          {price && <span className="shrink-0 text-black/70">{price}</span>}
        </div>
      </div>
    </Link>
  );
}
