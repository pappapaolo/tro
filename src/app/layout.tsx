import type { Metadata, Viewport } from "next";
import { Onest, Orelega_One } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { I18nProvider } from "@/components/I18nProvider";
import "./globals.css";

const onest = Onest({
  variable: "--font-onest",
  subsets: ["latin"],
  display: "swap",
});

const orelega = Orelega_One({
  variable: "--font-orelega",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://tro-eight.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "tro — what's on in Milan",
    template: "%s · tro",
  },
  description:
    "Find theater, opera, ballet and dance in Milan and Rome. Live listings from La Scala, Piccolo Teatro, Teatro dell'Opera di Roma and more. One place to see what's on tonight and where to get tickets.",
  keywords: [
    "theater Milan",
    "opera Milan",
    "ballet Milan",
    "La Scala tickets",
    "Piccolo Teatro",
    "what's on Milan",
    "Teatro Milano",
    "spettacoli Milano",
    "biglietti teatro",
    "Teatro dell'Opera di Roma",
    "concerti Milano",
  ],
  applicationName: "tro",
  appleWebApp: {
    capable: true,
    title: "tro",
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    type: "website",
    siteName: "tro",
    url: BASE_URL,
    title: "tro — what's on in Milan",
    description:
      "Theater, opera, ballet and dance in Milan and Rome. Curated, ranked, and linked to the venue.",
  },
  twitter: {
    card: "summary_large_image",
    title: "tro — what's on in Milan",
    description:
      "Theater, opera, ballet and dance. Curated and linked to the venue.",
  },
  alternates: {
    canonical: BASE_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${onest.variable} ${orelega.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-black">
        <I18nProvider>
          <Nav />
          <main className="flex-1">{children}</main>
          <Footer />
        </I18nProvider>
        <Analytics />
      </body>
    </html>
  );
}
