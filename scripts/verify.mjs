/**
 * End-to-end verification of a production build, run in headless Chromium.
 *
 *   npm run verify
 *
 * Builds the app twice (plus a second app with a different id), serves them the way
 * GitHub Pages does under repository subpaths on ONE origin, and checks: subpath
 * assets, hash routes and refreshes, images and icons, manifest and service-worker
 * scope, calculator edge cases, gallery (keyboard, mouse and touch swipe), map filters
 * and fallback, saved homes, notes and comparison, inquiry flow, QR destination,
 * offline mode, update prompt, isolation between apps, layout overflow, console
 * errors, reduced motion, printing, and customer-mode validation.
 *
 * First run on a new machine: `npx playwright install chromium`
 * (or set CHROMIUM_PATH to an existing Chromium binary).
 */
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import jsQR from 'jsqr';
import { chromium } from 'playwright';

const ROOT = path.resolve(import.meta.dirname, '..');
const PORT = Number(process.env.PORT || 4321);
const ORIGIN = `http://localhost:${PORT}`;
const REPO_A = 'verify-app';
const REPO_B = 'second-app';
const PUBLIC_A = `https://showcase-check.github.io/${REPO_A}/`;
const BASE_A = `${ORIGIN}/${REPO_A}/`;
const BASE_B = `${ORIGIN}/${REPO_B}/`;
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'showcase-verify-'));
const results = [];
const log = (...a) => console.log(...a);

// ---------------------------------------------------------------------------
// Builds
// ---------------------------------------------------------------------------
const viteBin = path.join(ROOT, 'node_modules/vite/bin/vite.js');
function build(cwd, outDir, env = {}) {
  const r = spawnSync(process.execPath, [viteBin, 'build', '--outDir', outDir, '--emptyOutDir', '--logLevel', 'warn'], {
    cwd,
    env: { ...process.env, GITHUB_REPOSITORY: '', ...env },
    encoding: 'utf8',
  });
  return { ok: r.status === 0, output: `${r.stdout}\n${r.stderr}` };
}

function copyProject(dest) {
  fs.cpSync(ROOT, dest, {
    recursive: true,
    filter: (src) => !/[\\/](node_modules|dist|\.git|photos-src)([\\/]|$)/.test(path.relative(ROOT, src) ? `/${path.relative(ROOT, src)}` : ''),
  });
  fs.symlinkSync(path.join(ROOT, 'node_modules'), path.join(dest, 'node_modules'), 'dir');
}

function editFile(file, from, to) {
  const text = fs.readFileSync(file, 'utf8');
  if (!text.match(from)) throw new Error(`Pattern not found in ${file}: ${from}`);
  fs.writeFileSync(file, text.replace(from, to));
}

log('Building app A (twice, to test updates), app B and a customer-mode copy…');
const distA = path.join(tmp, 'a');
const distANext = path.join(tmp, 'a-next');
const liveA = path.join(tmp, 'live-a');
for (const [out] of [[distA], [distANext]]) {
  const r = build(ROOT, out, { SHOWCASE_PUBLIC_URL: PUBLIC_A });
  if (!r.ok) throw new Error(`Build failed:\n${r.output}`);
}
fs.cpSync(distA, liveA, { recursive: true });

const srcB = path.join(tmp, 'b-src');
copyProject(srcB);
editFile(path.join(srcB, 'src/config/site.ts'), /appId: [^,]+,/, "appId: 'verify-second-app',");
const distB = path.join(tmp, 'b');
const buildB = build(srcB, distB, { SHOWCASE_PUBLIC_URL: `https://showcase-check.github.io/${REPO_B}/` });
if (!buildB.ok) throw new Error(`Build B failed:\n${buildB.output}`);

const srcC = path.join(tmp, 'c-src');
copyProject(srcC);
editFile(path.join(srcC, 'src/config/site.ts'), /demoMode: true,/, 'demoMode: false,');
const customerBuild = build(srcC, path.join(tmp, 'c'), { SHOWCASE_PUBLIC_URL: 'https://showcase-check.github.io/customer/' });

// ---------------------------------------------------------------------------
// GitHub Pages-like server: several apps on one origin
// ---------------------------------------------------------------------------
const mounts = [
  { prefix: `/${REPO_A}/`, dir: liveA },
  { prefix: `/${REPO_B}/`, dir: distB },
];
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.woff': 'font/woff' };
let serverDown = false; // simulates losing the connection (Playwright's offline mode doesn't cover service workers)
const server = http.createServer((req, res) => {
  if (serverDown) return req.socket.destroy();
  const url = new URL(req.url, ORIGIN);
  const mount = mounts.find((m) => url.pathname.startsWith(m.prefix) || url.pathname === m.prefix.slice(0, -1));
  if (!mount) return res.writeHead(404).end('404');
  if (url.pathname === mount.prefix.slice(0, -1)) return res.writeHead(301, { Location: mount.prefix }).end();
  let rel = decodeURIComponent(url.pathname.slice(mount.prefix.length));
  if (!rel || rel.endsWith('/')) rel += 'index.html';
  const file = path.join(mount.dir, rel);
  if (!file.startsWith(mount.dir) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) return res.writeHead(404).end('404');
  res.writeHead(200, { 'Content-Type': types[path.extname(file)] ?? 'application/octet-stream', 'Cache-Control': 'no-cache' });
  fs.createReadStream(file).pipe(res);
});
await new Promise((resolve) => server.listen(PORT, resolve));

