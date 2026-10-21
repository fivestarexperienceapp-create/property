/**
 * Serves dist/ the way GitHub Pages does, under a repository subpath, so you can
 * check paths, the manifest and the service worker before deploying.
 *
 *   npm run preview:pages                      → http://localhost:4173/property-showcase/
 *   npm run preview:pages -- /my-repo/         → http://localhost:4173/my-repo/
 *   node scripts/serve-pages.mjs /a/=dist-a /b/=dist-b   (several apps on one origin)
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const port = Number(process.env.PORT || 4173);
const args = process.argv.slice(2);
const mounts = (args.length ? args : ['/property-showcase/']).map((arg) => {
  const [base, dir = 'dist'] = arg.split('=');
  const prefix = `/${base.replace(/^\/|\/$/g, '')}/`.replace('//', '/');
  return { prefix, dir: path.resolve(ROOT, dir) };
});

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ics': 'text/calendar',
};

http
  .createServer((req, res) => {
    const url = new URL(req.url ?? '/', `http://localhost:${port}`);
    const mount = mounts.find((m) => url.pathname === m.prefix.slice(0, -1) || url.pathname.startsWith(m.prefix));
    if (!mount) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('Not found (outside any mounted app)');
    }
    if (url.pathname === mount.prefix.slice(0, -1)) {
      res.writeHead(301, { Location: mount.prefix });
      return res.end();
    }
    let rel = decodeURIComponent(url.pathname.slice(mount.prefix.length));
    if (!rel || rel.endsWith('/')) rel += 'index.html';
    const file = path.join(mount.dir, rel);
    if (!file.startsWith(mount.dir) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end('<h1>404</h1>');
    }
    res.writeHead(200, {
      'Content-Type': types[path.extname(file)] ?? 'application/octet-stream',
      'Cache-Control': 'max-age=600',
    });
    fs.createReadStream(file).pipe(res);
  })
  .listen(port, () => {
    for (const m of mounts) console.log(`Serving ${path.relative(ROOT, m.dir)} at http://localhost:${port}${m.prefix}`);
  });
