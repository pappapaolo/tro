import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "tro — what's on in Milan",
    short_name: "tro",
    description:
      "Theater, opera, ballet and dance in Milan. One place to browse what's on.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#cc3e38",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