// A second origin serving the same build at the root, like a user site or custom domain.
const ROOT_ORIGIN = `http://localhost:${PORT + 1}`;
const rootServer = http.createServer((req, res) => {
  let rel = decodeURIComponent(new URL(req.url, ROOT_ORIGIN).pathname.slice(1));
  if (!rel || rel.endsWith('/')) rel += 'index.html';
  const file = path.join(distA, rel);
  if (!file.startsWith(distA) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) return res.writeHead(404).end('404');
  res.writeHead(200, { 'Content-Type': types[path.extname(file)] ?? 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise((resolve) => rootServer.listen(PORT + 1, resolve));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
async function check(name, fn) {
  try {
    const detail = await fn();
    results.push({ name, ok: true, detail });
    log(`  ✓ ${name}${detail ? ` — ${detail}` : ''}`);
  } catch (error) {
    results.push({ name, ok: false, detail: error.message });
    log(`  ✗ ${name} — ${error.message.split('\n')[0]}`);
  }
}
function expect(condition, message) {
  if (!condition) throw new Error(message);
}

const tilePng = await sharp({ create: { width: 256, height: 256, channels: 3, background: '#ebe6dc' } }).png().toBuffer();
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });

async function newContext(options = {}, { tiles = 'ok' } = {}) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 860 }, ...options });
  await context.route(/tile\.openstreetmap\.org/, (route) => (tiles === 'ok' ? route.fulfill({ body: tilePng, contentType: 'image/png' }) : route.abort()));
  const errors = [];
  context.on('page', (page) => {
    page.on('console', (m) => m.type() === 'error' && errors.push(`${page.url()} :: ${m.text()}`));
    page.on('pageerror', (e) => errors.push(`${page.url()} :: ${e.message}`));
  });
  return { context, errors };
}

async function scrollThrough(page) {
  const height = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < height; y += 500) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(40);
  }
  await page.waitForTimeout(500);
}

