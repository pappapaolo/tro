import { Suspense } from "react";
import EventGrid from "@/components/EventGrid";
import FilterPills from "@/components/FilterPills";
import { getUpcomingEvents, filterEvents } from "@/lib/events";
import type { Category } from "@/lib/types";

export const dynamic = "force-static";

interface PageProps {
  searchParams: Promise<{ cat?: string }>;
}

export default async function Home({ searchParams }: PageProps) {
  const { cat } = await searchParams;
  const all = getUpcomingEvents();
  const events = filterEvents(all, cat as Category | undefined);

  return (
    <div className="mx-auto max-w-[1200px] px-4 sm:px-6 pt-8 sm:pt-12 pb-16">
      <section className="mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight leading-tight max-w-2xl">
          What&apos;s on in Milan.
        </h1>
        <p className="mt-3 text-(--color-muted) max-w-xl">
          Theater, opera, ballet and dance. One place to browse what&apos;s on
          and where to get tickets.
        </p>
      </section>

      <div className="mb-8 sm:mb-10">
        <Suspense fallback={<div className="h-9" />}>
          <FilterPills />
        </Suspense>
      </div>

      <EventGrid
        events={events}
        emptyHint={
          all.length === 0
            ? "No events yet. Run `npm run scrape` to fetch from Milan venues."
            : "Nothing matches that filter. Try clearing it."
        }
      />
    </div>
  );
}
