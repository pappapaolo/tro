import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getUpcomingEvents, getVenueBySlug } from "@/lib/events";
import EventGrid from "@/components/EventGrid";
import type { Event, Category } from "@/lib/types";

// Helper: returns true when an event's venue is in the given city.
const inCity = (cityName: "Milan" | "Rome") => (e: Event) =>
  getVenueBySlug(e.venueSlug)?.city === cityName;

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
  // ─────────────────────────────────────────────────────────────
  // Italian-language landing pages — built for Italian search queries
  // ("spettacoli teatro Milano", "opera lirica Roma", etc.).
  // Each one filters the live catalogue by category + city so the page
  // always has fresh listings to show alongside the keyword copy.
  // ─────────────────────────────────────────────────────────────
  {
    slug: "spettacoli-teatro-milano",
    title: "Spettacoli di teatro a Milano",
    metaDescription:
      "Spettacoli di teatro a Milano: cartellone live di Piccolo Teatro, Teatro Franco Parenti, Elfo Puccini, Manzoni e altri. Biglietti direttamente dal teatro, senza commissioni.",
    intro:
      "Tutto il teatro a Milano in un solo posto. Il cartellone live dei principali teatri della città — Piccolo Teatro, Teatro Franco Parenti, Teatro Elfo Puccini, Teatro Manzoni, Teatro Filodrammatici, Teatro Carcano, Teatro Nazionale — aggiornato ogni notte dai siti ufficiali. Qui sotto trovi tutti gli spettacoli di prosa in arrivo a Milano, con date, prezzi e link diretti alla biglietteria del teatro.",
    filter: (e) => e.category === "theater" && inCity("Milan")(e),
    outroParagraphs: [
      "**Dove si fa il teatro a Milano.** Il Piccolo è la casa storica del teatro di prosa milanese, con tre sale (Strehler, Studio Melato, Grassi). Teatro Franco Parenti, Elfo Puccini e Manzoni alternano produzioni proprie e tournée nazionali. Filodrammatici, Carcano e Outoff lavorano su scale più piccole con scelte più sperimentali.",
      "**Quando andare.** La stagione teatrale milanese va da ottobre a maggio, con un picco fra novembre e marzo. Le anteprime e le repliche infrasettimanali sono di solito le più semplici da prenotare. Tante prime sono il martedì o il mercoledì.",
      "**Biglietti.** tro non vende biglietti: ogni spettacolo rimanda direttamente alla biglietteria del teatro. Niente commissioni, niente intermediari. Molti teatri milanesi hanno tariffe under 26 / under 30 e abbonamenti che fanno la differenza se vai più di una volta a stagione.",
    ],
  },
  {
    slug: "spettacoli-teatro-roma",
    title: "Spettacoli di teatro a Roma",
    metaDescription:
      "Spettacoli di teatro a Roma: cartellone live dei principali teatri della capitale. Biglietti direttamente dal teatro, senza commissioni.",
    intro:
      "Il teatro a Roma in un'unica pagina. tro raccoglie il cartellone live dei principali palcoscenici della capitale e lo aggiorna ogni notte dai siti dei teatri. Qui sotto trovi tutti gli spettacoli di prosa in arrivo a Roma, con date, prezzi e link diretti alla biglietteria ufficiale.",
    filter: (e) => e.category === "theater" && inCity("Rome")(e),
    outroParagraphs: [
      "**La scena teatrale romana.** Roma alterna grandi stabili pubblici, spazi off e teatri di tradizione con produzioni proprie e ospitalità nazionali. La stagione va da ottobre a maggio, con un fitto cartellone invernale.",
      "**Biglietti.** Su tro ogni link porta direttamente al teatro. Non rivendiamo, non aggiungiamo costi, non prendiamo percentuali. Molti teatri romani offrono tariffe ridotte per under 30 e abbonamenti annuali convenienti.",
    ],
  },
  {
    slug: "opera-lirica-milano",
    title: "Opera lirica a Milano",
    metaDescription:
      "Opera lirica a Milano: cartellone live del Teatro alla Scala e degli altri teatri d'opera milanesi. Biglietti direttamente dal teatro.",
    intro:
      "L'opera lirica a Milano significa prima di tutto Teatro alla Scala — uno dei teatri d'opera più importanti al mondo — ma il cartellone milanese non si esaurisce in piazza della Scala. Qui sotto trovi tutta l'opera in arrivo a Milano, con date, prezzi e link diretti alla biglietteria.",
    filter: (e) => e.category === "opera" && inCity("Milan")(e),
    outroParagraphs: [
      "**Teatro alla Scala.** La stagione lirica della Scala va da dicembre (con la celebre Prima del 7 dicembre, Sant'Ambrogio) a novembre dell'anno successivo, e copre il grande repertorio italiano (Verdi, Puccini, Rossini, Bellini, Donizetti) accanto a Wagner, Strauss e nuove produzioni.",
      "**Come comprare i biglietti.** Le vendite aprono circa due mesi prima di ogni titolo. I posti più economici (le gallerie) costano intorno ai €20–30; platea e palchi salgono fino a diverse centinaia. Esistono canali under 30 con sconti importanti e abbonamenti per chi va spesso.",
      "**Altri teatri d'opera a Milano.** Teatro Dal Verme e alcune produzioni al Teatro Nazionale ospitano allestimenti operistici a prezzi più accessibili — vale la pena tenerli d'occhio.",
    ],
  },
  {
    slug: "opera-lirica-roma",
    title: "Opera lirica a Roma",
    metaDescription:
      "Opera lirica a Roma: cartellone live del Teatro dell'Opera di Roma e delle Terme di Caracalla. Biglietti direttamente dal teatro.",
    intro:
      "L'opera lirica a Roma ruota intorno al Teatro dell'Opera, una delle istituzioni musicali più importanti del paese. Stagione invernale al Costanzi e, d'estate, l'esperienza unica del cartellone alle Terme di Caracalla. Qui sotto: tutte le opere in arrivo a Roma su tro.",
    filter: (e) => e.category === "opera" && inCity("Rome")(e),
    outroParagraphs: [
      "**Stagione invernale al Costanzi.** Da ottobre a giugno il Teatro dell'Opera di Roma allestisce il grande repertorio lirico italiano e internazionale al Teatro Costanzi, in via Firenze.",
      "**Estate alle Terme di Caracalla.** Da giugno ad agosto il cartellone si sposta nello spazio archeologico delle Terme di Caracalla — un'esperienza che vale il viaggio per chi è di passaggio a Roma.",
      "**Biglietti.** tro rimanda sempre al sito del teatro. Niente commissioni di vendita, niente intermediari.",
    ],
  },
  {
    slug: "balletto-milano",
    title: "Balletto a Milano",
    metaDescription:
      "Balletto a Milano: cartellone live del Corpo di Ballo della Scala e degli altri palcoscenici milanesi. Biglietti direttamente dal teatro.",
    intro:
      "Il balletto a Milano gira intorno al Corpo di Ballo del Teatro alla Scala, una delle compagnie di danza classica più importanti d'Europa. La stagione alterna classici di repertorio (Lago dei cigni, Giselle, Don Chisciotte) e serate miste (Balanchine, Bausch, Naharin), con tournée internazionali ospitate negli altri teatri della città.",
    filter: (e) => e.category === "ballet" && inCity("Milan")(e),
    outroParagraphs: [
      "**Corpo di Ballo della Scala.** La compagnia residente al Piermarini è il motore del balletto milanese. La stagione include sempre almeno un grande titolo classico e una serata mista contemporanea.",
      "**Altri palcoscenici.** Teatro Arcimboldi, Teatro degli Arcimboldi e altre sale milanesi ospitano regolarmente tournée di compagnie internazionali — un'occasione per vedere a Milano lavori che altrimenti non passerebbero dalla città.",
    ],
  },
  {
    slug: "balletto-roma",
    title: "Balletto a Roma",
    metaDescription:
      "Balletto a Roma: cartellone live del Corpo di Ballo del Teatro dell'Opera e degli altri palcoscenici romani. Biglietti direttamente dal teatro.",
    intro:
      "Il balletto a Roma si concentra al Teatro dell'Opera, che ospita una compagnia stabile (il Corpo di Ballo del Teatro dell'Opera di Roma) e una stagione di danza che alterna repertorio classico e serate contemporanee. Qui sotto trovi tutto il balletto in arrivo a Roma su tro.",
    filter: (e) => e.category === "ballet" && inCity("Rome")(e),
    outroParagraphs: [
      "**Corpo di Ballo del Teatro dell'Opera.** La compagnia residente è la spina dorsale della stagione di danza romana. Programmazione regolare di titoli classici e creazioni contemporanee.",
      "**Tournée.** Auditorium Parco della Musica e altri spazi capitolini ospitano nel corso dell'anno compagnie italiane e internazionali in tournée.",
    ],
  },
  {
    slug: "concerti-milano",
    title: "Concerti a Milano",
    metaDescription:
      "Concerti a Milano: cartellone live di musica classica, jazz e contemporanea — dal Teatro Dal Verme alla Società del Quartetto. Biglietti direttamente dalla sala.",
    intro:
      "I concerti di musica classica e contemporanea a Milano in un'unica pagina. tro raccoglie il cartellone live dei principali auditorium milanesi e lo aggiorna ogni notte dai siti delle sale. Qui sotto: tutti i concerti in arrivo a Milano, dai grandi sinfonici alla cameristica.",
    filter: (e) => e.category === "concert" && inCity("Milan")(e),
    outroParagraphs: [
      "**Dove si fanno i concerti a Milano.** La Scala ospita la stagione sinfonica della Filarmonica della Scala. Il Conservatorio di Milano alterna concerti propri e ospitalità, mentre Teatro Dal Verme è la casa dei Pomeriggi Musicali. Spazi più piccoli (Auditorium, fondazioni) coprono cameristica e contemporanea.",
      "**Biglietti.** Su tro ogni link va direttamente alla sala. Molte stagioni concertistiche milanesi offrono abbonamenti molto convenienti per chi va a più appuntamenti.",
    ],
  },
  {
    slug: "concerti-roma",
    title: "Concerti a Roma",
    metaDescription:
      "Concerti a Roma: cartellone live dell'Auditorium Parco della Musica e delle altre sale capitoline. Biglietti direttamente dalla sala.",
    intro:
      "I concerti a Roma cominciano dall'Auditorium Parco della Musica, il polo musicale principale della capitale — ma la scena romana è molto più ampia, fra musica antica, jazz, contemporanea e sinfonica. Qui sotto trovi tutti i concerti in arrivo a Roma su tro.",
    filter: (e) => e.category === "concert" && inCity("Rome")(e),
    outroParagraphs: [
      "**Auditorium Parco della Musica.** Sede della Accademia Nazionale di Santa Cecilia, ospita la grande stagione sinfonica e cameristica romana, oltre a un cartellone molto vario di musica jazz, pop e world.",
      "**Altre sale.** Diverse chiese del centro storico ospitano regolari stagioni di musica antica e sacra; il Teatro dell'Opera occasionalmente apre il cartellone a concerti sinfonici.",
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
      <p className="text-[17px] leading-[1.7] text-fg/90 mb-10">
        {guide.intro}
      </p>

      {matches.length > 0 && (
        <section className="mb-14">
          <h2 className="font-display text-2xl mb-5">Upcoming on tro</h2>
          <EventGrid events={matches} />
        </section>
      )}

      <section className="space-y-5 text-[17px] leading-[1.7] text-fg/85">
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
