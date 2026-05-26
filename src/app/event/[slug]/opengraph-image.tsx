import { ImageResponse } from "next/og";
import { getEventBySlug, getVenueBySlug } from "@/lib/events";
import { formatDateBadge } from "@/lib/format";
import { CATEGORIES } from "@/lib/types";

export const runtime = "nodejs"; // need fs access for the data import
export const alt = "tro";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface Props {
  params: { slug: string };
}

export default async function OgImage({ params }: Props) {
  const event = getEventBySlug(params.slug);
  if (!event) {
    return new ImageResponse(
      <div style={{ width: "100%", height: "100%", background: "#ffffff" }} />,
      { ...size },
    );
  }
  const venue = getVenueBySlug(event.venueSlug);
  const first = event.performances[0]?.start;
  const categoryLabel = CATEGORIES.find((c) => c.id === event.category)?.label;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#ffffff",
          display: "flex",
          flexDirection: "column",
          padding: 64,
          fontFamily: "system-ui",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span
            style={{
              fontFamily: "Georgia, serif",
              fontWeight: 900,
              fontSize: 56,
              color: "#000",
              lineHeight: 1,
            }}
          >
            tr
          </span>
          <div
            style={{
              width: 48,
              height: 48,
              background: "#DB2D2E",
              borderRadius: 9999,
            }}
          />
        </div>

        {first && (
          <div
            style={{
              marginTop: 56,
              fontSize: 26,
              letterSpacing: 2,
              color: "#000",
              fontWeight: 600,
              textTransform: "uppercase",
            }}
          >
            {formatDateBadge(first)}
            {categoryLabel ? `  ·  ${categoryLabel}` : ""}
          </div>
        )}

        <div
          style={{
            marginTop: 16,
            fontFamily: "Georgia, serif",
            fontWeight: 700,
            fontSize: 88,
            lineHeight: 1.05,
            color: "#000",
            maxWidth: 1050,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {event.title}
        </div>

        {event.subtitle && (
          <div
            style={{
              marginTop: 16,
              fontSize: 36,
              color: "#6b7280",
              maxWidth: 1050,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {event.subtitle}
          </div>
        )}

        <div style={{ flex: 1 }} />

        {venue && (
          <div
            style={{
              fontSize: 32,
              color: "#000",
              fontWeight: 500,
            }}
          >
            {venue.name}
            <span style={{ color: "#6b7280" }}>  ·  {venue.city}</span>
          </div>
        )}
      </div>
    ),
    { ...size },
  );
}