async function decodeSvgQr(svg) {
  const { data, info } = await sharp(Buffer.from(svg)).resize(600, 600).flatten({ background: '#ffffff' }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return jsQR(new Uint8ClampedArray(data), info.width, info.height)?.data ?? null;
}

async function decodePng(buffer) {
  const { data, info } = await sharp(buffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return jsQR(new Uint8ClampedArray(data), info.width, info.height)?.data ?? null;
}

async function waitForSw(page) {
  return page.evaluate(async () => {
    const reg = await navigator.serviceWorker.ready;
    return { scope: reg.scope, script: reg.active?.scriptURL };
  });
}

// ---------------------------------------------------------------------------
// Checks
// ---------------------------------------------------------------------------
log('\nDeployment & PWA');
{
  const { context, errors } = await newContext();
  const page = await context.newPage();
  const requests = [];
  page.on('response', (r) => requests.push({ url: r.url(), status: r.status() }));
  await page.goto(BASE_A, { waitUntil: 'networkidle' });

  await check('Repository-subpath deployment: every asset loads from /verify-app/', async () => {
    const local = requests.filter((r) => r.url.startsWith(ORIGIN));
    const outside = local.filter((r) => !new URL(r.url).pathname.startsWith(`/${REPO_A}/`));
    const failed = local.filter((r) => r.status >= 400);
    expect(!outside.length, `requests outside the subpath: ${outside.map((r) => r.url).join(', ')}`);
    expect(!failed.length, `failed requests: ${failed.map((r) => `${r.status} ${r.url}`).join(', ')}`);
    return `${local.length} requests, all under the subpath`;
  });

  await check('Manifest and icon URLs resolve under the subpath', async () => {
    const info = await page.evaluate(async () => {
      const href = document.querySelector('link[rel=manifest]').href;
      const manifest = await (await fetch(href)).json();
      const icons = await Promise.all(
        manifest.icons.map(async (i) => {
          const url = new URL(i.src, href).href;
          const r = await fetch(url);
          return { url, ok: r.ok, type: r.headers.get('content-type') };
        }),
      );
      const links = await Promise.all(
        [...document.querySelectorAll('link[rel~=icon], link[rel=apple-touch-icon]')].map(async (l) => ({ url: l.href, ok: (await fetch(l.href)).ok })),
      );
      return { start: new URL(manifest.start_url, href).href, scope: new URL(manifest.scope, href).href, display: manifest.display, icons, links };
    });
    expect(info.start === info.scope && info.scope.endsWith(`/${REPO_A}/`), `start_url/scope resolve to ${info.start} / ${info.scope}`);
    expect(info.display === 'standalone', 'display is not standalone');
    expect(info.icons.every((i) => i.ok && i.type === 'image/png'), `icon problems: ${JSON.stringify(info.icons)}`);
    expect(info.links.every((l) => l.ok), `favicon problems: ${JSON.stringify(info.links)}`);
    return `scope ${info.scope}, ${info.icons.length} manifest icons + ${info.links.length} link icons OK`;
  });

  await check('Service worker registers with the app folder as its scope', async () => {
    const sw = await waitForSw(page);
    expect(sw.scope === BASE_A, `scope is ${sw.scope}`);
    expect(sw.script === `${BASE_A}sw.js`, `script is ${sw.script}`);
    return sw.scope;
  });

  await check('Root site / custom domain: the same build works at the origin root', async () => {
    const rootPage = await context.newPage();
    const failures = [];
    rootPage.on('response', (r) => r.status() >= 400 && failures.push(`${r.status()} ${r.url()}`));
    await rootPage.goto(`${ROOT_ORIGIN}/#/homes/the-linden-townhome`, { waitUntil: 'networkidle' });
    await rootPage.getByRole('heading', { level: 1, name: 'The Linden Townhome' }).waitFor();
    const sw = await waitForSw(rootPage);
    expect(!failures.length, failures.join(', '));
    expect(sw.scope === `${ROOT_ORIGIN}/`, `scope ${sw.scope}`);
    await rootPage.close();
    return `scope ${sw.scope}`;
  });

  await check('Social preview metadata uses the public URL', async () => {
    const meta = await page.evaluate(() => ({
      image: document.querySelector('meta[property="og:image"]')?.content,
      url: document.querySelector('meta[property="og:url"]')?.content,
    }));
    expect(meta.image === `${PUBLIC_A}og-image.jpg` && meta.url === PUBLIC_A, JSON.stringify(meta));
    expect(fs.existsSync(path.join(distA, 'og-image.jpg')), 'og-image.jpg missing');
    return meta.image;
  });

  await check('No console errors on first load', async () => {
    expect(!errors.length, errors.join('\n'));
  });
  await context.close();
}

log('\nRoutes, images and layout');
{
  const { context, errors } = await newContext();
  const page = await context.newPage();
  await check('Shared property links open the right home, and survive a refresh', async () => {
    await page.goto(`${BASE_A}#/homes/the-linden-townhome`, { waitUntil: 'networkidle' });
    expect((await page.locator('h1').first().textContent()) === 'The Linden Townhome', 'wrong page for deep link');
    await page.reload({ waitUntil: 'networkidle' });
    expect((await page.locator('h1').first().textContent()) === 'The Linden Townhome', 'wrong page after refresh');
    await page.goto(`${BASE_A}#/homes/not-a-real-home`);
    await page.getByText('This home isn’t listed anymore').waitFor();
    await page.goto(`${BASE_A}#/compare`);
    await page.getByRole('heading', { level: 1, name: 'Compare homes' }).waitFor();
    return 'deep link, refresh, unknown home and page routes OK';
  });

  await check('All images load (no broken links)', async () => {
    let total = 0;
    for (const route of ['#/', '#/homes', '#/homes/hawthorne-ridge-residence']) {
      await page.goto(`${BASE_A}${route}`, { waitUntil: 'networkidle' });
      await scrollThrough(page);
      const r = await page.evaluate(() => {
        const imgs = [...document.querySelectorAll('img')].filter((i) => i.getAttribute('src'));
        return { total: imgs.length, broken: imgs.filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src) };
      });
      expect(!r.broken.length, `broken on ${route}: ${r.broken.join(', ')}`);
      total += r.total;
    }
    return `${total} images checked`;
  });

  await check('No horizontal overflow on any page at 320–1440px', async () => {
    const routes = ['#/', '#/homes', '#/compare', '#/saved', '#/agent', '#/about', '#/homes/the-linden-townhome', '#/nope'];
    const widths = [320, 390, 768, 1024, 1440];
    const problems = [];
    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 });
      for (const route of routes) {
        await page.goto(`${BASE_A}${route}`, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(150);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        if (overflow > 0) problems.push(`${route} @${width}px: ${overflow}px`);
      }
    }
    expect(!problems.length, problems.join(', '));
    return `${routes.length} routes × ${widths.length} widths`;
  });

  await check('Accessible names on buttons, links and form fields', async () => {
    await page.setViewportSize({ width: 1280, height: 860 });
    const missing = [];
    for (const route of ['#/', '#/homes', '#/agent', '#/compare', '#/saved']) {
      await page.goto(`${BASE_A}${route}`, { waitUntil: 'networkidle' });
      await scrollThrough(page);
      missing.push(
        ...(await page.evaluate(() => {
          const name = (el) => (el.getAttribute('aria-label') || el.getAttribute('title') || el.textContent || '').trim();
          const out = [];
          document.querySelectorAll('button, a[href]').forEach((el) => {
            if (!name(el) && !el.querySelector('img[alt]:not([alt=""])')) out.push(el.outerHTML.slice(0, 80));
          });
          document.querySelectorAll('input:not([type=hidden]):not([tabindex="-1"]), select, textarea').forEach((el) => {
            const labelled = el.labels?.length || el.getAttribute('aria-label') || el.getAttribute('aria-labelledby');
            if (!labelled) out.push(el.outerHTML.slice(0, 80));
          });
          document.querySelectorAll('img').forEach((img) => {
            if (!img.hasAttribute('alt')) out.push(img.outerHTML.slice(0, 80));
          });
          return out;
        })),
      );
    }
    expect(!missing.length, missing.join('\n'));
  });

  await check('No console errors while browsing', async () => {
    expect(!errors.length, errors.join('\n'));
  });
  await context.close();
}

