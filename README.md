# Property Showcase — maintainer notes

A mobile-first real estate showcase app (React, TypeScript, Vite, Tailwind CSS) that installs as a
PWA and deploys to GitHub Pages. Each customer gets their own repository and URL. This repository
ships as the **Willow & Stone Realty** demo (fictional agency, agent and listings).

## Run locally

Requires Node 20.19+ (CI uses Node 24).

```bash
npm ci
npm run dev             # http://localhost:5173 (no service worker in dev)
npm test                # unit tests + content validation
npm run build           # production build → dist/
npm run preview:pages   # serves dist/ like GitHub Pages at http://localhost:4173/property-showcase/
npm run verify          # full browser check of a fresh build (first run: npx playwright install chromium)
```

`npm run verify` builds the app, serves it under repository subpaths and at a root domain, and runs
40 checks: asset paths, deep links and refreshes, manifest and service-worker scope, offline mode,
the update prompt, isolation between two apps on one origin, calculator edge cases, gallery and
story gestures,
map filters and fallback, saved homes, compare, notes, inquiry flow, QR destination, printing,
overflow at 320–1440px, console errors and customer-mode validation.

## Deploy a site

1. Create a repository under your account. Easiest: mark this repo as a **Template** (Settings →
   General), then use **Use this template** for each customer. The repository name sets the URL:
   `https://USERNAME.github.io/REPOSITORY/`. A repo named `USERNAME.github.io` deploys at the root.
2. In the new repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Push to `main`. `.github/workflows/deploy.yml` runs the tests, builds and deploys. The run summary
   shows the live URL. Re-run it any time from the Actions tab (**Run workflow**).
4. Optional custom domain: **Settings → Pages → Custom domain** (plus DNS at the registrar), then
   re-run the workflow so QR codes and social previews use the new domain.
5. Send the customer the URL and the QR code (each property page has a **QR code** download).

**Public URL:** QR codes, share links and social previews use, in order: `site.publicUrl` in
`src/config/site.ts`, the Pages URL the workflow reads from your repo settings (custom domain
included), then `https://OWNER.github.io/REPO/`. Localhost is never used. Without a public URL, demo
builds hide the QR code and customer builds fail.

Routing is hash-based (`#/homes/<id>`), so shared links and refreshes work without server rules, and
asset paths are relative, so one build works under a subpath, at a root site or on a custom domain.
Social previews are site-level only; hash routes can't have per-property previews.

## Configure a customer site

All content lives in typed files in `src/config/` — components contain no customer content.

| File | Contents |
| --- | --- |
| `site.ts` | `appId`, **`demoMode`**, `publicUrl`, titles, app name, locale, currency, time zone, featured listing |
| `branding.ts` | Brokerage name, wordmark, tagline, colors, vector mark (also used to generate icons), legal lines |
| `agent.ts` | Agent profile, photo, contact numbers (E.164), email, scheduling link, credentials |
| `properties.ts` | Listings: facts, copy, highlights, photos, feature stories, tour embed, open houses |
| `neighborhoods.ts` | Map center/zoom, optional home marker, nearby places |
| `integrations.ts` | Map tile provider and attribution, inquiry form endpoint |

Checklist for a new customer:

1. `site.ts`: give a new unique `appId` (e.g. `jane-smith-homes`), set `demoMode: false`, update titles.
2. `branding.ts`, `agent.ts`: real brokerage and agent details; put required disclosures (license
   text, Equal Housing Opportunity, etc.) in `branding.legal` and `agent.credentials`.
3. `properties.ts`: real listings with `isFictional: false`. `tour` accepts YouTube/Vimeo/Matterport
   embed URLs and is hidden when omitted.
   **Feature stories** need no setup: each listing gets a phone-style story built from its cover photo,
   highlights and remaining photos (up to 8), any upcoming open house and a closing contact slide.
   To hand-pick the sequence, add `stories: { slides: [{ photoId, kicker, title, text }] }`;
   `slideSeconds` (3–20, default 6) sets the pace and `enabled: false` turns stories off. Open houses use fixed `YYYY-MM-DD` dates and hide once past.
4. `neighborhoods.ts`: real places with coordinates, `sample: false`, `isSample: false`, and `home`
   coordinates if the listing address may be shown. Directions links appear only for real places.
5. Photos: see below. Delete the demo folders in `public/media/` (and optionally `art/` and
   `scripts/render-artwork.mjs`, which only produce the demo illustrations).

