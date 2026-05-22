"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { Event, Venue } from "@/lib/types";
import { CATEGORIES, type Category } from "@/lib/types";
import {
  applyFilters,
  type PriceFilter,
  type WhenFilter,
} from "@/lib/filters";
import { CITIES, DEFAULT_CITY, type CityId } from "@/lib/cities";
import EventGrid from "./EventGrid";

interface Props {
  events: Event[];
  venues: Venue[];
}

const WHEN_OPTIONS: { id: WhenFilter; label: string }[] = [
  { id: "tonight", label: "Tonight" },
  { id: "weekend", label: "This weekend" },
  { id: "week", label: "This week" },
  { id: "month", label: "This month" },
];

const PRICE_OPTIONS: { id: PriceFilter; label: string }[] = [
  { id: "free", label: "Free" },
  { id: "lt20", label: "Under €20" },
  { id: "lt50", label: "Under €50" },
  { id: "50plus", label: "€50+" },
];

export default function Browse({ events, venues }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const cat = (params.get("cat") as Category | null) ?? null;
  const when = (params.get("when") as WhenFilter | null) ?? null;
  const price = (params.get("price") as PriceFilter | null) ?? null;
  const city = (params.get("city") as CityId | null) ?? DEFAULT_CITY;

  const [q, setQ] = useState(params.get("q") ?? "");
  const deferredQ = useDeferredValue(q);

  // Sync ?q= back to the URL but don't push history on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => {
      const next = new URLSearchParams(params.toString());
      if (deferredQ) next.set("q", deferredQ);
      else next.delete("q");
      const qs = next.toString();
      const newUrl = qs ? `${pathname}?${qs}` : pathname;
      router.replace(newUrl, { scroll: false });
    }, 200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deferredQ]);

  const venueCity = useMemo(() => {
    const map = new Map(venues.map((v) => [v.slug, v.city]));
    return (slug: string) => map.get(slug);
  }, [venues]);

  const filtered = useMemo(
    () =>
      applyFilters(
        events,
        {
          q: deferredQ,
          cat: cat ?? undefined,
          when: when ?? undefined,
          price: price ?? undefined,
          city: CITIES.find((c) => c.id === city)?.venueCity,
        },
        venueCity,
      ),
    [events, deferredQ, cat, when, price, city, venueCity],
  );

  function setParam(key: string, value: string | null) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  const cityLabel = CITIES.find((c) => c.id === city)?.label ?? "Milan";
  const activeCount =
    (cat ? 1 : 0) + (when ? 1 : 0) + (price ? 1 : 0) + (q.trim() ? 1 : 0);

  return (
    <div className="mx-auto max-w-[1200px] px-4 sm:px-6 pt-8 sm:pt-12 pb-16">
      <section className="mb-8 sm:mb-10">
        <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight leading-tight max-w-2xl">
          What&apos;s on in {cityLabel}.
        </h1>
        <p className="mt-3 text-(--color-muted) max-w-xl">
          Theater, opera, ballet and dance. One place to browse what&apos;s on
          and where to get tickets.
        </p>
      </section>

      <div className="mb-4 relative">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-(--color-muted) pointer-events-none" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search shows, venues, artists"
          className="w-full h-12 pl-11 pr-4 rounded-full border border-(--color-line) bg-white text-base placeholder:text-(--color-muted) focus:outline-none focus:border-black transition-colors"
          aria-label="Search"
        />
      </div>

      <div className="space-y-2 mb-6">
        <PillRow
          ariaLabel="Filter by category"
          options={[{ id: null, label: "All" }, ...CATEGORIES.map((c) => ({ id: c.id, label: c.label }))]}
          value={cat}
          onChange={(v) => setParam("cat", v)}
        />
        <PillRow
          ariaLabel="Filter by date"
          options={[{ id: null, label: "Any date" }, ...WHEN_OPTIONS.map((w) => ({ id: w.id, label: w.label }))]}
          value={when}
          onChange={(v) => setParam("when", v)}
        />
        <PillRow
          ariaLabel="Filter by price"
          options={[{ id: null, label: "Any price" }, ...PRICE_OPTIONS.map((p) => ({ id: p.id, label: p.label }))]}
          value={price}
          onChange={(v) => setParam("price", v)}
        />
      </div>

      {activeCount > 0 && filtered.length === 0 && (
        <p className="text-sm text-(--color-muted) mb-4">
          No shows match.{" "}
          <button
            type="button"
            onClick={() => {
              setQ("");
              router.replace(pathname, { scroll: false });
            }}
            className="underline underline-offset-4 hover:no-underline hover:text-(--color-accent)"
          >
            Clear filters
          </button>
          .
        </p>
      )}

      <EventGrid
        events={filtered}
        emptyHint={
          events.length === 0
            ? `No events in ${cityLabel} yet.`
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

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      aria-hidden
      className={className}
    >
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M20 20 L16.5 16.5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}
