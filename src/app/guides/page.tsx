import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Guides — Best theater, opera, ballet in Milan",
  description:
    "Hand-curated guides to the best theater, opera and ballet in Milan. Updated every season.",
  alternates: { canonical: "/guides" },
};

const GUIDES = [
  {
    slug: "best-opera-milan",
    title: "Best opera in Milan this season",
    blurb:
      "From the canonical Verdi and Puccini staples at La Scala to small-venue gems — a curated list.",
  },
  {
    slug: "best-ballet-milan",
    title: "Best ballet in Milan",
    blurb:
      "Where to see ballet in Milan — Teatro alla Scala, touring companies, contemporary stages.",
  },
  {
    slug: "theater-milan-this-week",
    title: "Theater in Milan this week",
    blurb: "What's on at Piccolo, Parenti, Elfo, Manzoni right now.",
  },
  {
    slug: "first-time-la-scala",
    title: "First time at La Scala — what to know",
    blurb:
      "How tickets work, dress code, where to sit, what to see if it's your first opera.",
  },
];

export default function GuidesIndex() {
  return (
    <article>
      <h1 className="font-display text-4xl sm:text-5xl leading-[1.05] mb-3">
        Guides
      </h1>
      <p className="text-(--color-muted) mb-10">
        Short, hand-written guides to Milan's performing arts. We update them
        every season.
      </p>
      <ul className="divide-y divide-(--color-line) border-y border-(--color-line)">
        {GUIDES.map((g) => (
          <li key={g.slug} className="py-5">
            <Link
              href={`/guides/${g.slug}`}
              className="block hover:text-(--color-accent) transition-colors"
            >
              <h2 className="font-display text-xl sm:text-2xl mb-1">
                {g.title}
              </h2>
              <p className="text-sm text-(--color-muted)">{g.blurb}</p>
            </Link>
          </li>
        ))}
      </ul>
    </article>
  );
}
