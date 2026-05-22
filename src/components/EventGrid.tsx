import type { Event } from "@/lib/types";
import EventCard from "./EventCard";

interface Props {
  events: Event[];
  emptyHint?: string;
}

export default function EventGrid({ events, emptyHint }: Props) {
  if (events.length === 0) {
    return (
      <div className="border border-(--color-line) rounded-lg py-20 text-center text-(--color-muted)">
        {emptyHint ?? "No shows yet. Run the scraper to populate."}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((e) => (
        <EventCard key={e.id} event={e} />
      ))}
    </div>
  );
}
