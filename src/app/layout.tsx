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
    default: "tro — spettacoli teatro Milano e Roma, opera, balletto, concerti",
    template: "%s · tro",
  },
  description:
    "Spettacoli di teatro a Milano e a Roma, opera lirica, balletto, danza e concerti. Cartellone live da La Scala, Piccolo Teatro, Teatro dell'Opera di Roma, Auditorium Parco della Musica e altri — biglietti direttamente dal teatro, senza commissioni.",
  keywords: [
    // IT — Milano
    "spettacoli teatro Milano",
    "spettacoli Milano",
    "teatro Milano",
    "cosa fare stasera Milano",
    "biglietti teatro Milano",
    "cartellone teatro Milano",
    "opera Milano",
    "opera lirica Milano",
    "balletto Milano",
    "danza Milano",
    "concerti Milano",
    "Teatro alla Scala biglietti",
    "Piccolo Teatro Milano",
    "Teatro Franco Parenti",
    "Teatro Elfo Puccini",
    "Teatro Manzoni Milano",
    // IT — Roma
    "spettacoli teatro Roma",
    "spettacoli Roma",
    "teatro Roma",
    "cosa fare stasera Roma",
    "biglietti teatro Roma",
    "cartellone teatro Roma",
    "opera Roma",
    "opera lirica Roma",
    "balletto Roma",
    "danza Roma",
    "concerti Roma",
    "Teatro dell'Opera di Roma",
    "Auditorium Parco della Musica",
    // EN
    "theater Milan",
    "opera Milan",
    "ballet Milan",
    "theater Rome",
    "opera Rome",
    "ballet Rome",
    "La Scala tickets",
    "what's on Milan",
    "what's on Rome",
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
    title: "tro — spettacoli a Milano e Roma",
    description:
      "Teatro, opera, balletto, danza e concerti a Milano e a Roma. Cartellone live, biglietti direttamente dal teatro.",
  },
  twitter: {
    card: "summary_large_image",
    title: "tro — spettacoli a Milano e Roma",
    description:
      "Teatro, opera, balletto, danza e concerti. Cartellone live, biglietti dal teatro.",
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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0b0c" },
  ],
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
      <body className="min-h-full flex flex-col bg-bg text-fg">
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
