# Hooking up a custom domain

The site is at `tro-eight.vercel.app` — auto-named by Vercel. To swap in a real domain:

## 1. Pick + buy a domain

Suggestions that read well next to the wordmark:
- `tro.show`  ← strongest, on-brand
- `tro.it`    ← ✗ may be taken; reads Italian
- `tro.fm`    ← echoes dice.fm, available
- `tro.live`  ← clear meaning
- `gotro.app` ← if `.show` is out of budget

Buy through whoever you prefer (Cloudflare Registrar, Namecheap, GoDaddy, Porkbun…). Cloudflare and Porkbun are cheapest. Vercel can also register on your behalf via `vercel domains buy <name>`.

## 2. Point the domain at Vercel

```bash
cd ~/Projects/tro
vercel domains add tro.show          # claims it on the tro project
```

Then either:
- **If you registered the domain on Vercel** → DNS is already wired. Skip to step 3.
- **If you registered elsewhere** → Vercel will print the records you need to add:
  - `A` record for the apex → `76.76.21.21`
  - `CNAME` record for `www` → `cname.vercel-dns.com`

  Add those in your registrar's DNS panel. Propagation usually takes minutes, up to a few hours.

## 3. Set the canonical URL in code

Once the domain is live, update the sitemap base + OG image generator to reference it:

```bash
# In Vercel project settings → Environment Variables, add:
NEXT_PUBLIC_SITE_URL=https://tro.show
```

`src/app/sitemap.ts` already reads `NEXT_PUBLIC_SITE_URL` and falls back to the auto-named host. No code change needed beyond setting the env var and redeploying.

## 4. Verify

```bash
curl -sI https://tro.show | head -2
curl -sI https://tro.show/sitemap.xml | head -2
```

Both should return `200`. Share previews (iMessage / Slack / Twitter) should pick up the OG image from `opengraph-image.tsx`. Test at https://www.opengraph.xyz/ by pasting an event URL.
