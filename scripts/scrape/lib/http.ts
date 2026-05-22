// La Scala 403s any UA that looks bot-shaped, so we send a real Chrome UA
// and the matching client-hint headers below. tro identifies itself via
// the From header for venue admins who care to look.
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

export interface FetchOpts {
  timeoutMs?: number;
  retries?: number;
}

export async function fetchHtml(
  url: string,
  opts: FetchOpts = {},
): Promise<string> {
  const { timeoutMs = 15000, retries = 1 } = opts;
  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        headers: {
          "user-agent": UA,
          accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "accept-language": "it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7",
          "accept-encoding": "gzip, deflate, br",
          "sec-ch-ua":
            '"Chromium";v="131", "Not_A Brand";v="24", "Google Chrome";v="131"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"macOS"',
          "sec-fetch-dest": "document",
          "sec-fetch-mode": "navigate",
          "sec-fetch-site": "none",
          "sec-fetch-user": "?1",
          "upgrade-insecure-requests": "1",
          from: "tro-bot@pappapaolo.com (https://github.com/pappapaolo/tro)",
        },
        redirect: "follow",
        signal: ctrl.signal,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
      return await res.text();
    } catch (err) {
      lastErr = err;
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 500 + attempt * 500));
      }
    } finally {
      clearTimeout(t);
    }
  }
  throw lastErr instanceof Error
    ? lastErr
    : new Error(`fetch failed: ${url}`);
}
