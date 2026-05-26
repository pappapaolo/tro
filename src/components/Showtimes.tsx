"use client";

/**
 * Renders the performance schedule for an event.
 *
 * - `compact` mode is for cards: shows the next 1-3 upcoming performances
 *   as small rows, then "+ N more dates" if the show has more.
 * - `full` mode is for the event detail page: shows every performance,
 *   grouped under a "Month Year" heading.
 *
 * Both modes are time-zone-naive (the underlying ISO strings already
 * include the venue's local time of day in UTC for simplicity) and
 * locale-aware via I18nProvider.
 */

import { useMemo } from "react";
import {
  formatPerfShort,
  formatPerfLong,
  groupByMonth,
} from "@/lib/format";
import type { Performance } from "@/lib/types";
import { useT } from "./I18nProvider";

interface Props {
  performances: Performance[];
  variant?: "compact" | "full";
  /** How many upcoming dates to show in compact mode before collapsing. */
  compactLimit?: number;
  /**
   * Whether the full-variant should render its own translated H2.
   * Defaults true on the detail page; off when the caller is providing
   * its own heading.
   */
  showHeading?: boolean;
}

export default function Showtimes({
  performances,
  variant = "compact",
  compactLimit = 3,
  showHeading = true,
}: Props) {
  const { locale, t } = useT();

  // Filter to upcoming + sort ascending. We don't want past dates
  // surfaced on a card weeks after the run ends.
  const upcoming = useMemo(() => {
    const now = Date.now();
    return [...performances]
      .filter((p) => new Date(p.end ?? p.start).getTime() >= now)
      .sort(
        (a, b) =>
          new Date(a.start).getTime() - new Date(b.start).getTime(),
      );
  }, [performances]);

  if (upcoming.length === 0) return null;

  if (variant === "compact") {
    const visible = upcoming.slice(0, compactLimit);
    const remainder = upcoming.length - visible.length;
    return (
      <div className="space-y-0.5 text-xs text-(--color-muted)">
        {visible.map((p, i) => (
          <div key={i} className="tabular-nums">
            {formatPerfShort(p.start, locale)}
          </div>
        ))}
        {remainder > 0 && (
          <div className="text-fg/60">
            {t("showtimes.moreDates", { n: remainder })}
          </div>
        )}
      </div>
    );
  }

  // Full variant: month-grouped list.
  const groups = groupByMonth(upcoming, locale);
  return (
    <section>
      {showHeading && (
        <h2 className="font-display text-xl sm:text-2xl mb-4">
          {t("showtimes.heading")}
        </h2>
      )}
      <div className="space-y-6">
        {groups.map((g) => (
          <div key={g.label}>
            <h3 className="text-sm font-medium tracking-wider uppercase text-(--color-muted) mb-2">
              {g.label}
            </h3>
            <ul className="divide-y divide-(--color-line) border-y border-(--color-line)">
              {g.performances.map((p, i) => (
                <li
                  key={i}
                  className="py-3 text-sm flex items-baseline justify-between gap-3 tabular-nums"
                >
                  <span>{formatPerfLong(p.start, locale)}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