log('\nProperty features');
{
  const { context, errors } = await newContext({ acceptDownloads: true });
  const page = await context.newPage();
  await page.goto(BASE_A, { waitUntil: 'networkidle' });

  await check('Payment estimator: defaults, zero interest, zero loan, invalid input, unit switch, mortgage insurance', async () => {
    const section = page.locator('#payment');
    await section.scrollIntoViewIfNeeded();
    const total = () => section.locator('[aria-live=polite][aria-atomic=true]').textContent();
    const row = async (label) => (await section.locator('dt', { hasText: label }).locator('xpath=..').locator('dd').textContent()).trim();
    expect((await total()) === '$4,025', `default total ${await total()}`);
    expect((await row('Principal & interest')) === '$3,160', 'P&I at 6.5%');
    await section.getByLabel('Interest rate').fill('0');
    expect((await row('Principal & interest')) === '$1,389', `zero-interest P&I ${await row('Principal & interest')}`);
    await section.getByLabel('Down payment', { exact: true }).fill('100');
    expect((await row('Principal & interest')) === '$0', 'zero loan P&I');
    await section.getByText('With no loan balance').waitFor();
    await section.getByLabel('Purchase price').fill('abc');
    await section.getByText('Enter a purchase price.').waitFor();
    expect((await total()) === '—', 'total should be blank for invalid input');
    await section.getByRole('button', { name: 'Reset to illustrative defaults' }).click();
    expect((await total()) === '$4,025', 'reset failed');
    await section.getByRole('radio', { name: 'Dollar amount' }).click();
    expect((await section.getByLabel('Down payment', { exact: true }).inputValue()) === '125,000', 'percent → dollar conversion');
    await section.getByLabel('Down payment', { exact: true }).fill('700000');
    await section.getByText('can’t be more than the purchase price').waitFor();
    await section.getByRole('button', { name: 'Reset to illustrative defaults' }).click();
    await section.getByLabel('Include monthly mortgage insurance').check();
    expect((await row('Mortgage insurance')) === '$208', `PMI suggestion ${await row('Mortgage insurance')}`);
    await section.getByText('Estimated payment only. Not a loan offer. Actual costs and eligibility vary.').waitFor();
    return 'all edge cases behave';
  });

  await check('Gallery: opens fullscreen, keyboard, mouse drag and wrap-around', async () => {
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.getByRole('button', { name: 'View all 10 photos' }).first().click();
    const dialog = page.getByRole('dialog', { name: /photo gallery/ });
    await dialog.waitFor();
    const counter = () => dialog.locator('[aria-live=polite]').textContent();
    expect((await counter()) === '1 / 10', 'starts at 1');
    await page.keyboard.press('ArrowRight');
    expect((await counter()) === '2 / 10', 'arrow right');
    const box = await dialog.locator('.touch-none').boundingBox();
    await page.mouse.move(box.x + box.width * 0.75, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.25, box.y + box.height / 2, { steps: 8 });
    await page.mouse.up();
    await page.waitForTimeout(350);
    expect((await counter()) === '3 / 10', `drag → ${await counter()}`);
    await page.keyboard.press('End');
    await page.keyboard.press('ArrowRight');
    expect((await counter()) === '1 / 10', 'wraps around');
    await page.keyboard.press('Escape');
    await dialog.waitFor({ state: 'hidden' });
    return 'OK';
  });

  await check('Feature stories: hero and tile entry, tap and keyboard navigation, pause, autoplay, closing call to action', async () => {
    await page.evaluate(() => window.scrollTo(0, 0));
    const dialog = page.getByRole('dialog', { name: /feature stories/ });
    const position = async () => (await dialog.locator('[aria-live=polite]').textContent()).match(/Story (\d+) of (\d+)/).slice(1).map(Number);
    await page.getByRole('button', { name: 'Watch story' }).click();
    await dialog.waitFor();
    const [first, total] = await position();
    const tiles = await page.locator('#stories li').count();
    expect(first === 1 && total === tiles && total >= 3, `opened at ${first}/${total}, ${tiles} tiles`);
    await page.keyboard.press('ArrowRight');
    expect((await position())[0] === 2, 'arrow right');
    // The "next" tap zone covers the right two-thirds of the story frame.
    const zone = await dialog.getByRole('button', { name: 'Next story' }).first().boundingBox();
    await page.mouse.click(zone.x + zone.width * 0.7, zone.y + zone.height / 2);
    expect((await position())[0] === 3, 'tap right side');
    await page.mouse.click(zone.x - zone.width * 0.25, zone.y + zone.height / 2);
    expect((await position())[0] === 2, 'tap left side');
    await dialog.getByRole('button', { name: 'Pause story' }).click();
    await page.waitForTimeout(6500);
    expect((await position())[0] === 2, 'advanced while paused');
    await dialog.getByRole('button', { name: 'Play story' }).click();
    await page.waitForFunction(() => /Story 3 of/.test(document.querySelector('dialog[open] [aria-live=polite]')?.textContent ?? ''), null, { timeout: 9000 });
    // Press and hold pauses the progress bar without changing slides.
    const bar = dialog.locator('div.flex.gap-1[aria-hidden] > span > span').nth(2);
    await page.mouse.move(zone.x + zone.width * 0.7, zone.y + zone.height / 2);
    await page.mouse.down();
    await page.waitForTimeout(400);
    const before = await bar.evaluate((el) => el.style.transform);
    await page.waitForTimeout(800);
    const after = await bar.evaluate((el) => el.style.transform);
    await page.mouse.up();
    await page.waitForTimeout(100);
    expect(before === after, `progress moved while holding: ${before} → ${after}`);
    expect((await position())[0] === 3, 'releasing a hold changed slides');
    for (let i = 3; i < total; i += 1) await page.keyboard.press('ArrowRight');
    expect((await position())[0] === total, 'reach last slide');
    await dialog.getByRole('heading', { name: 'Want to see it in person?' }).waitFor();
    await dialog.getByRole('button', { name: 'Schedule a Tour' }).click();
    await dialog.waitFor({ state: 'hidden' });
    await page.getByRole('dialog', { name: 'Schedule a tour' }).waitFor();
    await page.keyboard.press('Escape');
    await page.locator('#stories').scrollIntoViewIfNeeded();
    await page.locator('#stories li').nth(3).getByRole('button').click();
    await dialog.waitFor();
    expect((await position())[0] === 4, 'tile opens its own slide');
    await page.keyboard.press('Escape');
    await dialog.waitFor({ state: 'hidden' });
    return `${total} slides; pause button and press-and-hold hold, autoplay advances, closing CTA opens the tour form`;
  });

  await check('Neighborhood map: category filters, list sync, sample popups, no directions', async () => {
    const section = page.locator('#neighborhood');
    await section.scrollIntoViewIfNeeded();
    await section.locator('.leaflet-container').waitFor();
    await page.waitForTimeout(500);
    const markers = () => section.locator('.place-marker').count();
    const listCount = () => section.getByText(/places? nearby/).textContent();
    expect((await markers()) === 15, `markers ${await markers()}`);
    await section.getByRole('button', { name: /^Restaurants/ }).click();
    expect((await markers()) === 12 && (await listCount()).startsWith('12'), `after filter: ${await markers()} / ${await listCount()}`);
    await section.getByRole('button', { name: /^Schools/ }).click();
    expect((await markers()) === 9, 'second filter');
    await section.getByRole('button', { name: 'All', exact: true }).click();
    expect((await markers()) === 15, 'All restores');
    await section.getByRole('button', { name: 'All', exact: true }).click();
    await section.getByText('No categories selected.').waitFor();
    await section.getByRole('button', { name: 'Show all places' }).click();
    await section.locator('li').getByRole('button', { name: 'Sample Bistro', exact: true }).click();
    await section.locator('.leaflet-popup').getByText('Illustrative marker').waitFor();
    expect(!(await section.locator('a[href*="google.com/maps"]').count()), 'directions link present for sample places');
    expect((await section.locator('.leaflet-control-attribution').textContent()).includes('OpenStreetMap'), 'attribution missing');
    return '15 → 12 → 9 → 15 → 0 → 15 markers';
  });

  await check('Demo inquiry: sample values, read-only, preview only, nothing sent', async () => {
    const posts = [];
    page.on('request', (r) => r.method() !== 'GET' && posts.push(r.url()));
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.locator('header').getByRole('button', { name: 'Schedule a Tour' }).click();
    const dialog = page.getByRole('dialog', { name: 'Schedule a tour' });
    await dialog.getByText('Demo preview.').waitFor();
    expect((await dialog.getByLabel('Name').inputValue()) === 'Alex Sample', 'sample name');
    expect(await dialog.getByLabel('Email').evaluate((el) => el.readOnly), 'email should be read-only');
    await dialog.getByRole('button', { name: 'Preview inquiry' }).click();
    await dialog.getByText('Demo preview: this inquiry was not sent.').waitFor();
    expect(!(await dialog.getByText(/Message sent/).count()), 'false success message shown');
    expect(!posts.length, `requests sent: ${posts.join(', ')}`);
    await page.keyboard.press('Escape');
    const links = await page.evaluate(() => [...document.querySelectorAll('a[href^="tel:"], a[href^="sms:"], a[href^="mailto:"]')].map((a) => a.href));
    expect(!links.length, `placeholder contact links present: ${links.join(', ')}`);
    return 'no network requests, no tel:/sms:/mailto: links';
  });

  await check('QR code points to the public property URL (never localhost)', async () => {
    const expected = `${PUBLIC_A}#/homes/the-willow-house`;
    const holder = page.locator('[aria-label^="QR code linking to"]');
    await holder.scrollIntoViewIfNeeded();
    await page.waitForFunction(() => document.querySelector('[aria-label^="QR code linking to"] svg'));
    const decoded = await decodeSvgQr(await holder.innerHTML());
    expect(decoded === expected, `on-screen QR decodes to ${decoded}`);
    const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'QR code' }).click()]);
    const file = await download.path();
    const fromPng = await decodePng(fs.readFileSync(file));
    expect(fromPng === expected, `downloaded QR decodes to ${fromPng}`);
    await page.goto(`${BASE_A}#/homes/hawthorne-ridge-residence`, { waitUntil: 'networkidle' });
    await page.locator('[aria-label^="QR code linking to"]').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => document.querySelector('[aria-label^="QR code linking to"] svg'));
    const other = await decodeSvgQr(await page.locator('[aria-label^="QR code linking to"]').innerHTML());
    expect(other === `${PUBLIC_A}#/homes/hawthorne-ridge-residence`, `second listing QR ${other}`);
    return expected;
  });

  await check('Open house calendar file downloads', async () => {
    await page.goto(BASE_A, { waitUntil: 'networkidle' });
    const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Add to calendar' }).click()]);
    const ics = fs.readFileSync(await download.path(), 'utf8');
    expect(ics.includes('BEGIN:VEVENT') && ics.includes('DTSTART;TZID=America/Chicago'), 'invalid ics');
    return download.suggestedFilename();
  });

  await check('Print layout shows only the one-page summary', async () => {
    await page.emulateMedia({ media: 'print' });
    const state = await page.evaluate(() => ({
      summary: getComputedStyle(document.querySelector('.print-only')).display,
      header: getComputedStyle(document.querySelector('header')).display,
    }));
    expect(state.summary === 'block' && state.header === 'none', JSON.stringify(state));
    const pdf = await page.pdf({ format: 'Letter', printBackground: true });
    await page.emulateMedia({ media: 'screen' });
    const pages = (pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
    expect(pages === 1, `${pages} printed pages`);
    return '1 page';
  });

  await check('Keyboard: "Explore the Home" moves focus to the overview', async () => {
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.getByRole('button', { name: /Explore the Home/ }).focus();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(900);
    const active = await page.evaluate(() => document.activeElement?.id);
    expect(active === 'overview-title', `focus on ${active}`);
  });

  await check('No console errors during feature use', async () => {
    expect(!errors.length, errors.join('\n'));
  });
  await context.close();
}