With `demoMode: false`, `npm test` and the build **fail** with a list of anything still fictional or
placeholder: 555-01xx numbers, `example.com` emails, demo names, fictional listings, demo artwork,
sample places, the demo `appId`, a missing public URL, missing image files or broken references.
With `demoMode: true` the site shows the demo notice and disables calls, texts, email and form
submission (visitors see a labeled preview instead).

## Photos

1. Put licensed originals in `photos-src/<property-id>/` (agent headshot: `photos-src/agent/`).
2. `npm run photos` (or `npm run photos -- <property-id>`). It writes auto-rotated WebP files at
   640/1280/1920px to `public/media/<property-id>/`, strips metadata (including GPS) and prints
   config entries to paste into `properties.ts`. Fill in `alt`, `caption` and `credit`.
3. Agent photo: `agent.photo = 'media/agent/<file>-640.webp'`.

`photos-src/` is git-ignored to keep repositories small.

## Inquiries

GitHub Pages only serves static files; it cannot receive form submissions.

- **No endpoint (default):** the form validates input and opens a pre-filled email draft to
  `agent.contact.email`. The page says the message is sent only when the visitor presses Send.
- **Direct delivery:** create a form at a form-backend service (Formspree, Basin, Getform, or your own
  serverless function) and set `integrations.inquiry.endpoint` to its HTTPS URL. `format` is `json` or
  `form`; `extraFields` adds static fields (e.g. `_subject`). The site shows "Message sent" only after
  a 2xx response, otherwise an error with the agent's email. Restrict the endpoint to the site's
  domain and enable the service's spam filtering (a hidden honeypot field `company` is included).
- `agent.contact.schedulingUrl` (Calendly, etc.) adds a booking link to tour requests.

The service worker never touches POST requests, so submissions are never cached.

## Offline and updates

The service worker is generated at build time from `build/service-worker.js`. It precaches the app
shell, fonts, icons and the featured hero photo, keeps up to 60 viewed listing images, never caches
map tiles (unless `allowServiceWorkerCaching` is enabled for a provider that permits it) and shows a
**Refresh** prompt when a new deployment is available. Cache names and on-device storage keys include
the `appId` and the site path, so customer apps on the same `USERNAME.github.io` origin never read or
clear each other's data. A root-site app only intercepts its own entry page and files.

## Review before commercial use

- **GitHub Pages terms.** GitHub's
  [Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)
  say Pages is not intended as free hosting for an online business or a site primarily directed at
  commercial transactions, and set soft limits (1 GB per site, 100 GB/month bandwidth). Review the
  [Terms of Service](https://docs.github.com/en/site-policy/github-terms/github-terms-of-service)
  for hosting paid client sites. Pages from **private** repositories requires a paid plan; with a
  public repository, the code and listing content are publicly visible on GitHub. `dist/` is plain
  static files, so the same build also runs on Cloudflare Pages, Netlify, Vercel or S3.
- **Map tiles.** The demo uses OpenStreetMap's standard tiles, which are run on donated servers. The
  [tile usage policy](https://operations.osmfoundation.org/policies/tiles/) requires attribution,
  forbids heavy use and bulk/offline caching, and can block traffic at any time. For customer sites
  use a commercial provider (e.g. MapTiler, Stadia Maps, Thunderforest, Mapbox): set `tileUrl`,
  `attribution` and `maxZoom`, and restrict the API key to the site's domain (keys are visible in a
  static site).
- **Form services and privacy.** Check the provider's pricing, data retention and location; mention
  inquiry handling in the customer's privacy notice.
- **Real estate advertising rules.** Brokerage identification, license disclosures, fair housing and
  MLS/IDX rules vary by state and MLS; the agent/brokerage is responsible for the content you publish.
- **Photos.** Listing photos are often licensed to the MLS or photographer; get written permission.
- **Open source.** Each build includes `third-party-licenses.md` (React, Leaflet, qrcode, Lucide —
  all permissive — plus the SIL Open Font License for Cormorant Garamond and Inter). Directions links
  open Google Maps; no paid API, account, database or backend is required.
- **Demo artwork.** The demo uses original illustrations drawn in code for this project (`art/`)
  instead of stock photos. To demo with licensed photography instead, add it through `npm run photos`
  and set each photo's `credit` (source, author, license).

## Project layout

```
src/config/        content, types and validation (edit these per customer)
src/components/    UI (property sections, map, contact, layout, ui primitives)
src/pages/         property, browse, compare, saved, agent, about, not found
src/lib/           router, storage, mortgage math, PWA, QR, sharing, formatting
build/             Vite plugin (manifest, icons, social image, offline page, service worker)
scripts/           photos, Pages-style preview server, browser verification, demo artwork
art/               demo illustration sources
public/media/      optimized listing images
.github/workflows/ GitHub Pages deployment
```
