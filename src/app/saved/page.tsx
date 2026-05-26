import { Suspense } from "react";
import SavedClient from "@/components/SavedClient";
import { getAllEvents, getAllVenues } from "@/lib/events";

export const metadata = {
  title: "Saved",
  description: "Shows you've saved on tro.",
};

export const dynamic = "force-static";

export default function SavedPage() {
  // Pass the whole catalog client-side. localStorage filtering happens
  // there — no server-known identity, nothing to leak.
  const events = getAllEvents();
  const venues = getAllVenues();
  return (
    <Suspense fallback={<div className="h-screen" />}>
      <SavedClient events={events} venues={venues} />
    </Suspense>
  );
}