log('\nMap fallback');
{
  const { context } = await newContext({}, { tiles: 'fail' });
  const page = await context.newPage();
  await check('Map shows the simplified layout when tiles cannot load', async () => {
    await page.goto(BASE_A, { waitUntil: 'domcontentloaded' });
    await page.locator('#neighborhood').scrollIntoViewIfNeeded();
    await page.getByText('Map imagery isn’t available right now').waitFor({ timeout: 15000 });
    expect((await page.locator('#neighborhood [role=button][aria-label*="Sample"]').count()) === 15, 'schematic markers missing');
    return 'fallback + 15 schematic markers';
  });
  await context.close();
}

log('\nMobile');
{
  const { context, errors } = await newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const page = await context.newPage();
  await page.goto(BASE_A, { waitUntil: 'networkidle' });

  await check('First screen shows home, price, beds, baths, sq ft and "Explore the Home"', async () => {
    const vh = 664; // typical visible height on a phone with browser bars
    await page.setViewportSize({ width: 390, height: vh });
    await page.reload({ waitUntil: 'networkidle' });
    const items = await page.evaluate(() => {
      const hero = document.querySelector('section[aria-labelledby=property-title]');
      const find = (text) => [...hero.querySelectorAll('*')].find((el) => el.childElementCount === 0 && el.textContent.trim() === text);
      const bottom = (el) => (el ? el.getBoundingClientRect().bottom : Infinity);
      return {
        title: bottom(document.getElementById('property-title')),
        price: bottom(find('$625,000')),
        beds: bottom(find('Beds')),
        sqft: bottom(find('Sq Ft')),
        explore: bottom([...hero.querySelectorAll('button')].find((b) => b.textContent.includes('Explore the Home'))),
      };
    });
    const off = Object.entries(items).filter(([, b]) => b > vh);
    expect(!off.length, `below the fold at ${vh}px: ${JSON.stringify(items)}`);
    await page.setViewportSize({ width: 390, height: 844 });
    return `everything above ${vh}px (button bottom at ${Math.round(items.explore)}px)`;
  });

  await check('Sticky contact bar: placeholder calls are disabled with an explanation', async () => {
    const bar = page.locator('div.fixed.bottom-0');
    expect(await bar.getByRole('button', { name: 'Schedule a Tour' }).isVisible(), 'tour button missing');
    await bar.getByRole('button', { name: 'Call' }).tap();
    await page.getByRole('dialog', { name: 'Calling is turned off in this demo' }).waitFor();
    await page.getByRole('dialog').getByRole('button', { name: 'Close' }).first().tap();
  });

  await check('Gallery responds to touch swipes', async () => {
    await page.getByRole('button', { name: 'View all 10 photos' }).first().tap();
    const dialog = page.getByRole('dialog', { name: /photo gallery/ });
    await dialog.waitFor();
    const box = await dialog.locator('.touch-none').boundingBox();
    const cdp = await context.newCDPSession(page);
    const y = box.y + box.height / 2;
    const touch = async (type, x) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y }] });
    await touch('touchStart', box.x + box.width * 0.8);
    for (let i = 1; i <= 8; i += 1) await touch('touchMove', box.x + box.width * (0.8 - i * 0.07));
    await touch('touchEnd');
    await page.waitForTimeout(400);
    const counter = await dialog.locator('[aria-live=polite]').textContent();
    expect(counter === '2 / 10', `after swipe: ${counter}`);
    await page.keyboard.press('Escape');
    return counter;
  });

  await check('Stories respond to swipes, taps and drag-to-close on touch screens', async () => {
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.getByRole('button', { name: 'Watch story' }).tap();
    const dialog = page.getByRole('dialog', { name: /feature stories/ });
    await dialog.waitFor();
    const position = async () => Number((await dialog.locator('[aria-live=polite]').textContent()).match(/Story (\d+)/)[1]);
    const cdp = await context.newCDPSession(page);
    const vp = page.viewportSize();
    const touch = async (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y }] });
    const drag = async (x0, y0, x1, y1) => {
      await touch('touchStart', x0, y0);
      for (let i = 1; i <= 8; i += 1) await touch('touchMove', x0 + ((x1 - x0) * i) / 8, y0 + ((y1 - y0) * i) / 8);
      await touch('touchEnd');
      await page.waitForTimeout(250);
    };
    await drag(vp.width * 0.8, vp.height / 2, vp.width * 0.2, vp.height / 2);
    expect((await position()) === 2, `swipe left → ${await position()}`);
    await page.touchscreen.tap(vp.width * 0.85, vp.height / 2);
    await page.waitForTimeout(150);
    expect((await position()) === 3, `tap right → ${await position()}`);
    await page.touchscreen.tap(vp.width * 0.1, vp.height / 2);
    await page.waitForTimeout(150);
    expect((await position()) === 2, `tap left → ${await position()}`);
    await drag(vp.width / 2, vp.height * 0.4, vp.width / 2, vp.height * 0.85);
    await dialog.waitFor({ state: 'hidden' });
    return 'swipe, taps and drag-down close';
  });

  await check('Mobile menu opens and navigates', async () => {
    await page.getByRole('button', { name: 'Open menu' }).tap();
    await page.getByRole('dialog', { name: 'Menu' }).getByRole('link', { name: 'Browse homes' }).tap();
    await page.getByRole('heading', { level: 1, name: 'Homes for sale' }).waitFor();
  });

  await check('No console errors on mobile', async () => {
    expect(!errors.length, errors.join('\n'));
  });
  await context.close();
}

