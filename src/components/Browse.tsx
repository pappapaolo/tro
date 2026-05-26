"use client";

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
import { useT } from "./I18nProvider";
import EventGrid from "./EventGrid";
import FilterDropdown from "./FilterDropdown";

interface Props {
  events: Event[];
  venues: Venue[];
}

type SortKey = "featured" | "date";

export default function Browse({ events, venues }: Props) {
  const { t } = useT();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const q = params.get("q") ?? "";
  const cat = (params.get("cat") as Category | null) ?? null;
  const when = (params.get("when") as WhenFilter | null) ?? null;
  const price = (params.get("price") as PriceFilter | null) ?? null;
  const venue = params.get("venue") ?? null;
  const city = (params.get("city") as CityId | null) ?? DEFAULT_CITY;
  const sort: SortKey = params.get("sort") === "date" ? "date" : "featured";

  const venueCity = useMemo(() => {
    const map = new Map(venues.map((v) => [v.slug, v.city]));
    return (slug: string) => map.get(slug);
  }, [venues]);

  const currentCity = CITIES.find((c) => c.id === city) ?? CITIES[0];
  const cityLabel = t(`city.${currentCity.id}` as never);
  const cityVenues = useMemo(
    () =>
      venues
        .filter((v) => v.city === currentCity.venueCity)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [venues, currentCity.venueCity],
  );

  const filtered = useMemo(() => {
    const f = applyFilters(
      events,
      {
        q,
        cat: cat ?? undefined,
        when: when ?? undefined,
        price: price ?? undefined,
        venue: venue ?? undefined,
        city: currentCity.venueCity,
      },
      venueCity,
    );
    if (sort === "date") {
      return [...f].sort(
        (a, b) =>
          new Date(a.performances[0]?.start ?? 0).getTime() -
          new Date(b.performances[0]?.start ?? 0).getTime(),
      );
    }
    return f; // events are already in rank-desc order from events.ts
  }, [events, q, cat, when, price, venue, currentCity.venueCity, venueCity, sort]);

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

  const catLabel = (id: Category) => t(`cat.${id}` as never);

  const whenOptions = [
    { value: "tonight", label: t("browse.filters.tonight") },
    { value: "weekend", label: t("browse.filters.weekend") },
    { value: "week", label: t("browse.filters.week") },
    { value: "month", label: t("browse.filters.month") },
  ];
  const priceOptions = [
    { value: "free", label: t("browse.filters.free") },
    { value: "lt20", label: t("browse.filters.lt20") },
    { value: "lt50", label: t("browse.filters.lt50") },
    { value: "50plus", label: t("browse.filters.50plus") },
  ];

  const resultLabel =
    filtered.length === 1
      ? t("browse.results.one")
      : t("browse.results.many", { n: filtered.length });

  return (
    <div className="mx-auto max-w-[1200px] px-4 sm:px-6 pt-8 sm:pt-12 pb-16">
      <section className="mb-8 sm:mb-10">
        <h1 className="font-display text-4xl sm:text-6xl leading-[1.05] max-w-2xl">
          {t("browse.heading", { city: cityLabel })}
        </h1>
        <p className="mt-3 text-(--color-muted) max-w-xl">
          {t("browse.tagline")}
        </p>
      </section>

      <PillRow
        ariaLabel="Filter by category"
        options={[
          { id: null, label: t("browse.filters.all") },
          ...CATEGORIES.map((c) => ({ id: c.id, label: catLabel(c.id) })),
        ]}
        value={cat}
        onChange={(v) => setParam("cat", v)}
      />

      <div className="mt-3 mb-6 flex flex-wrap items-center gap-2">
        <FilterDropdown
          options={whenOptions}
          value={when}
          emptyLabel={t("browse.filters.anyDate")}
          onChange={(v) => setParam("when", v)}
        />
        <FilterDropdown
          options={cityVenues.map((v) => ({ value: v.slug, label: v.name }))}
          value={venue}
          emptyLabel={t("browse.filters.anyVenue")}
          onChange={(v) => setParam("venue", v)}
        />
        <FilterDropdown
          options={priceOptions}
          value={price}
          emptyLabel={t("browse.filters.anyPrice")}
          onChange={(v) => setParam("price", v)}
        />
        {activeCount > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="ml-1 text-sm text-(--color-muted) underline underline-offset-4 hover:no-underline hover:text-(--color-accent)"
          >
            {t("browse.clearAll")}
          </button>
        )}
      </div>

      <div className="mb-6 flex items-center justify-between gap-4 text-sm">
        <div className="text-(--color-muted)">{resultLabel}</div>
        <div className="flex items-center gap-1 text-(--color-muted)">
          <SortPill
            active={sort === "featured"}
            onClick={() => setParam("sort", null)}
            label={t("browse.sort.featured")}
          />
          <span className="text-(--color-line)">|</span>
          <SortPill
            active={sort === "date"}
            onClick={() => setParam("sort", "date")}
            label={t("browse.sort.date")}
          />
        </div>
      </div>

      <EventGrid
        events={filtered}
        emptyCategory={cat ?? undefined}
        emptyHint={
          events.length === 0
            ? t("browse.empty.noEvents", { city: cityLabel })
            : cat
            ? t("browse.empty.noMatchCat", { category: catLabel(cat).toLowerCase() })
            : t("browse.empty.noMatch")
        }
      />
    </div>
  );
}

function SortPill({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2 py-1 transition-colors ${
        active ? "text-black font-medium" : "hover:text-black"
      }`}
    >
      {label}
    </button>
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
