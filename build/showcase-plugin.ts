/**
 * Build plugin for the property showcase.
 *
 * - Validates the content config (strict when demoMode is false).
 * - Resolves the public URL used for QR codes, share links and social previews.
 * - Injects page metadata and brand colors into index.html.
 * - Generates the web app manifest, app icons, social preview image and offline page.
 * - Emits an app-scoped service worker with a precache list of the built app shell.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import type { HtmlTagDescriptor, Plugin, ResolvedConfig } from 'vite';
import { config as showcase } from '../src/config/index.ts';
import { validateConfig, PHOTO_WIDTHS } from '../src/config/validate.ts';
import { checkPublicUrl, githubPagesUrlFromRepository } from '../src/config/public-url.ts';
import type { BrandColors } from '../src/config/types.ts';

const VIRTUAL_ID = 'virtual:showcase-build';
const RESOLVED_VIRTUAL_ID = `\0${VIRTUAL_ID}`;
const ROOT = path.resolve(import.meta.dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');

const ICONS = [
  { file: 'icons/icon-192.png', size: 192, scale: 0.62, rounded: false },
  { file: 'icons/icon-512.png', size: 512, scale: 0.62, rounded: false },
  { file: 'icons/icon-maskable-512.png', size: 512, scale: 0.5, rounded: false },
  { file: 'icons/apple-touch-icon.png', size: 180, scale: 0.62, rounded: false },
  { file: 'icons/icon-32.png', size: 32, scale: 0.86, rounded: true },
] as const;

/** Public URL precedence: explicit config → deploy workflow → GITHUB_REPOSITORY → none. */
export function resolvePublicUrl(): { url: string | null; source: string } {
  const candidates: Array<[string | undefined | null, string]> = [
    [showcase.site.publicUrl, 'site.publicUrl'],
    [process.env.SHOWCASE_PUBLIC_URL, 'SHOWCASE_PUBLIC_URL'],
    [githubPagesUrlFromRepository(process.env.GITHUB_REPOSITORY), 'GITHUB_REPOSITORY'],
  ];
  for (const [value, source] of candidates) {
    if (!value) continue;
    const checked = checkPublicUrl(value);
    if (checked.ok) return { url: checked.url, source };
  }
  return { url: null, source: 'none' };
}

function colorFor(token: string, colors: BrandColors): string {
  return (colors as unknown as Record<string, string>)[token] ?? token;
}

function markPaths(): string {
  const { colors, mark } = showcase.branding;
  return mark.paths
    .map((p) => `<path d="${p.d}" fill="${colorFor(p.fill, colors)}"${p.opacity != null ? ` fill-opacity="${p.opacity}"` : ''}/>`)
    .join('');
}

/** Square icon SVG: brand background with the mark centered at `scale` of the canvas. */
export function iconSvg(size: number, scale: number, rounded: boolean, transparent = false): string {
  const { colors, mark } = showcase.branding;
  const [, , vw, vh] = mark.viewBox.split(/[\s,]+/).map(Number);
  const inner = size * scale;
  const factor = inner / Math.max(vw, vh);
  const offsetX = (size - vw * factor) / 2;
  const offsetY = (size - vh * factor) / 2;
  const radius = rounded ? size * 0.22 : 0;
  const bg = transparent ? '' : `<rect width="${size}" height="${size}" rx="${radius}" fill="${colors.background}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${bg}<g transform="translate(${offsetX} ${offsetY}) scale(${factor})">${markPaths()}</g></svg>`;
}