log('\nBuyer tools');
{
  const { context, errors } = await newContext();
  const page = await context.newPage();
  await page.goto(`${BASE_A}#/homes`, { waitUntil: 'networkidle' });

  await check('Filters: bedrooms, price range and empty state', async () => {
    const count = () => page.getByText(/homes? match your filters|^\d+ homes?$/).first().textContent();
    await page.getByRole('radio', { name: '5+' }).click();
    expect((await count()).startsWith('1 home'), `5+ beds → ${await count()}`);
    await page.getByRole('radio', { name: 'Any' }).click();
    await page.getByLabel('Minimum price').selectOption({ label: '$500K' });
    expect((await count()).startsWith('2 homes'), `min $500K → ${await count()}`);
    await page.getByLabel('Maximum price').selectOption({ label: '$400K' });
    await page.getByText('The minimum price is higher than the maximum').waitFor();
    await page.getByRole('button', { name: 'Show all homes' }).click();
    expect((await count()) === '3 homes', 'reset');
  });

  await check('Favorites, comparison (max 3) and private notes persist on this device', async () => {
    await page.getByRole('button', { name: 'Save The Linden Townhome' }).click();
    await page.locator('header nav').getByText('1').waitFor();
    for (const name of ['The Willow House', 'The Linden Townhome', 'Hawthorne Ridge Residence']) {
      await page.locator('article', { hasText: name }).getByRole('button', { name: 'Compare' }).click();
    }
    await page.getByText('3 of 3 selected').waitFor();
    await page.getByRole('link', { name: 'Compare' }).last().click();
    await page.getByRole('heading', { level: 1, name: 'Compare homes' }).waitFor();
    expect((await page.locator('thead th[scope=col]').count()) === 4, 'expected 3 home columns + label column');
    expect((await page.getByText('Best', { exact: true }).count()) > 3, 'best-value badges missing');
    await page.getByRole('button', { name: 'Remove Hawthorne Ridge Residence from compare' }).click();
    expect((await page.locator('thead th[scope=col]').count()) === 4, 'expected 2 homes + add slot + label');
    await page.goto(`${BASE_A}#/saved`);
    await page.getByRole('link', { name: 'The Linden Townhome' }).first().waitFor();
    await page.getByLabel('My private notes').fill('Ask about the HOA reserve.');
    await page.waitForTimeout(800);
    await page.reload({ waitUntil: 'networkidle' });
    expect((await page.getByLabel('My private notes').inputValue()) === 'Ask about the HOA reserve.', 'note lost after reload');
    const keys = await page.evaluate(() => Object.keys(localStorage));
    expect(keys.every((k) => k.startsWith(`pshow:willow-stone-demo@/verify-app/:`)), `unexpected keys ${keys.join(', ')}`);
    await page.getByText('don’t sync to your other devices').waitFor();
    return keys.join(', ');
  });

  await check('No console errors in buyer tools', async () => {
    expect(!errors.length, errors.join('\n'));
  });
  await context.close();
}

