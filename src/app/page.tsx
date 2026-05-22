import { Suspense } from "react";
import Browse from "@/components/Browse";
import { getAllVenues, getUpcomingEvents } from "@/lib/events";

export const dynamic = "force-static";

export default function Home() {
  const events = getUpcomingEvents();
  const venues = getAllVenues();
  return (
    <Suspense fallback={<div className="h-screen" />}>
      <Browse events={events} venues={venues} />
    </Suspense>
  );
}
