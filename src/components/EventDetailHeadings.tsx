"use client";

import { useT } from "./I18nProvider";

export function EditorsPickBadge() {
  const { t } = useT();
  return (
    <span className="absolute top-4 left-4 inline-flex items-center gap-1 rounded-full bg-fg/90 text-bg text-xs font-medium tracking-wide px-3 py-1.5">
      <span aria-hidden className="text-(--color-accent)">★</span>
      {t("card.editorsPick")}
    </span>
  );
}

export function VenueHeading() {
  const { t } = useT();
  return (
    <h2 className="text-sm font-medium tracking-wider uppercase text-(--color-muted) mb-3">
      {t("event.venue")}
    </h2>
  );
}

export function RelatedHeading() {
  const { t } = useT();
  return (
    <h2 className="font-display text-2xl sm:text-3xl mb-6">
      {t("event.related")}
    </h2>
  );
}
