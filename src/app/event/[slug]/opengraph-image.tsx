import { ImageResponse } from "next/og";
import { getEventBySlug, getVenueBySlug } from "@/lib/events";
import { formatDateBadge } from "@/lib/format";
import { CATEGORIES } from "@/lib/types";

export const runtime = "nodejs";
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
  const cover = event.image;

  // Without a cover, fall back to a typographic card (text on white).
  if (!cover) {
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
          <Brand />
          {first && <DateLine text={`${formatDateBadge(first)}${categoryLabel ? `  ·  ${categoryLabel}` : ""}`} />}
          <Title>{event.title}</Title>
          {event.subtitle && <Subtitle>{event.subtitle}</Subtitle>}
          <div style={{ flex: 1 }} />
          {venue && <VenueLine name={venue.name} city={venue.city} />}
        </div>
      ),
      { ...size },
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          display: "flex",
          fontFamily: "system-ui",
        }}
      >
        {/* Cover art as full background */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cover}
          alt=""
          width={1200}
          height={630}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        {/* Bottom gradient for legibility */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.55) 35%, rgba(0,0,0,0.0) 65%)",
            display: "flex",
          }}
        />
        {/* Top-left brand chip on a tinted backdrop */}
        <div
          style={{
            position: "absolute",
            top: 32,
            left: 32,
            background: "rgba(255,255,255,0.95)",
            borderRadius: 999,
            padding: "10px 18px 10px 18px",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span
            style={{
              fontFamily: "Georgia, serif",
              fontWeight: 900,
              fontSize: 32,
              color: "#000",
              lineHeight: 1,
            }}
          >
            tr
          </span>
          <div
            style={{
              width: 26,
              height: 26,
              background: "#DB2D2E",
              borderRadius: 9999,
            }}
          />
        </div>
        {/* Category chip top-right */}
        {categoryLabel && (
          <div
            style={{
              position: "absolute",
              top: 40,
              right: 32,
              background: "rgba(255,255,255,0.95)",
              borderRadius: 999,
              padding: "8px 16px",
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: "#000",
              display: "flex",
            }}
          >
            {categoryLabel}
          </div>
        )}
        {/* Bottom text block */}
        <div
          style={{
            position: "absolute",
            left: 64,
            right: 64,
            bottom: 56,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {first && (
            <div
              style={{
                fontSize: 22,
                letterSpacing: 2,
                color: "#fff",
                opacity: 0.9,
                textTransform: "uppercase",
                fontWeight: 600,
                marginBottom: 12,
              }}
            >
              {formatDateBadge(first)}
            </div>
          )}
          <div
            style={{
              fontFamily: "Georgia, serif",
              fontWeight: 700,
              fontSize: 72,
              lineHeight: 1.05,
              color: "#ffffff",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {event.title}
          </div>
          {venue && (
            <div
              style={{
                marginTop: 14,
                fontSize: 26,
                color: "#fff",
                opacity: 0.92,
                fontWeight: 500,
                display: "flex",
              }}
            >
              {venue.name}
              <span style={{ opacity: 0.65 }}>  ·  {venue.city}</span>
            </div>
          )}
        </div>
      </div>
    ),
    { ...size },
  );
}

function Brand() {
  return (
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
  );
}

function DateLine({ text }: { text: string }) {
  return (
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
      {text}
    </div>
  );
}

function Title({ children }: { children: string }) {
  return (
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
      {children}
    </div>
  );
}

function Subtitle({ children }: { children: string }) {
  return (
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
      {children}
    </div>
  );
}

function VenueLine({ name, city }: { name: string; city: string }) {
  return (
    <div style={{ fontSize: 32, color: "#000", fontWeight: 500, display: "flex" }}>
      {name}
      <span style={{ color: "#6b7280" }}>  ·  {city}</span>
    </div>
  );
}
