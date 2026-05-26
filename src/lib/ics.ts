import type { Event } from "./types";
import type { Venue } from "./types";

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function toIcsDate(iso: string): string {
  const d = new Date(iso);
  return (
    d.getUTCFullYear().toString() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    "T" +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    "Z"
  );
}

function escapeIcs(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

export function buildIcs(event: Event, venue?: Venue): string {
  const lines: string[] = [];
  lines.push("BEGIN:VCALENDAR");
  lines.push("VERSION:2.0");
  lines.push("PRODID:-//tro//Milan performing arts//EN");
  lines.push("CALSCALE:GREGORIAN");
  lines.push("METHOD:PUBLISH");

  const now = new Date().toISOString();
  for (const [i, p] of event.performances.entries()) {
    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${event.id}-${i}@tro`);
    lines.push(`DTSTAMP:${toIcsDate(now)}`);
    lines.push(`DTSTART:${toIcsDate(p.start)}`);
    // Default duration 2h if no end given
    const endIso =
      p.end ??
      new Date(new Date(p.start).getTime() + 2 * 60 * 60 * 1000).toISOString();
    lines.push(`DTEND:${toIcsDate(endIso)}`);
    lines.push(`SUMMARY:${escapeIcs(event.title)}`);
    if (event.description) {
      lines.push(`DESCRIPTION:${escapeIcs(event.description.slice(0, 600))}`);
    }
    if (venue) {
      const loc = venue.address
        ? `${venue.name}, ${venue.address}`
        : `${venue.name}, ${venue.city}`;
      lines.push(`LOCATION:${escapeIcs(loc)}`);
    }
    if (event.ticketUrl) {
      lines.push(`URL:${event.ticketUrl}`);
    }
    lines.push("END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

export function downloadIcs(event: Event, venue?: Venue) {
  const ics = buildIcs(event, venue);
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${event.slug}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
