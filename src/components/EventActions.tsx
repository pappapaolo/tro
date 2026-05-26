"use client";

import { useState } from "react";
import type { Event, Venue } from "@/lib/types";
import { formatDateLong, formatPrice } from "@/lib/format";
import { downloadIcs } from "@/lib/ics";
import SaveButton from "./SaveButton";
import { useT } from "./I18nProvider";

interface Props {
  event: Event;
  venue?: Venue;
  variant?: "sidebar" | "sticky";
}

export default function EventActions({
  event,
  venue,
  variant = "sidebar",
}: Props) {
  const { t } = useT();
  const [copied, setCopied] = useState(false);
  const first = event.performances[0]?.start;
  const price = formatPrice(event.priceFrom, event.priceCurrency);

  async function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const data = {
      title: event.title,
      text: venue ? `${event.title} — ${venue.name}` : event.title,
      url,
    };
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share(data);
        return;
      }
    } catch {
      // User cancelled, or share unavailable — fall through to clipboard.
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard not allowed; do nothing else.
    }
  }

  if (variant === "sticky") {
    return (
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 border-t border-(--color-line) bg-bg/95 backdrop-blur px-4 py-3 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          {price ? (
            <div className="text-sm font-medium text-fg/80 truncate">
              {price}
            </div>
          ) : (
            <div className="text-xs uppercase tracking-wider text-(--color-muted) truncate">
              {venue?.name}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={handleShare}
          aria-label={t("event.share")}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-(--color-line) text-fg hover:bg-fg/5"
        >
          <ShareIcon />
        </button>
        <SaveButton eventId={event.id} className="!h-11 !w-11" />
        {event.ticketUrl && (
          <a
            href={event.ticketUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 max-w-[240px] rounded-full bg-fg text-bg text-center font-medium py-3 hover:bg-fg/85 transition"
          >
            {t("event.getTickets")}
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="border border-(--color-line) rounded-xl p-5 space-y-4">
      <div className="space-y-1">
        <div className="text-xs uppercase tracking-wider text-(--color-muted)">
          {t("event.when")}
        </div>
        {first && (
          <div className="text-sm font-medium">{formatDateLong(first)}</div>
        )}
      </div>
      {venue && (
        <div className="space-y-1">
          <div className="text-xs uppercase tracking-wider text-(--color-muted)">
            {t("event.where")}
          </div>
          <div className="text-sm font-medium">{venue.name}</div>
        </div>
      )}
      {price && (
        <div className="space-y-1">
          <div className="text-xs uppercase tracking-wider text-(--color-muted)">
            {t("event.price")}
          </div>
          <div className="text-sm font-medium">{price}</div>
        </div>
      )}
      {event.ticketUrl && (
        <a
          href={event.ticketUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full rounded-full bg-fg text-bg text-center font-medium py-3 hover:bg-fg/85 transition"
        >
          {t("event.getTickets")}
        </a>
      )}
      <div className="grid grid-cols-2 gap-2">
        <SaveButton eventId={event.id} label="full" className="w-full justify-center" />
        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-(--color-line) px-4 py-2 text-sm font-medium hover:border-fg/60 transition-colors"
        >
          <ShareIcon />
          {copied ? t("event.shareCopied") : t("event.share")}
        </button>
        <button
          type="button"
          onClick={() => downloadIcs(event, venue)}
          className="col-span-2 inline-flex items-center justify-center gap-2 rounded-full border border-(--color-line) px-4 py-2 text-sm font-medium hover:border-fg/60 transition-colors"
        >
          <CalendarIcon />
          {t("event.addToCalendar")}
        </button>
      </div>
      <p className="text-xs text-(--color-muted) leading-relaxed">
        {t("event.tropolicy", { venue: venue?.name ?? "the venue" })}
      </p>
    </div>
  );
}

function ShareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
      <path
        d="M12 3v12M12 3l-4 4M12 3l4 4M5 12v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
      <rect
        x="3"
        y="5"
        width="18"
        height="16"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M3 9h18M8 3v4M16 3v4"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
