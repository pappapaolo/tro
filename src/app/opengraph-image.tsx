import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "tro — what's on in Milan";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
          }}
        >
          <span
            style={{
              fontFamily: "Georgia, serif",
              fontWeight: 900,
              fontSize: 96,
              color: "#000",
              lineHeight: 1,
            }}
          >
            tr
          </span>
          <div
            style={{
              width: 84,
              height: 84,
              background: "#DB2D2E",
              borderRadius: 9999,
            }}
          />
        </div>
        <div style={{ flex: 1 }} />
        <div
          style={{
            fontFamily: "Georgia, serif",
            fontWeight: 700,
            fontSize: 88,
            lineHeight: 1.05,
            color: "#000",
            maxWidth: 1000,
          }}
        >
          What&apos;s on in Milan.
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 32,
            color: "#6b7280",
            maxWidth: 900,
          }}
        >
          Theater, opera, ballet and dance. One place to browse what&apos;s on.
        </div>
      </div>
    ),
    { ...size },
  );
}
