import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Guide — Spettacoli teatro Milano e Roma, opera, balletto, concerti",
  description:
    "Guide a teatro, opera, balletto e concerti a Milano e a Roma. Cartellone live aggiornato dai siti dei teatri, biglietti direttamente dalla biglietteria.",
  alternates: { canonical: "/guides" },
};

const GUIDES_EN = [
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

const GUIDES_IT = [
  {
    slug: "spettacoli-teatro-milano",
    title: "Spettacoli di teatro a Milano",
    blurb:
      "Cartellone live di Piccolo, Franco Parenti, Elfo Puccini, Manzoni e altri.",
  },
  {
    slug: "spettacoli-teatro-roma",
    title: "Spettacoli di teatro a Roma",
    blurb: "Cartellone live dei principali teatri di prosa romani.",
  },
  {
    slug: "opera-lirica-milano",
    title: "Opera lirica a Milano",
    blurb: "La stagione del Teatro alla Scala e altri teatri d'opera milanesi.",
  },
  {
    slug: "opera-lirica-roma",
    title: "Opera lirica a Roma",
    blurb:
      "Teatro dell'Opera di Roma, dal Costanzi alle Terme di Caracalla.",
  },
  {
    slug: "balletto-milano",
    title: "Balletto a Milano",
    blurb: "Corpo di Ballo della Scala e tournée internazionali.",
  },
  {
    slug: "balletto-roma",
    title: "Balletto a Roma",
    blurb: "Corpo di Ballo del Teatro dell'Opera e tournée.",
  },
  {
    slug: "concerti-milano",
    title: "Concerti a Milano",
    blurb: "Musica classica, jazz e contemporanea — dalla Scala al Dal Verme.",
  },
  {
    slug: "concerti-roma",
    title: "Concerti a Roma",
    blurb:
      "Auditorium Parco della Musica e le altre sale concertistiche romane.",
  },
];

export default function GuidesIndex() {
  return (
    <article className="mx-auto max-w-[680px] px-4 sm:px-6 pt-12 pb-20">
      <h1 className="font-display text-4xl sm:text-5xl leading-[1.05] mb-3">
        Guide
      </h1>
      <p className="text-(--color-muted) mb-10">
        Guide brevi a teatro, opera, balletto e concerti a Milano e a Roma.
        Aggiornate ogni stagione.
      </p>

      <h2 className="font-display text-xl sm:text-2xl mt-4 mb-3">
        Categorie per città
      </h2>
      <ul className="divide-y divide-(--color-line) border-y border-(--color-line) mb-12">
        {GUIDES_IT.map((g) => (
          <li key={g.slug} className="py-5">
            <Link
              href={`/guides/${g.slug}`}
              className="block hover:text-(--color-accent) transition-colors"
            >
              <h3 className="font-display text-xl sm:text-2xl mb-1">
                {g.title}
              </h3>
              <p className="text-sm text-(--color-muted)">{g.blurb}</p>
            </Link>
          </li>
        ))}
      </ul>

      <h2 className="font-display text-xl sm:text-2xl mt-4 mb-3">
        Approfondimenti
      </h2>
      <ul className="divide-y divide-(--color-line) border-y border-(--color-line)">
        {GUIDES_EN.map((g) => (
          <li key={g.slug} className="py-5">
            <Link
              href={`/guides/${g.slug}`}
              className="block hover:text-(--color-accent) transition-colors"
            >
              <h3 className="font-display text-xl sm:text-2xl mb-1">
                {g.title}
              </h3>
              <p className="text-sm text-(--color-muted)">{g.blurb}</p>
            </Link>
          </li>
        ))}
      </ul>
    </article>
  );
}