log('\nOffline, updates and isolation');
{
  const { context, errors } = await newContext();
  const page = await context.newPage();
  await page.goto(BASE_A, { waitUntil: 'networkidle' });
  await waitForSw(page);
  await page.reload({ waitUntil: 'networkidle' });

  await check('Offline: app shell, saved content notice and placeholders instead of broken images', async () => {
    await page.evaluate(() => window.scrollTo(0, 0));
    await context.setOffline(true);
    serverDown = true;
    try {
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.getByRole('heading', { level: 1, name: 'The Willow House' }).waitFor();
      await page.getByText('You’re offline.').waitFor();
      await page.goto(`${BASE_A}#/homes/hawthorne-ridge-residence`);
      await page.getByRole('heading', { level: 1, name: 'Hawthorne Ridge Residence' }).waitFor();
      await scrollThrough(page);
      const broken = await page.evaluate(() => [...document.querySelectorAll('img')].filter((i) => i.complete && i.naturalWidth === 0).length);
      expect(broken === 0, `${broken} broken images offline`);
      const placeholders = await page.getByText('Photo unavailable offline').count();
      expect(placeholders > 0, 'expected placeholders for photos that were never viewed');
      await page.goto(`${BASE_A}#/`);
      await page.getByRole('heading', { level: 1, name: 'The Willow House' }).waitFor();
      await page.waitForTimeout(300);
      const heroLoaded = await page.evaluate(() => document.querySelector('section[aria-labelledby=property-title] img')?.naturalWidth > 0);
      expect(heroLoaded, 'previously viewed hero photo did not load offline');
      const fallback = await page.evaluate(async () => {
        const response = await caches.match(new URL('offline.html', location.href).href);
        return response ? (await response.text()).includes('You’re offline') : false;
      });
      expect(fallback, 'offline.html fallback page is not cached');
      return `viewed photos load from cache; ${placeholders} placeholder(s) for never-viewed photos; offline.html cached`;
    } finally {
      serverDown = false;
      await context.setOffline(false);
    }
  });

  await check('Service worker caches are limited and never include map tiles or form posts', async () => {
    await page.goto(BASE_A, { waitUntil: 'networkidle' });
    const caches = await page.evaluate(async () => {
      const out = {};
      for (const name of await caches.keys()) out[name] = (await (await caches.open(name)).keys()).map((r) => r.url);
      return out;
    });
    const all = Object.values(caches).flat();
    expect(!all.some((u) => u.includes('tile.openstreetmap.org')), 'map tiles cached');
    expect(Object.keys(caches).every((n) => n.startsWith('pshow:willow-stone-demo@/verify-app/:')), `cache names: ${Object.keys(caches).join(', ')}`);
    return Object.entries(caches).map(([n, u]) => `${n.split(':').slice(-2).join(':')}=${u.length}`).join(', ');
  });

  await check('Update notice appears when a new version is deployed, and refresh applies it', async () => {
    const before = await page.evaluate(() => document.querySelector('script[type=module]').src);
    fs.rmSync(liveA, { recursive: true, force: true });
    fs.cpSync(distANext, liveA, { recursive: true });
    await page.evaluate(async () => (await navigator.serviceWorker.getRegistration()).update());
    await page.getByText('Updated listing details are available.').waitFor({ timeout: 15000 });
    await Promise.all([page.waitForEvent('load'), page.getByRole('button', { name: 'Refresh' }).click()]);
    await page.waitForLoadState('networkidle');
    const after = await page.evaluate(() => document.querySelector('script[type=module]').src);
    expect(before !== after, 'still running the old version');
    return `${path.basename(before)} → ${path.basename(after)}`;
  });

  await check('Two apps on one GitHub Pages origin keep separate data, caches and service workers', async () => {
    await page.goto(`${BASE_A}#/homes`, { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'Save The Willow House' }).click();
    const pageB = await context.newPage();
    await pageB.goto(`${BASE_B}#/homes`, { waitUntil: 'networkidle' });
    await waitForSw(pageB);
    expect(!(await pageB.getByRole('button', { name: 'Remove The Willow House from saved homes' }).count()), 'favorite leaked into app B');
    await pageB.getByRole('button', { name: 'Save The Linden Townhome' }).click();
    await page.reload({ waitUntil: 'networkidle' });
    expect(await page.getByRole('button', { name: 'Remove The Willow House from saved homes' }).count(), 'app A lost its favorite');
    expect(!(await page.getByRole('button', { name: 'Remove The Linden Townhome from saved homes' }).count()), 'favorite leaked into app A');
    const state = await pageB.evaluate(async () => ({
      caches: await caches.keys(),
      regs: (await navigator.serviceWorker.getRegistrations()).map((r) => r.scope),
      keys: Object.keys(localStorage),
    }));
    const aCaches = state.caches.filter((c) => c.startsWith('pshow:willow-stone-demo@/verify-app/:'));
    const bCaches = state.caches.filter((c) => c.startsWith('pshow:verify-second-app@/second-app/:'));
    expect(aCaches.length && bCaches.length && aCaches.length + bCaches.length === state.caches.length, `caches: ${state.caches.join(', ')}`);
    expect(state.regs.includes(BASE_A) && state.regs.includes(BASE_B), `registrations: ${state.regs.join(', ')}`);
    expect(state.keys.some((k) => k.includes('verify-second-app@/second-app/')) && state.keys.some((k) => k.includes('willow-stone-demo@/verify-app/')), 'storage keys');
    await pageB.close();
    return `${aCaches.length} + ${bCaches.length} caches, 2 scoped workers`;
  });

  await check('No console errors (offline/update/isolation)', async () => {
    const real = errors.filter((e) => !/ERR_INTERNET_DISCONNECTED|Failed to load resource/.test(e));
    expect(!real.length, real.join('\n'));
  });
  await context.close();
}

