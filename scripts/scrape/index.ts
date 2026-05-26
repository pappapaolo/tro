import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { scrape as scrapeScala } from "./sources/scala";
import { scrape as scrapePiccolo } from "./sources/piccolo";
import { scrape as scrapeParenti } from "./sources/parenti";
import { scrape as scrapeElfo } from "./sources/elfo";
import { scrape as scrapeManzoni } from "./sources/manzoni";
import { scrape as scrapeAuditorium } from "./sources/auditorium";
import { scrape as scrapeArcimboldi } from "./sources/arcimboldi";
import { scrape as scrapeCarcano } from "./sources/carcano";
import { scrape as scrapeFilodrammatici } from "./sources/filodrammatici";
import { scrape as scrapeNazionale } from "./sources/nazionale";
import { scrape as scrapeOutoff } from "./sources/outoff";
import { scrape as scrapeManual } from "./sources/manual";
import { computeRank } from "./lib/rank";
import type { ScrapedEvent } from "./lib/normalize";

const here = dirname(fileURLToPath(import.meta.url));
const OUTPUT = join(here, "..", "..", "src", "data", "events.json");

const SOURCES: { name: string; run: () => Promise<ScrapedEvent[]> }[] = [
  { name: "scala", run: scrapeScala },
  { name: "piccolo", run: scrapePiccolo },
  { name: "parenti", run: scrapeParenti },
  { name: "elfo", run: scrapeElfo },
  { name: "manzoni", run: scrapeManzoni },
  { name: "carcano", run: scrapeCarcano },
  { name: "filodrammatici", run: scrapeFilodrammatici },
  { name: "nazionale", run: scrapeNazionale },
  { name: "outoff", run: scrapeOutoff },
  { name: "auditorium", run: scrapeAuditorium },
  { name: "arcimboldi", run: scrapeArcimboldi },
  { name: "manual", run: scrapeManual },
];

async function main() {
  const all: ScrapedEvent[] = [];
  for (const s of SOURCES) {
    try {
      const events = await s.run();
      all.push(...events);
    } catch (err) {
      console.error(`[${s.name}] failed:`, err);
    }
  }

  // Dedupe by id (manual edits can override scraped ones with same id)
  const byId = new Map<string, ScrapedEvent>();
  for (const e of all) byId.set(e.id, e);

  // Drop events whose entire run ended more than 14 days ago. Keeps the
  // index focused on what people can actually go see now.
  const cutoff = Date.now() - 14 * 24 * 60 * 60 * 1000;
  const merged = [...byId.values()]
    .filter((e) => {
      const last = e.performances[e.performances.length - 1];
      if (!last) return false;
      return new Date(last.end ?? last.start).getTime() >= cutoff;
    })
    .map((e) => ({ ...e, rank: e.rank ?? computeRank(e) }))
    .sort((a, b) => {
      // Primary: rank desc. Tiebreak: earliest start first.
      const dr = (b.rank ?? 0) - (a.rank ?? 0);
      if (dr !== 0) return dr;
      return (
        new Date(a.performances[0]?.start ?? 0).getTime() -
        new Date(b.performances[0]?.start ?? 0).getTime()
      );
    });

  await writeFile(OUTPUT, JSON.stringify(merged, null, 2) + "\n", "utf8");
  console.log(`\n→ wrote ${merged.length} events to ${OUTPUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
