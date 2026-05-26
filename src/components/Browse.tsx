"use client";

import { useMemo } from "react";
import Link from "next/link";
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
  /**
   * Optional initial filters from the route (e.g. /[city]/[category]
   * landing pages). Query-param values take precedence so the user can
   * still narrow the page interactively — but absent a query param,
   * these win over the global DEFAULT_CITY.
   */
  initialCity?: CityId;
  initialCategory?: Category;
  /**
   * When Browse is rendered under a landing page that already has its
   * own keyword-rich H1, set this so we don't emit a second one.
   */
  hideHeading?: boolean;
}

type SortKey = "featured" | "date";

export default function Browse({
  events,
  venues,
  initialCity,
  initialCategory,
  hideHeading = false,
}: Props) {
  const { t } = useT();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const q = params.get("q") ?? "";
  const cat =
    (params.get("cat") as Category | null) ?? initialCategory ?? null;
  const when = (params.get("when") as WhenFilter | null) ?? null;
  const price = (params.get("price") as PriceFilter | null) ?? null;
  const venue = params.get("venue") ?? null;
  const city =
    (params.get("city") as CityId | null) ?? initialCity ?? DEFAULT_CITY;
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
    <div
      className={`mx-auto max-w-[1200px] px-4 sm:px-6 pb-16 ${
        hideHeading ? "pt-4 sm:pt-6" : "pt-8 sm:pt-12"
      }`}
    >
      {!hideHeading && (
        <section className="mb-8 sm:mb-10">
          <h1 className="font-display text-4xl sm:text-6xl leading-[1.05] max-w-3xl">
            {t("browse.heading", { city: cityLabel })}
          </h1>
          <p className="mt-3 text-(--color-muted) max-w-xl">
            {t("browse.tagline")}
          </p>
        </section>
      )}

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

      <section className="mt-20 pt-10 border-t border-(--color-line) text-[15px] leading-[1.75] text-(--color-muted) max-w-3xl">
        <h2 className="font-display text-2xl sm:text-3xl text-fg mb-4">
          {t("seo.home.heading", { city: cityLabel })}
        </h2>
        <p className="mb-4">{t("seo.home.p1", { city: cityLabel })}</p>
        <p className="mb-4">{t("seo.home.p2")}</p>
        <p className="mb-8">{t("seo.home.p3")}</p>

        <h3 className="font-display text-xl text-fg mt-10 mb-4">
          {t("seo.browse.heading")}
        </h3>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 mb-8">
          <li>
            <Link
              href="/milano/teatro"
              className="underline underline-offset-4 hover:no-underline hover:text-(--color-accent)"
            >
              {t("seo.link.theaterMilan")}
            </Link>
          </li>
          <li>
            <Link
              href="/roma/teatro"
              className="underline underline-offset-4 hover:no-underline hover:text-(--color-accent)"
            >
              {t("seo.link.theaterRome")}
            </Link>
          </li>
          <li>
            <Link
              href="/milano/opera"
              className="underline underline-offset-4 hover:no-underline hover:text-(--color-accent)"
            >
              {t("seo.link.operaMilan")}
            </Link>
          </li>
          <li>
            <Link
              href="/roma/opera"
              className="underline underline-offset-4 hover:no-underline hover:text-(--color-accent)"
            >
              {t("seo.link.operaRome")}
            </Link>
          </li>
          <li>
            <Link
              href="/milano/balletto"
              className="underline underline-offset-4 hover:no-underline hover:text-(--color-accent)"
            >
              {t("seo.link.balletMilan")}
            </Link>
          </li>
          <li>
            <Link
              href="/roma/balletto"
              className="underline underline-offset-4 hover:no-underline hover:text-(--color-accent)"
            >
              {t("seo.link.balletRome")}
            </Link>
          </li>
          <li>
            <Link
              href="/milano/danza"
              className="underline underline-offset-4 hover:no-underline hover:text-(--color-accent)"
            >
              {t("seo.link.danceMilan")}
            </Link>
          </li>
          <li>
            <Link
              href="/roma/danza"
              className="underline underline-offset-4 hover:no-underline hover:text-(--color-accent)"
            >
              {t("seo.link.danceRome")}
            </Link>
          </li>
          <li>
            <Link
              href="/milano/concerti"
              className="underline underline-offset-4 hover:no-underline hover:text-(--color-accent)"
            >
              {t("seo.link.concertMilan")}
            </Link>
          </li>
          <li>
            <Link
              href="/roma/concerti"
              className="underline underline-offset-4 hover:no-underline hover:text-(--color-accent)"
            >
              {t("seo.link.concertRome")}
            </Link>
          </li>
        </ul>

        <h3 className="font-display text-xl text-fg mt-10 mb-4">
          {t("seo.guides.heading")}
        </h3>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
          <li>
            <Link
              href="/guides/spettacoli-teatro-milano"
              className="underline underline-offset-4 hover:no-underline hover:text-(--color-accent)"
            >
              Spettacoli di teatro a Milano
            </Link>
          </li>
          <li>
            <Link
              href="/guides/spettacoli-teatro-roma"
              className="underline underline-offset-4 hover:no-underline hover:text-(--color-accent)"
            >
              Spettacoli di teatro a Roma
            </Link>
          </li>
          <li>
            <Link
              href="/guides/opera-lirica-milano"
              className="underline underline-offset-4 hover:no-underline hover:text-(--color-accent)"
            >
              Opera lirica a Milano
            </Link>
          </li>
          <li>
            <Link
              href="/guides/opera-lirica-roma"
              className="underline underline-offset-4 hover:no-underline hover:text-(--color-accent)"
            >
              Opera lirica a Roma
            </Link>
          </li>
          <li>
            <Link
              href="/guides/balletto-milano"
              className="underline underline-offset-4 hover:no-underline hover:text-(--color-accent)"
            >
              Balletto a Milano
            </Link>
          </li>
          <li>
            <Link
              href="/guides/balletto-roma"
              className="underline underline-offset-4 hover:no-underline hover:text-(--color-accent)"
            >
              Balletto a Roma
            </Link>
          </li>
          <li>
            <Link
              href="/guides/concerti-milano"
              className="underline underline-offset-4 hover:no-underline hover:text-(--color-accent)"
            >
              Concerti a Milano
            </Link>
          </li>
          <li>
            <Link
              href="/guides/concerti-roma"
              className="underline underline-offset-4 hover:no-underline hover:text-(--color-accent)"
            >
              Concerti a Roma
            </Link>
          </li>
        </ul>
      </section>
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
        active ? "text-fg font-medium" : "hover:text-fg"
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
  const active = "bg-fg text-bg border-fg";
  const inactive =
    "bg-bg text-fg border-(--color-line) hover:border-fg/60";
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
