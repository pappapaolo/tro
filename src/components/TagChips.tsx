"use client";

/**
 * Renders an event's tags as small inline chips. Locale-aware via
 * I18nProvider — clicking a chip drops the user back at the home
 * grid with that tag in the search box, so they can browse all
 * other events sharing the tag.
 */

import Link from "next/link";
import { tagLabel, visibleChipTags } from "@/lib/tags";
import { useT } from "./I18nProvider";

interface Props {
  tags?: string[];
  variant?: "card" | "detail";
  /** Limit how many tags to show; rest are hidden. */
  limit?: number;
}

export default function TagChips({
  tags,
  variant = "card",
  limit = 3,
}: Props) {
  const { locale } = useT();
  if (!tags || tags.length === 0) return null;
  // Cards only show "specific" tags (skip broad defaults like
  // "classico" / "sinfonico" when more specific ones exist). Detail
  // pages show everything since they have room.
  const candidates = variant === "card" ? visibleChipTags(tags) : tags;
  const visible = candidates.slice(0, limit);
  if (visible.length === 0) return null;

  const sizeCls =
    variant === "detail"
      ? "text-xs px-2.5 py-1"
      : "text-[10px] px-2 py-[3px]";

  const baseCls = `inline-flex shrink-0 items-center rounded-full bg-fg/[0.04] text-fg/70 ${sizeCls}`;

  return (
    <div className="flex flex-wrap gap-1.5">
      {visible.map((slug) => {
        const label = tagLabel(slug, locale);
        // Card variant: cards are already wrapped in an <a> — nested
        // anchors are invalid, so we render as a plain styled span.
        // Detail variant: free-standing, so a real Link that opens
        // the home grid pre-populated with the tag label in search.
        if (variant === "card") {
          return (
            <span key={slug} className={baseCls}>
              {label}
            </span>
          );
        }
        return (
          <Link
            key={slug}
            href={`/?q=${encodeURIComponent(label)}`}
            className={`${baseCls} hover:bg-fg/10 hover:text-fg transition-colors`}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
