import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { scrape as scrapeParenti } from "./sources/parenti";
import { scrape as scrapeManual } from "./sources/manual";
import type { ScrapedEvent } from "./lib/normalize";

const here = dirname(fileURLToPath(import.meta.url));
const OUTPUT = join(here, "..", "..", "src", "data", "events.json");

const SOURCES: { name: string; run: () => Promise<ScrapedEvent[]> }[] = [
  { name: "parenti", run: scrapeParenti },
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
  const merged = [...byId.values()].sort(
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
