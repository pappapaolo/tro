const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 " +
  "(KHTML, like Gecko) Version/17.5 Safari/605.1.15 tro-bot/0.1 " +
  "(+https://github.com/pappapaolo/tro)";

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
          "accept-language": "it-IT,it;q=0.9,en;q=0.8",
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
