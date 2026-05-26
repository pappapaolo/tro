import { Suspense } from "react";
import Link from "next/link";
import Browse from "@/components/Browse";
import { getAllVenues, getUpcomingEvents } from "@/lib/events";

export const dynamic = "force-static";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://tro-eight.vercel.app";

export default function Home() {
  const events = getUpcomingEvents();
  const venues = getAllVenues();

  // schema.org ItemList — gives crawlers a structured list of every
  // current show even though the visible grid is client-rendered.
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "What's on in Milan and Rome — tro",
    numberOfItems: events.length,
    itemListElement: events.slice(0, 60).map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${BASE_URL}/event/${e.slug}`,
      name: e.title,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }}
      />
      <Suspense fallback={<div className="h-screen" />}>
        <Browse events={events} venues={venues} />
      </Suspense>
      {/* Hidden semantic list so crawlers find every event link from the
          home page even though the visible grid is filtered client-side. */}
      <nav aria-hidden="true" className="sr-only">
        <ul>
          {events.map((e) => (
            <li key={e.id}>
              <Link href={`/event/${e.slug}`}>{e.title}</Link>
            </li>
          ))}
          {venues.map((v) => (
            <li key={v.slug}>
              <Link href={`/venue/${v.slug}`}>{v.name}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
