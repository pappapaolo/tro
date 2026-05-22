import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "What tro is and why it exists.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-[680px] px-4 sm:px-6 pt-12 pb-20 text-[17px] leading-[1.7]">
      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-6">
        About tro
      </h1>
      <p className="text-(--color-muted) mb-6">
        tro is an aggregator for the performing arts in Milan — theater, opera,
        ballet and dance. Today every venue has its own site, its own calendar
        and its own ticketing flow. Finding what&apos;s on tonight means
        clicking through fifteen tabs. tro puts it in one place.
      </p>
      <p className="text-(--color-muted) mb-6">
        We don&apos;t sell tickets. Each event links out to the venue&apos;s own
        ticket page, so you pay the venue directly. No markup, no middleman.
      </p>
      <h2 className="text-xl font-semibold mt-12 mb-3">How the listings get here</h2>
      <p className="text-(--color-muted) mb-6">
        Most events are scraped from venue websites — the same listings the
        venues publish themselves. We refresh regularly. If something is wrong
        or missing,{" "}
        <a
          href="https://github.com/pappapaolo/tro/issues/new"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4 hover:no-underline"
        >
          open an issue
        </a>
        .
      </p>
      <h2 className="text-xl font-semibold mt-12 mb-3">Roadmap</h2>
      <ul className="text-(--color-muted) list-disc pl-6 space-y-2">
        <li>More venues, beyond the initial 6.</li>
        <li>Saved events that sync across your devices.</li>
        <li>Multi-city, starting with Rome, Florence, Naples.</li>
        <li>Native iOS app (today it&apos;s a PWA — works the same once installed).</li>
      </ul>
    </div>
  );
}
