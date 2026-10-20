/* Property showcase service worker.
 *
 * The build prepends `const SHOWCASE = {...}` with the app id, version, precache list
 * and caching options. Everything here is scoped to this app:
 *  - cache names include the app id AND the registration scope path, so several
 *    apps on one GitHub Pages origin never read or delete each other's caches;
 *  - only navigations to this app's own entry page are intercepted, so a root-site
 *    app never hijacks pages of other repositories on the same origin;
 *  - non-GET requests (inquiries, form posts) are never touched or cached;
 *  - third-party map tiles are not cached unless explicitly allowed.
 */
/* global SHOWCASE */

const SCOPE = self.registration.scope;
const SCOPE_PATH = new URL(SCOPE).pathname;
const PREFIX = `pshow:${SHOWCASE.appId}@${SCOPE_PATH}:`;
const SHELL_CACHE = `${PREFIX}shell:${SHOWCASE.version}`;
const MEDIA_CACHE = `${PREFIX}media`;
const TILE_CACHE = `${PREFIX}tiles`;
const INDEX_URL = new URL('index.html', SCOPE).href;
const OFFLINE_URL = new URL('offline.html', SCOPE).href;
const PRECACHE_URLS = SHOWCASE.precache.map((path) => new URL(path, SCOPE).href);
const PRECACHED = new Set(PRECACHE_URLS);
const NAVIGATION_TIMEOUT_MS = 4000;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) =>
      cache.addAll(PRECACHE_URLS.map((url) => new Request(url, { cache: 'reload' }))),
    ),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((name) => name.startsWith(PREFIX))
          .filter((name) => name !== SHELL_CACHE && name !== MEDIA_CACHE && !(name === TILE_CACHE && SHOWCASE.tileCaching))
          .map((name) => caches.delete(name)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('message', (event) => {
  const type = event.data && event.data.type;
  if (type === 'SKIP_WAITING') self.skipWaiting();
  if (type === 'GET_VERSION' && event.ports[0]) {
    event.ports[0].postMessage({ version: SHOWCASE.version, builtAt: SHOWCASE.builtAt });
  }
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  if (url.origin === self.location.origin) {
    if (request.mode === 'navigate') {
      if (url.pathname === SCOPE_PATH || url.pathname === `${SCOPE_PATH}index.html`) {
        event.respondWith(handleNavigation(request));
      }
      return;
    }
    if (!url.pathname.startsWith(SCOPE_PATH)) return;
    const key = url.origin + url.pathname;
    const relative = url.pathname.slice(SCOPE_PATH.length);
    if (PRECACHED.has(key) || relative.startsWith('assets/')) {
      event.respondWith(cacheFirst(request, SHELL_CACHE, key));
    } else if (relative.startsWith('media/')) {
      event.respondWith(cacheFirst(request, MEDIA_CACHE, key, SHOWCASE.mediaLimit));
    }
    return;
  }

  if (SHOWCASE.tileCaching && SHOWCASE.tileHosts.some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`))) {
    event.respondWith(cacheFirst(request, TILE_CACHE, request.url, SHOWCASE.tileLimit));
  }
});

async function handleNavigation(request) {
  try {
    const response = await withTimeout(fetch(request), NAVIGATION_TIMEOUT_MS);
    if (response.ok) return response;
    throw new Error(`Navigation failed with ${response.status}`);
  } catch {
    const shell = await caches.open(SHELL_CACHE);
    return (
      (await shell.match(INDEX_URL)) ||
      (await shell.match(OFFLINE_URL)) ||
      new Response('<h1>Offline</h1><p>Please reconnect and try again.</p>', {
        status: 503,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      })
    );
  }
}

async function cacheFirst(request, cacheName, key, limit) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(key);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok && (response.type === 'basic' || response.type === 'cors')) {
      await cache.put(key, response.clone());
      if (limit) await trim(cache, limit);
    }
    return response;
  } catch (error) {
    // Let the page show its own placeholder for missing images.
    return Response.error();
  }
}

/** Keeps runtime caches small: removes the oldest entries beyond the limit. */
async function trim(cache, limit) {
  const keys = await cache.keys();
  const excess = keys.length - limit;
  for (let i = 0; i < excess; i += 1) await cache.delete(keys[i]);
}

function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}
