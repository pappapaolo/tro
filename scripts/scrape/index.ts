import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { scrape as scrapeScala } from "./sources/scala";
import { scrape as scrapeParenti } from "./sources/parenti";
import { scrape as scrapeElfo } from "./sources/elfo";
import { scrape as scrapeManzoni } from "./sources/manzoni";
import { scrape as scrapeManual } from "./sources/manual";
import type { ScrapedEvent } from "./lib/normalize";

const here = dirname(fileURLToPath(import.meta.url));
const OUTPUT = join(here, "..", "..", "src", "data", "events.json");

const SOURCES: { name: string; run: () => Promise<ScrapedEvent[]> }[] = [
  { name: "scala", run: scrapeScala },
  { name: "parenti", run: scrapeParenti },
  { name: "elfo", run: scrapeElfo },
  { name: "manzoni", run: scrapeManzoni },
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
    .sort(
      (a, b) =>
        new Date(a.performances[0]?.start ?? 0).getTime() -
        new Date(b.performances[0]?.start ?? 0).getTime(),
    );

  await writeFile(OUTPUT, JSON.stringify(merged, null, 2) + "\n", "utf8");
  console.log(`\n→ wrote ${merged.length} events to ${OUTPUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
