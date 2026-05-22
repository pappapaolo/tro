import Image from "next/image";
import type { Event } from "@/lib/types";
import EventCard from "./EventCard";
import { CURTAIN } from "@/lib/illustrations";

interface Props {
  events: Event[];
  emptyHint?: string;
}

export default function EventGrid({ events, emptyHint }: Props) {
  if (events.length === 0) {
    return (
      <div className="border border-(--color-line) rounded-2xl py-12 px-4 text-center text-(--color-muted) flex flex-col items-center gap-4">
        <Image
          src={CURTAIN.src}
          alt={CURTAIN.alt}
          width={160}
          height={160}
          className="opacity-90"
        />
        <p>{emptyHint ?? "No shows yet. Run the scraper to populate."}</p>
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
