"use client";

import Image from "next/image";
import { useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { Event, Venue } from "@/lib/types";
import { CATEGORIES, type Category } from "@/lib/types";
import {
  applyFilters,
  type PriceFilter,
  type WhenFilter,
} from "@/lib/filters";
import { CITIES, DEFAULT_CITY, type CityId } from "@/lib/cities";
import { CURTAIN } from "@/lib/illustrations";
import EventGrid from "./EventGrid";
import FilterDropdown from "./FilterDropdown";

interface Props {
  events: Event[];
  venues: Venue[];
}

const WHEN_OPTIONS = [
  { value: "tonight", label: "Tonight" },
  { value: "weekend", label: "This weekend" },
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
];

const PRICE_OPTIONS = [
  { value: "free", label: "Free" },
  { value: "lt20", label: "Under €20" },
  { value: "lt50", label: "Under €50" },
  { value: "50plus", label: "€50+" },
];

export default function Browse({ events, venues }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const q = params.get("q") ?? "";
  const cat = (params.get("cat") as Category | null) ?? null;
  const when = (params.get("when") as WhenFilter | null) ?? null;
  const price = (params.get("price") as PriceFilter | null) ?? null;
  const venue = params.get("venue") ?? null;
  const city = (params.get("city") as CityId | null) ?? DEFAULT_CITY;

  const venueCity = useMemo(() => {
    const map = new Map(venues.map((v) => [v.slug, v.city]));
    return (slug: string) => map.get(slug);
  }, [venues]);

  const currentCity = CITIES.find((c) => c.id === city) ?? CITIES[0];
  const cityVenues = useMemo(
    () =>
      venues
        .filter((v) => v.city === currentCity.venueCity)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [venues, currentCity.venueCity],
  );

  const filtered = useMemo(
    () =>
      applyFilters(
        events,
        {
          q: q,
          cat: cat ?? undefined,
          when: when ?? undefined,
          price: price ?? undefined,
          venue: venue ?? undefined,
          city: currentCity.venueCity,
        },
        venueCity,
      ),
    [events, q, cat, when, price, venue, currentCity.venueCity, venueCity],
  );

  function setParam(key: string, value: string | null) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    if (key === "city") next.delete("venue");
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function clearAll() {
    router.replace(pathname, { scroll: false });
  }

  const activeCount =
    (cat ? 1 : 0) +
    (when ? 1 : 0) +
    (price ? 1 : 0) +
    (venue ? 1 : 0) +
    (q.trim() ? 1 : 0);

  return (
    <div className="mx-auto max-w-[1200px] px-4 sm:px-6 pt-8 sm:pt-12 pb-16">
      <section className="mb-8 sm:mb-10 grid grid-cols-1 sm:grid-cols-[1fr_180px] items-center gap-6">
        <div>
          <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight leading-tight">
            What&apos;s on in {currentCity.label}.
          </h1>
          <p className="mt-3 text-(--color-muted) max-w-xl">
            Theater, opera, ballet and dance. Featured shows ranked by our
            editorial heuristic — venue prestige, premieres, brand-name
            productions.
          </p>
        </div>
        <Image
          src={CURTAIN.src}
          alt={CURTAIN.alt}
          width={180}
          height={180}
          className="justify-self-end hidden sm:block"
          priority
        />
      </section>

      <PillRow
        ariaLabel="Filter by category"
        options={[
          { id: null, label: "All" },
          ...CATEGORIES.map((c) => ({ id: c.id, label: c.label })),
        ]}
        value={cat}
        onChange={(v) => setParam("cat", v)}
      />

      <div className="mt-3 mb-8 flex flex-wrap items-center gap-2">
        <FilterDropdown
          options={WHEN_OPTIONS}
          value={when}
          emptyLabel="Any date"
          onChange={(v) => setParam("when", v)}
        />
        <FilterDropdown
          options={cityVenues.map((v) => ({ value: v.slug, label: v.name }))}
          value={venue}
          emptyLabel="Any venue"
          onChange={(v) => setParam("venue", v)}
        />
        <FilterDropdown
          options={PRICE_OPTIONS}
          value={price}
          emptyLabel="Any price"
          onChange={(v) => setParam("price", v)}
        />
        {activeCount > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="ml-1 text-sm text-(--color-muted) underline underline-offset-4 hover:no-underline hover:text-(--color-accent)"
          >
            Clear all
          </button>
        )}
      </div>

      <EventGrid
        events={filtered}
        emptyHint={
          events.length === 0
            ? `No events in ${currentCity.label} yet.`
            : "Nothing matches that filter. Try clearing it."
        }
      />
    </div>
  );
}

function PillRow<T extends string | null>({
  ariaLabel,
  options,
  value,
  onChange,
}: {
  ariaLabel: string;
  options: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  const pillBase =
    "shrink-0 rounded-full px-4 py-1.5 text-sm transition-colors border";
  const active = "bg-black text-white border-black";
  const inactive =
    "bg-white text-black border-(--color-line) hover:border-black/60";
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="-mx-4 sm:-mx-6 px-4 sm:px-6 overflow-x-auto"
    >
      <div className="flex gap-2 py-1 w-max min-w-full">
        {options.map((opt) => {
          const selected = opt.id === value;
          return (
            <button
              key={opt.id ?? "_all"}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(opt.id)}
              className={`${pillBase} ${selected ? active : inactive}`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
