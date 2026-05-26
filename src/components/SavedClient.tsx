"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Event, Venue } from "@/lib/types";
import EventGrid from "./EventGrid";
import { onSavedChange, readSaved } from "@/lib/saved";

interface Props {
  events: Event[];
  venues: Venue[];
}

export default function SavedClient({ events }: Props) {
  const [saved, setSaved] = useState<Set<string>>(() => new Set());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setSaved(readSaved());
    setHydrated(true);
    return onSavedChange(() => setSaved(readSaved()));
  }, []);

  const visible = useMemo(
    () => events.filter((e) => saved.has(e.id)),
    [events, saved],
  );

  return (
    <div className="mx-auto max-w-[1200px] px-4 sm:px-6 pt-8 sm:pt-12 pb-16">
      <section className="mb-8 sm:mb-10">
        <h1 className="font-display text-4xl sm:text-6xl leading-[1.05]">
          Saved
        </h1>
        <p className="mt-3 text-(--color-muted) max-w-xl">
          Shows you&apos;ve hearted. Saved on this device only — for now.
        </p>
      </section>

      {hydrated && visible.length === 0 ? (
        <div className="border border-(--color-line) rounded-2xl py-16 px-4 text-center text-(--color-muted) flex flex-col items-center gap-4">
          <p>You haven&apos;t saved anything yet.</p>
          <Link
            href="/"
            className="text-sm underline underline-offset-4 hover:no-underline hover:text-(--color-accent)"
          >
            Browse what&apos;s on
          </Link>
        </div>
      ) : (
        <EventGrid events={visible} />
      )}
    </div>
  );
}
