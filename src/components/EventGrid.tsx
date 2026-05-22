import Image from "next/image";
import type { Event } from "@/lib/types";
import type { Category } from "@/lib/types";
import EventCard from "./EventCard";
import {
  CURTAIN,
  illustrationForCategory,
  type Illustration,
} from "@/lib/illustrations";

interface Props {
  events: Event[];
  emptyHint?: string;
  emptyCategory?: Category;
}

export default function EventGrid({ events, emptyHint, emptyCategory }: Props) {
  if (events.length === 0) {
    const illustration: Illustration = emptyCategory
      ? illustrationForCategory(emptyCategory)
      : CURTAIN;
    return (
      <div className="border border-(--color-line) rounded-2xl py-16 px-4 text-center flex flex-col items-center gap-6">
        <Image
          src={illustration.src}
          alt={illustration.alt}
          width={320}
          height={320}
          className="w-[260px] h-auto sm:w-[300px]"
        />
        <p className="text-(--color-muted) max-w-md">
          {emptyHint ?? "No shows yet. Run the scraper to populate."}
        </p>
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
