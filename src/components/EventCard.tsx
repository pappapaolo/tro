"use client";

import Image from "next/image";
import Link from "next/link";
import type { Event } from "@/lib/types";
import { CATEGORIES } from "@/lib/types";
import { EDITORS_PICK_THRESHOLD, getVenueBySlug } from "@/lib/events";
import {
  firstSentence,
  formatDateBadge,
  formatPrice,
  formatThrough,
  isMultiDay,
} from "@/lib/format";
import { illustrationForCategory } from "@/lib/illustrations";
import SaveButton from "./SaveButton";
import Showtimes from "./Showtimes";
import TagChips from "./TagChips";
import { useT } from "./I18nProvider";

interface Props {
  event: Event;
}

export default function EventCard({ event }: Props) {
  const { t } = useT();
  const venue = getVenueBySlug(event.venueSlug);
  const first = event.performances[0]?.start;
  const last = event.performances[event.performances.length - 1];
  const price = formatPrice(event.priceFrom, event.priceCurrency);
  const fallback = illustrationForCategory(event.category);
  const isPick = (event.rank ?? 0) >= EDITORS_PICK_THRESHOLD;
  const category = CATEGORIES.find((c) => c.id === event.category);
  const categoryLabel = category ? t(`cat.${category.id}` as never) : null;
  const subtitle = event.subtitle ?? firstSentence(event.description);

  let through: string | null = null;
  if (last?.end && isMultiDay(last.start, last.end)) {
    const d = new Date(last.end);
    const day = d.getUTCDate();
    const monIdx = d.getUTCMonth();
    const monKeys = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    const monItKeys = [
      "gen", "feb", "mar", "apr", "mag", "giu",
      "lug", "ago", "set", "ott", "nov", "dic",
    ];
    // We translate the verb ("Through" vs "Fino al"); the month abbreviation
    // tracks locale via t() too — for now we use the existing formatThrough
    // helper, which returns English. Wrap with t() so the label gets
    // translated.
    through = t("card.through", {
      date: formatThrough(last.end).replace(/^Through\s+/, ""),
    });
    // Note: kept formatThrough imported even though we strip its prefix — it
    // also handles the year-spanning edge case (returns "7 Jun 2027" etc).
    void day;
    void monIdx;
    void monKeys;
    void monItKeys;
  }
  const showsCount = event.performances.length;

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
            {t("card.editorsPick")}
          </span>
        )}
        {categoryLabel && (
          <span className="absolute top-3 right-3 rounded-full bg-white/95 text-black text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 ring-1 ring-black/10">
            {categoryLabel}
          </span>
        )}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
          <SaveButton eventId={event.id} />
        </div>
      </div>

      <div className="mt-3 space-y-1">
        {first && (
          <div className="text-xs font-medium tracking-wider text-black/80">
            {formatDateBadge(first)}
          </div>
        )}
        <h3 className="font-display text-lg leading-tight line-clamp-2 group-hover:text-(--color-accent) transition-colors">
          {event.title}
        </h3>
        {subtitle && (
          <p className="text-sm text-(--color-muted) line-clamp-1">
            {subtitle}
          </p>
        )}
        {event.tags && event.tags.length > 0 && (
          <div className="pt-0.5">
            <TagChips tags={event.tags} variant="card" limit={3} />
          </div>
        )}
        <div className="flex items-baseline justify-between gap-2 text-sm text-(--color-muted)">
          <span className="truncate">{venue?.name ?? "—"}</span>
          {price && <span className="shrink-0 text-black/70">{price}</span>}
        </div>
        {showsCount > 1 ? (
          <div className="pt-1">
            <Showtimes
              performances={event.performances}
              variant="compact"
              compactLimit={2}
            />
          </div>
        ) : (
          through && (
            <div className="text-xs text-(--color-muted)">{through}</div>
          )
        )}
      </div>
    </Link>
  );
}