log('\nMotion preferences');
{
  for (const motion of ['reduce', 'no-preference']) {
    const { context } = await newContext({ reducedMotion: motion });
    const page = await context.newPage();
    await check(`Reveal animations with prefers-reduced-motion: ${motion}`, async () => {
      await page.goto(BASE_A, { waitUntil: 'networkidle' });
      const hiddenBefore = await page.evaluate(() => [...document.querySelectorAll('[data-reveal]')].filter((el) => getComputedStyle(el).opacity === '0').length);
      await scrollThrough(page);
      await page.waitForTimeout(1500);
      const hiddenAfter = await page.evaluate(() => [...document.querySelectorAll('[data-reveal]')].filter((el) => getComputedStyle(el).opacity !== '1').length);
      if (motion === 'reduce') expect(hiddenBefore === 0, `${hiddenBefore} elements hidden with reduced motion`);
      else expect(hiddenBefore > 0, 'no reveal animation applied');
      expect(hiddenAfter === 0, `${hiddenAfter} elements still hidden after scrolling`);
      return `hidden before scroll: ${hiddenBefore}`;
    });
    if (motion === 'reduce') {
      await check('Stories wait for the visitor when reduced motion is on', async () => {
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.getByRole('button', { name: 'Watch story' }).click();
        const dialog = page.getByRole('dialog', { name: /feature stories/ });
        await dialog.waitFor();
        await page.waitForTimeout(6500);
        const text = await dialog.locator('[aria-live=polite]').textContent();
        expect(/Story 1 of/.test(text), `auto-advanced to: ${text}`);
        expect(!(await dialog.getByRole('button', { name: 'Pause story' }).count()), 'pause control shown without autoplay');
        await page.keyboard.press('Escape');
        return 'no autoplay; tap or arrow keys to continue';
      });
    }
    await context.close();
  }
}

log('\nCustomer-mode safeguards');
await check('Switching demoMode off blocks publishing fictional content and placeholders', async () => {
  expect(!customerBuild.ok, 'build unexpectedly succeeded');
  for (const phrase of ['placeholder number', 'marked fictional', 'demo artwork', 'sample place', 'site.appId is still']) {
    expect(customerBuild.output.includes(phrase), `missing validation message: ${phrase}`);
  }
  return 'build refused with clear messages';
});

await browser.close();
server.close();
rootServer.close();
fs.rmSync(tmp, { recursive: true, force: true });

const failed = results.filter((r) => !r.ok);
log(`\n${results.length - failed.length}/${results.length} checks passed.`);
if (failed.length) {
  log('\nFailures:');
  for (const f of failed) log(`- ${f.name}\n  ${f.detail}`);
  process.exit(1);
}
