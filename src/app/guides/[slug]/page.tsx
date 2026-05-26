import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getUpcomingEvents } from "@/lib/events";
import EventGrid from "@/components/EventGrid";
import type { Event, Category } from "@/lib/types";

interface GuideDef {
  slug: string;
  title: string;
  metaDescription: string;
  intro: string;
  filter: (e: Event) => boolean;
  outroParagraphs: string[];
}

const GUIDES: GuideDef[] = [
  {
    slug: "best-opera-milan",
    title: "Best opera in Milan this season",
    metaDescription:
      "Best opera in Milan: La Scala's 2025–2026 season, plus everything else. Updated every week from venue listings.",
    intro:
      "Milan is one of the great opera cities. The 2025–2026 season at Teatro alla Scala stretches from Verdi and Puccini to Wagner and Strauss, plus chamber concerts and a Ring cycle. Below: the upcoming operas tro currently has on file, refreshed nightly from venue listings.",
    filter: (e) =>
      e.category === "opera" || /opera/i.test(e.title + " " + (e.subtitle ?? "")),
    outroParagraphs: [
      "If you're new to opera, La Scala has long been the city's defining stage — it's the venue most lists are built around. Smaller venues (Teatro Dal Verme, Teatro Nazionale) sometimes carry productions worth catching for half the price.",
      "Tickets for La Scala open ~2 months before each production. Under-30 previews are a real discount path and sell out fast.",
    ],
  },
  {
    slug: "best-ballet-milan",
    title: "Best ballet in Milan",
    metaDescription:
      "Ballet in Milan — La Scala Ballet's season plus touring shows and contemporary stages.",
    intro:
      "Milan's ballet calendar revolves around La Scala's resident company. The 2025–2026 season includes a mix of full-evening classics (Swan Lake, Giselle, Don Quixote) and mixed bills (Balanchine, Bausch, Naharin). Smaller stages bring touring contemporary work.",
    filter: (e) =>
      e.category === "ballet" ||
      /ballet|balletto/i.test(e.title + " " + (e.subtitle ?? "")),
    outroParagraphs: [
      "Looking for something specific? The ranked list above prioritizes La Scala's own corps de ballet productions, then touring companies, then contemporary pieces.",
    ],
  },
  {
    slug: "theater-milan-this-week",
    title: "Theater in Milan this week",
    metaDescription:
      "What's on at Milan's theaters right now — Piccolo, Parenti, Elfo, Manzoni and more. Updated nightly.",
    intro:
      "A snapshot of what's playing at Milan's main stages this week and next. Updated every night from the venues' own listings.",
    filter: (e) => {
      if (e.category !== "theater") return false;
      const start = new Date(e.performances[0]?.start ?? 0).getTime();
      const inFourteenDays = Date.now() + 14 * 24 * 60 * 60 * 1000;
      return start < inFourteenDays;
    },
    outroParagraphs: [
      "tro pulls listings from Piccolo Teatro, Teatro Franco Parenti, Teatro Elfo Puccini, Teatro Manzoni, Teatro Filodrammatici, Teatro Carcano and Teatro Nazionale. Each show links straight to the venue's own ticket page.",
    ],
  },
  {
    slug: "first-time-la-scala",
    title: "First time at La Scala — what to know",
    metaDescription:
      "Going to La Scala for the first time? Tickets, seating, dress code, and how to pick a show.",
    intro:
      "Teatro alla Scala is Milan's defining stage and a global landmark for opera. Going for the first time can feel intimidating — here's what to actually know.",
    filter: (e) => e.venueSlug === "teatro-alla-scala",
    outroParagraphs: [
      "**Tickets** open about two months before each production. The cheapest seats (the upper galleries) cost ~€20-30; stalls and boxes run into the hundreds. Under-30s have a separate channel with sharp discounts; subscriptions are how most regulars buy.",
      "**Dress code** is smart but not formal. Suits and dresses are common in the stalls; jeans are fine in the galleries. Avoid shorts and flip-flops.",
      "**Seating** matters acoustically — galleries face the stage straight on; side boxes can be partial-view. La Scala's website marks restricted views clearly.",
      "**Your first show** — start with one of the canonical Verdi or Puccini productions if you can. Wagner is a multi-hour commitment and the Ring cycle is a multi-night one. The Christmas Eve gala and the December 7 opening night are sold-out, livestreamed events.",
    ],
  },
];

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = GUIDES.find((g) => g.slug === slug);
  if (!guide) return {};
  return {
    title: guide.title,
    description: guide.metaDescription,
    alternates: { canonical: `/guides/${guide.slug}` },
    openGraph: {
      type: "article",
      title: guide.title,
      description: guide.metaDescription,
    },
    twitter: {
      card: "summary_large_image",
      title: guide.title,
      description: guide.metaDescription,
    },
  };
}

export default async function GuidePage({ params }: PageProps) {
  const { slug } = await params;
  const guide = GUIDES.find((g) => g.slug === slug);
  if (!guide) notFound();

  const all = getUpcomingEvents();
  const matches = all.filter(guide.filter).slice(0, 18);

  // schema.org Article for richer SERP snippets
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.metaDescription,
    author: { "@type": "Organization", name: "tro" },
    publisher: { "@type": "Organization", name: "tro" },
    datePublished: new Date().toISOString().slice(0, 10),
    dateModified: new Date().toISOString().slice(0, 10),
  };

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      <nav className="mb-6 text-sm text-(--color-muted)">
        <Link href="/" className="hover:text-(--color-accent)">tro</Link>
        <span className="mx-2">·</span>
        <Link href="/guides" className="hover:text-(--color-accent)">
          Guides
        </Link>
      </nav>
      <h1 className="font-display text-4xl sm:text-5xl leading-[1.05] mb-5">
        {guide.title}
      </h1>
      <p className="text-[17px] leading-[1.7] text-black/90 mb-10">
        {guide.intro}
      </p>

      {matches.length > 0 && (
        <section className="mb-14">
          <h2 className="font-display text-2xl mb-5">Upcoming on tro</h2>
          <EventGrid events={matches} />
        </section>
      )}

      <section className="space-y-5 text-[17px] leading-[1.7] text-black/85">
        {guide.outroParagraphs.map((p, i) => (
          <p key={i} dangerouslySetInnerHTML={renderMarkdownish(p)} />
        ))}
      </section>

      <section className="mt-14 border-t border-(--color-line) pt-8 text-sm text-(--color-muted)">
        Browse all shows on{" "}
        <Link href="/" className="underline underline-offset-4 hover:no-underline hover:text-(--color-accent)">
          tro
        </Link>
        . Listings refresh nightly from venue websites — open a{" "}
        <a
          href="https://github.com/pappapaolo/tro/issues/new"
          className="underline underline-offset-4 hover:no-underline hover:text-(--color-accent)"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub issue
        </a>{" "}
        if something looks wrong.
      </section>
    </article>
  );
}

function renderMarkdownish(s: string) {
  // Tiny **bold** swap — keeps the guide copy editable without full MDX.
  const safe = s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  return { __html: safe };
}

export type { Category };
