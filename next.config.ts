import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.teatroallascala.org" },
      { protocol: "https", hostname: "**.piccoloteatro.org" },
      { protocol: "https", hostname: "**.teatrofrancoparenti.it" },
      { protocol: "https", hostname: "teatrofrancoparenti.it" },
      { protocol: "https", hostname: "**.teatroarcimboldi.it" },
      { protocol: "https", hostname: "**.elfo.org" },
      { protocol: "https", hostname: "**.teatromanzoni.it" },
      { protocol: "https", hostname: "**.ipomeriggi.it" },
      { protocol: "https", hostname: "**.teatrocarcano.com" },
      { protocol: "https", hostname: "**.teatrooutoff.it" },
      { protocol: "https", hostname: "**.teatrofilodrammatici.eu" },
      { protocol: "https", hostname: "**.teatronazionale.it" },
      { protocol: "https", hostname: "**.dalverme.org" },
    ],
  },
};

export default nextConfig;