function manifestJson(): string {
  const { site, branding } = showcase;
  const manifest = {
    // Unique per app even when several apps share one GitHub Pages origin.
    id: `?app=${site.appId}`,
    name: site.appName,
    short_name: site.appShortName,
    description: site.description,
    lang: site.locale,
    start_url: './',
    scope: './',
    display: 'standalone',
    background_color: branding.colors.background,
    theme_color: branding.colors.background,
    categories: ['lifestyle', 'business'],
    icons: [
      { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Browse homes', url: './#/homes' },
      { name: 'Saved homes', url: './#/saved' },
      { name: `Contact ${showcase.agent.name}`, url: './#/agent' },
    ],
  };
  return JSON.stringify(manifest, null, 2);
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

function offlineHtml(): string {
  const { site, branding } = showcase;
  const c = branding.colors;
  return `<!doctype html>
<html lang="${site.locale}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Offline · ${escapeHtml(site.appName)}</title>
<meta name="theme-color" content="${c.background}">
<style>
  :root { color-scheme: light; }
  body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: ${c.background}; color: ${c.ink};
    font: 16px/1.6 system-ui, -apple-system, "Segoe UI", sans-serif; padding: 24px; box-sizing: border-box; }
  main { max-width: 420px; text-align: center; }
  svg { width: 64px; height: 64px; }
  h1 { font: 500 2rem/1.2 Georgia, "Times New Roman", serif; margin: 16px 0 8px; }
  p { color: ${c.inkMuted}; margin: 0 0 24px; }
  button { font: inherit; font-weight: 600; background: ${c.accentStrong}; color: #fff; border: 0; border-radius: 999px; padding: 12px 24px; cursor: pointer; }
  button:focus-visible { outline: 3px solid ${c.accent}; outline-offset: 3px; }
</style>
</head>
<body>
<main>
  ${iconSvg(64, 0.9, false, true)}
  <h1>You’re offline</h1>
  <p>This page hasn’t been saved on this device yet. Reconnect to the internet to continue browsing ${escapeHtml(branding.brokerageName)} homes.</p>
  <button type="button" onclick="location.reload()">Try again</button>
</main>
</body>
</html>`;
}

async function renderPng(svg: string, size: number): Promise<Buffer> {
  const sharp = (await import('sharp')).default;
  return sharp(Buffer.from(svg), { density: 72 }).resize(size, size).png({ compressionLevel: 9 }).toBuffer();
}

type Font = import('opentype.js').Font;
const fontCache = new Map<string, Font>();

async function loadFont(file: string): Promise<Font> {
  const cached = fontCache.get(file);
  if (cached) return cached;
  const opentype = (await import('opentype.js')).default;
  const buf = fs.readFileSync(file);
  const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
  fontCache.set(file, font);
  return font;
}

type Cmd = { type: string; x?: number; y?: number; x1?: number; y1?: number; x2?: number; y2?: number };

/** Path data for one glyph rendered at the origin, then shifted (avoids an opentype.js NaN bug at some offsets). */
function glyphData(font: Font, ch: string, dx: number, dy: number, size: number): string {
  const commands = (font.getPath(ch, 0, 0, size) as unknown as { commands: Cmd[] }).commands;
  const f = (n: number | undefined, o: number) => ((n ?? 0) + o).toFixed(2);
  return commands
    .map((c) => {
      switch (c.type) {
        case 'M':
        case 'L':
          return `${c.type}${f(c.x, dx)} ${f(c.y, dy)}`;
        case 'Q':
          return `Q${f(c.x1, dx)} ${f(c.y1, dy)} ${f(c.x, dx)} ${f(c.y, dy)}`;
        case 'C':
          return `C${f(c.x1, dx)} ${f(c.y1, dy)} ${f(c.x2, dx)} ${f(c.y2, dy)} ${f(c.x, dx)} ${f(c.y, dy)}`;
        default:
          return 'Z';
      }
    })
    .join('');
}

/** Renders text as SVG path data glyph by glyph using the bundled brand font. */
async function textPath(text: string, fontFile: string, size: number, x: number, y: number, tracking = 0): Promise<{ d: string; width: number }> {
  const font = await loadFont(fontFile);
  let cursor = x;
  let d = '';
  for (const ch of text) {
    const data = glyphData(font, ch, cursor, y, size);
    if (!data.includes('NaN')) d += data;
    cursor += font.getAdvanceWidth(ch, size) + tracking;
  }
  return { d, width: cursor - x - tracking };
}

async function measure(text: string, fontFile: string, size: number): Promise<number> {
  const font = await loadFont(fontFile);
  let width = 0;
  for (const ch of text) width += font.getAdvanceWidth(ch, size);
  return width;
}

/** Wraps words into at most `maxLines` lines that fit `maxWidth`. */
async function wrapToWidth(text: string, fontFile: string, size: number, maxWidth: number, maxLines = 2): Promise<string[]> {
  const lines: string[] = [];
  let current = '';
  for (const word of text.split(' ')) {
    const candidate = current ? `${current} ${word}` : word;
    if (current && (await measure(candidate, fontFile, size)) > maxWidth) {
      lines.push(current);
      current = word;
    } else current = candidate;
  }
  if (current) lines.push(current);
  return lines.slice(0, maxLines);
}

/** 1200×630 social preview: featured photo + brand panel, text rendered from the bundled serif font. */
async function socialImage(): Promise<Buffer> {
  const sharp = (await import('sharp')).default;
  const { site, branding, properties } = showcase;
  const c = branding.colors;
  const featured = properties.find((p) => p.id === site.featuredPropertyId) ?? properties[0];
  const fontDir = path.join(ROOT, 'node_modules/@fontsource/cormorant-garamond/files');
  const serif600 = path.join(fontDir, 'cormorant-garamond-latin-600-normal.woff');
  const serif500 = path.join(fontDir, 'cormorant-garamond-latin-500-normal.woff');

  const W = 1200;
  const H = 630;
  const photoW = 660;
  const panelX = photoW + 56;
  const fmt = new Intl.NumberFormat(site.locale, { style: 'currency', currency: site.currency, maximumFractionDigits: 0 });
  const baths = featured.baths.full + featured.baths.half * 0.5;

  const label = await textPath(branding.brokerageName.toUpperCase(), serif600, 22, panelX + 52, 128, 3.2);
  const maxTextWidth = W - panelX - 44;
  let nameSize = 66;
  let nameLines = await wrapToWidth(featured.name, serif500, nameSize, maxTextWidth);
  while (nameSize > 40 && (await Promise.all(nameLines.map((l) => measure(l, serif500, nameSize)))).some((w) => w > maxTextWidth)) {
    nameSize -= 4;
    nameLines = await wrapToWidth(featured.name, serif500, nameSize, maxTextWidth);
  }
  const nameParts = await Promise.all(nameLines.map((line, i) => textPath(line, serif500, nameSize, panelX, 230 + i * nameSize * 1.05)));
  const priceY = 230 + nameLines.length * nameSize * 1.05 + 30;
  const price = await textPath(fmt.format(featured.price), serif600, 44, panelX, priceY);
  const stats = await textPath(
    `${featured.beds} bd  ·  ${baths} ba  ·  ${featured.interiorSqft.toLocaleString(site.locale)} sq ft`,
    serif500,
    30,
    panelX,
    priceY + 52,
  );
  const note = site.demoMode ? await textPath('Demo experience · fictional agency and property', serif500, 21, panelX, 568) : null;

  const [, , vw, vh] = branding.mark.viewBox.split(/[\s,]+/).map(Number);
  const markScale = 40 / Math.max(vw, vh);

  const overlay = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <rect x="${photoW}" width="${W - photoW}" height="${H}" fill="${c.background}"/>
    <rect x="${photoW}" width="6" height="${H}" fill="${c.accent}"/>
    <g transform="translate(${panelX} 96) scale(${markScale})">${markPaths()}</g>
    <path d="${label.d}" fill="${c.inkMuted}"/>
    ${nameParts.map((p) => `<path d="${p.d}" fill="${c.ink}"/>`).join('')}
    <path d="${price.d}" fill="${c.accentStrong}"/>
    <path d="${stats.d}" fill="${c.ink}"/>
    ${note ? `<rect x="${panelX}" y="536" width="${W - panelX - 48}" height="1" fill="${c.line}"/><path d="${note.d}" fill="${c.inkMuted}"/>` : ''}
  </svg>`;

  const photoFile = path.join(PUBLIC_DIR, `${featured.photos[0].src}-1280.webp`);
  const base = sharp({ create: { width: W, height: H, channels: 3, background: c.background } });
  const layers: Array<{ input: Buffer; left: number; top: number }> = [];
  if (fs.existsSync(photoFile)) {
    const photo = await sharp(photoFile).resize(photoW, H, { fit: 'cover', position: 'attention' }).toBuffer();
    layers.push({ input: photo, left: 0, top: 0 });
  }
  layers.push({ input: Buffer.from(overlay), left: 0, top: 0 });
  return base.composite(layers).jpeg({ quality: 84, mozjpeg: true }).toBuffer();
}

function brandCss(): string {
  const c = showcase.branding.colors;
  return `:root{--brand-background:${c.background};--brand-surface:${c.surface};--brand-surface-alt:${c.surfaceAlt};--brand-ink:${c.ink};--brand-ink-muted:${c.inkMuted};--brand-line:${c.line};--brand-accent:${c.accent};--brand-accent-strong:${c.accentStrong};--brand-accent-soft:${c.accentSoft};}`;
}

function walk(dir: string, base = dir): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full, base) : [path.relative(base, full).split(path.sep).join('/')];
  });
}

/** Files cached at install time: the app shell plus the featured hero photo. */
function precacheList(outDir: string): string[] {
  const featured = showcase.properties.find((p) => p.id === showcase.site.featuredPropertyId);
  const hero = featured ? [640, 1280].map((w) => `${featured.photos[0].src}-${w}.webp`) : [];
  const files = walk(outDir).filter((file) => {
    if (file.endsWith('.map') || file === 'sw.js') return false;
    if (file.startsWith('assets/')) {
      if (/\.(woff|ttf|eot)$/.test(file)) return false;
      if (file.endsWith('.woff2')) return /-latin-/.test(file) && !/(latin-ext|cyrillic|greek|vietnamese)/.test(file);
      return true;
    }
    if (file.startsWith('icons/')) return true;
    return ['index.html', 'offline.html', 'manifest.webmanifest'].includes(file) || hero.includes(file);
  });
  return files.sort();
}

export function showcasePlugin(): Plugin {
  let resolved: ResolvedConfig;
  const publicUrl = resolvePublicUrl();
  const builtAt = new Date().toISOString();

  const report = (strict: boolean, warn: (m: string) => void, fail: (m: string) => never | void) => {
    const result = validateConfig(showcase, {
      resolvedPublicUrl: publicUrl.url,
      fileExists: (file) => fs.existsSync(path.join(PUBLIC_DIR, file)),
    });
    for (const w of result.warnings) warn(`[showcase] ${w}`);
    if (result.errors.length) {
      const message = `[showcase] Configuration problems (${showcase.site.demoMode ? 'demo' : 'customer'} mode):\n  - ${result.errors.join('\n  - ')}`;
      if (strict) fail(message);
      else warn(message);
    }
  };

  return {
    name: 'property-showcase',
    configResolved(config) {
      resolved = config;
    },
    buildStart() {
      const isBuild = resolved.command === 'build';
      report(isBuild, (m) => this.warn(m), (m) => this.error(m));
      if (isBuild) {
        this.info?.(`[showcase] public URL: ${publicUrl.url ?? '(none)'} via ${publicUrl.source}`);
      }
    },
    resolveId(id) {
      return id === VIRTUAL_ID ? RESOLVED_VIRTUAL_ID : undefined;
    },
    load(id) {
      if (id !== RESOLVED_VIRTUAL_ID) return undefined;
      return `export const publicUrl = ${JSON.stringify(publicUrl.url)};\nexport const builtAt = ${JSON.stringify(builtAt)};\nexport const photoWidths = ${JSON.stringify(PHOTO_WIDTHS)};\n`;
    },
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        const { site, branding } = showcase;
        const tags: HtmlTagDescriptor[] = [];
        const meta = (attrs: Record<string, string>) => tags.push({ tag: 'meta', attrs, injectTo: 'head' });
        const link = (attrs: Record<string, string>) => tags.push({ tag: 'link', attrs, injectTo: 'head' });

        tags.push({ tag: 'title', children: escapeHtml(site.title), injectTo: 'head' });
        meta({ name: 'description', content: site.description });
        meta({ name: 'theme-color', content: branding.colors.background });
        meta({ name: 'color-scheme', content: 'light' });
        meta({ name: 'application-name', content: site.appName });
        meta({ name: 'apple-mobile-web-app-title', content: site.appShortName });
        meta({ name: 'mobile-web-app-capable', content: 'yes' });
        meta({ name: 'apple-mobile-web-app-status-bar-style', content: 'default' });
        meta({ name: 'format-detection', content: 'telephone=no' });
        link({ rel: 'manifest', href: './manifest.webmanifest' });
        link({ rel: 'icon', href: './icons/favicon.svg', type: 'image/svg+xml' });
        link({ rel: 'icon', href: './icons/icon-32.png', sizes: '32x32', type: 'image/png' });
        link({ rel: 'apple-touch-icon', href: './icons/apple-touch-icon.png' });

        // Site-level social preview. Hash routes cannot have per-property previews.
        meta({ property: 'og:type', content: 'website' });
        meta({ property: 'og:site_name', content: branding.brokerageName });
        meta({ property: 'og:title', content: site.title });
        meta({ property: 'og:description', content: site.description });
        meta({ name: 'twitter:card', content: 'summary_large_image' });
        meta({ name: 'twitter:title', content: site.title });
        meta({ name: 'twitter:description', content: site.description });
        if (publicUrl.url) {
          meta({ property: 'og:url', content: publicUrl.url });
          meta({ property: 'og:image', content: `${publicUrl.url}og-image.jpg` });
          meta({ property: 'og:image:width', content: '1200' });
          meta({ property: 'og:image:height', content: '630' });
          meta({ property: 'og:image:alt', content: `${site.title} preview` });
          meta({ name: 'twitter:image', content: `${publicUrl.url}og-image.jpg` });
          link({ rel: 'canonical', href: publicUrl.url });
        }
        tags.push({ tag: 'style', children: brandCss(), injectTo: 'head' });

        // Preload the two Latin text fonts used above the fold.
        if (ctx.bundle) {
          for (const file of Object.keys(ctx.bundle)) {
            if (/(inter-latin-wght-normal|cormorant-garamond-latin-500-normal)-.*\.woff2$/.test(file)) {
              link({ rel: 'preload', href: `./${file}`, as: 'font', type: 'font/woff2', crossorigin: '' });
            }
          }
        }
        return { html: html.replace('<html lang="en">', `<html lang="${site.locale}">`), tags };
      },
    },
    configureServer(server) {
      // Serve generated files during development (no service worker in dev).
      server.middlewares.use(async (req, res, next) => {
        const url = (req.url ?? '').split('?')[0].replace(/^\/+/, '');
        try {
          if (url === 'manifest.webmanifest') {
            res.setHeader('Content-Type', 'application/manifest+json');
            return res.end(manifestJson());
          }
          if (url === 'icons/favicon.svg') {
            res.setHeader('Content-Type', 'image/svg+xml');
            return res.end(iconSvg(64, 0.86, true));
          }
          const icon = ICONS.find((i) => i.file === url);
          if (icon) {
            res.setHeader('Content-Type', 'image/png');
            return res.end(await renderPng(iconSvg(icon.size, icon.scale, icon.rounded), icon.size));
          }
          if (url === 'og-image.jpg') {
            res.setHeader('Content-Type', 'image/jpeg');
            return res.end(await socialImage());
          }
          if (url === 'offline.html') {
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            return res.end(offlineHtml());
          }
        } catch (error) {
          return next(error);
        }
        next();
      });
    },
    async generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'manifest.webmanifest', source: manifestJson() });
      this.emitFile({ type: 'asset', fileName: 'icons/favicon.svg', source: iconSvg(64, 0.86, true) });
      for (const icon of ICONS) {
        this.emitFile({ type: 'asset', fileName: icon.file, source: await renderPng(iconSvg(icon.size, icon.scale, icon.rounded), icon.size) });
      }
      this.emitFile({ type: 'asset', fileName: 'og-image.jpg', source: await socialImage() });
      this.emitFile({ type: 'asset', fileName: 'offline.html', source: offlineHtml() });
    },
    closeBundle() {
      if (resolved.command !== 'build') return;
      const outDir = path.resolve(resolved.root, resolved.build.outDir);
      if (!fs.existsSync(path.join(outDir, 'index.html'))) return;
      const precache = precacheList(outDir);
      const hash = crypto.createHash('sha256');
      for (const file of precache) hash.update(file).update(fs.readFileSync(path.join(outDir, file)));
      const version = hash.digest('hex').slice(0, 12);
      const { map } = showcase.integrations;
      const tileHosts = (() => {
        try {
          return [new URL(map.tileUrl.replace(/\{[^}]+\}/g, 'a')).hostname.replace(/^a\./, '')];
        } catch {
          return [];
        }
      })();
      const settings = {
        appId: showcase.site.appId,
        version,
        builtAt,
        precache,
        mediaLimit: 60,
        tileCaching: map.enabled && map.allowServiceWorkerCaching,
        tileHosts,
        tileLimit: 300,
      };
      const template = fs.readFileSync(path.join(ROOT, 'build/service-worker.js'), 'utf8');
      fs.writeFileSync(path.join(outDir, 'sw.js'), `const SHOWCASE = ${JSON.stringify(settings)};\n${template}`);
      fs.writeFileSync(path.join(outDir, '.nojekyll'), '');
      // Web fonts are CSS assets, so append their licenses (SIL OFL 1.1) to the bundled-license file.
      const licenseFile = path.join(outDir, 'third-party-licenses.md');
      if (fs.existsSync(licenseFile)) {
        const fonts = [
          ['Cormorant Garamond (@fontsource/cormorant-garamond)', '@fontsource/cormorant-garamond/LICENSE'],
          ['Inter (@fontsource-variable/inter)', '@fontsource-variable/inter/LICENSE'],
        ];
        const extra = fonts
          .filter(([, file]) => fs.existsSync(path.join(ROOT, 'node_modules', file)))
          .map(([name, file]) => `\n## ${name} (OFL-1.1)\n\n\`\`\`\n${fs.readFileSync(path.join(ROOT, 'node_modules', file), 'utf8').trim()}\n\`\`\`\n`)
          .join('');
        fs.appendFileSync(licenseFile, extra);
      }
      const kb = precache.reduce((sum, f) => sum + fs.statSync(path.join(outDir, f)).size, 0) / 1024;
      console.log(`[showcase] sw.js: version ${version}, ${precache.length} precached files (${kb.toFixed(0)} KB)`);
      console.log(`[showcase] public URL: ${publicUrl.url ?? '(none: QR codes disabled)'} [${publicUrl.source}]`);
    },
  };
}
