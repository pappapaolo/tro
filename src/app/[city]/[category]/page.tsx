import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Browse from "@/components/Browse";
import { getAllVenues, getUpcomingEvents } from "@/lib/events";
import {
  allCityCategoryPairs,
  findCategoryRoute,
  findCityRoute,
} from "@/lib/routes";

interface PageProps {
  params: Promise<{ city: string; category: string }>;
}

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://tro-eight.vercel.app";

export const dynamicParams = false;

export async function generateStaticParams() {
  return allCityCategoryPairs();
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { city: citySlug, category: catSlug } = await params;
  const city = findCityRoute(citySlug);
  const cat = findCategoryRoute(catSlug);
  if (!city || !cat) return {};

  // "Spettacoli di teatro a Milano", "Opera lirica a Roma", etc. —
  // exactly the queries we want to rank for, used as the page title.
  const title = `${cat.itLong} a ${city.it}`;
  const description = `${cat.itLong} a ${city.it}: cartellone live aggiornato dai siti dei teatri. Biglietti direttamente dal teatro, senza commissioni.`;
  const canonical = `/${city.slug}/${cat.slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      title,
      description,
      url: `${BASE_URL}${canonical}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function CityCategoryPage({ params }: PageProps) {
  const { city: citySlug, category: catSlug } = await params;
  const city = findCityRoute(citySlug);
  const cat = findCategoryRoute(catSlug);
  if (!city || !cat) notFound();

  const events = getUpcomingEvents();
  const venues = getAllVenues();

  // Heading + intro mirror the keyword targeting on the guides, but
  // here the listing IS the page — Browse drives the actual catalogue.
  const h1 = `${cat.itLong} a ${city.it}`;
  const intro = `Tutti i ${cat.it.toLowerCase()} a ${city.it} in arrivo, aggiornati ogni notte dai siti dei teatri. Date, prezzi e link diretti alla biglietteria del teatro.`;

  // schema.org CollectionPage helps Google understand this is a
  // category landing, not a duplicate of the home page.
  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: h1,
    description: intro,
    url: `${BASE_URL}/${city.slug}/${cat.slug}`,
    inLanguage: "it",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }}
      />
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 pt-8 sm:pt-12">
        <nav className="text-sm text-(--color-muted) mb-4" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-(--color-accent)">tro</Link>
          <span className="mx-2">·</span>
          <Link
            href={`/${city.slug}/teatro`}
            className="hover:text-(--color-accent)"
          >
            {city.it}
          </Link>
          <span className="mx-2">·</span>
          <span>{cat.itLong}</span>
        </nav>
        <h1 className="font-display text-4xl sm:text-6xl leading-[1.05] max-w-3xl mb-3">
          {h1}
        </h1>
        <p className="text-(--color-muted) max-w-xl">{intro}</p>
      </div>
      <Suspense fallback={<div className="h-screen" />}>
        <Browse
          events={events}
          venues={venues}
          initialCity={city.id}
          initialCategory={cat.id}
          hideHeading
        />
      </Suspense>
    </>
  );
}
