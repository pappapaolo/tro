import * as cheerio from "cheerio";

export type JsonLd = Record<string, unknown> | unknown[];

export function extractJsonLd(html: string): JsonLd[] {
  const $ = cheerio.load(html);
  const out: JsonLd[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    const raw = $(el).contents().text();
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      out.push(parsed);
    } catch {
      // tolerate broken JSON-LD blocks
    }
  });
  return out;
}

interface LooseObj {
  [k: string]: unknown;
}

export function* iterEvents(
  ld: JsonLd[],
): Generator<LooseObj, void, unknown> {
  for (const node of ld) {
    yield* walkForType(node, "Event");
  }
}

function* walkForType(
  node: unknown,
  type: string,
): Generator<LooseObj, void, unknown> {
  if (Array.isArray(node)) {
    for (const item of node) yield* walkForType(item, type);
    return;
  }
  if (!node || typeof node !== "object") return;
  const o = node as LooseObj;
  const t = o["@type"];
  const matches =
    t === type ||
    (Array.isArray(t) && t.includes(type)) ||
    (typeof t === "string" && t.toLowerCase().includes(type.toLowerCase()));
  if (matches) yield o;
  if (Array.isArray(o["@graph"])) {
    yield* walkForType(o["@graph"], type);
  }
  for (const v of Object.values(o)) {
    if (v && typeof v === "object") yield* walkForType(v, type);
  }
}
