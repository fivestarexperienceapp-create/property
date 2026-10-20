/**
 * Public URL helpers shared by the build plugin and the app.
 * QR codes and share links must point at a real, public https address.
 */

const LOCAL_HOSTS = /^(localhost|127(?:\.\d{1,3}){3}|0\.0\.0\.0|\[?::1\]?|.*\.local|.*\.localhost)$/i;
const PRIVATE_IPV4 = /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.)/;
const PLACEHOLDERS = /USERNAME|REPOSITORY|your-?(user|repo|domain)|example\.(com|org|net)/i;

export type PublicUrlCheck = { ok: true; url: string } | { ok: false; reason: string };

/** Validates and normalizes a public site URL (https, not local, trailing slash, no hash/query). */
export function checkPublicUrl(raw: string | undefined | null): PublicUrlCheck {
  const value = (raw ?? '').trim();
  if (!value) return { ok: false, reason: 'No public URL is configured.' };
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return { ok: false, reason: `"${value}" is not a valid URL.` };
  }
  if (url.protocol !== 'https:') return { ok: false, reason: `Public URL must use https (got ${url.protocol}).` };
  if (LOCAL_HOSTS.test(url.hostname) || PRIVATE_IPV4.test(url.hostname)) {
    return { ok: false, reason: `Public URL cannot point to a local or private address (${url.hostname}).` };
  }
  if (PLACEHOLDERS.test(value)) return { ok: false, reason: `Public URL "${value}" still contains a placeholder.` };
  url.hash = '';
  url.search = '';
  if (url.pathname.endsWith('/index.html')) url.pathname = url.pathname.slice(0, -'index.html'.length);
  if (!url.pathname.endsWith('/')) url.pathname += '/';
  return { ok: true, url: url.toString() };
}

/** Derives https://owner.github.io/repo/ from GITHUB_REPOSITORY ("owner/repo"). */
export function githubPagesUrlFromRepository(repository: string | undefined): string | null {
  if (!repository || !repository.includes('/')) return null;
  const [owner, repo] = repository.split('/');
  if (!owner || !repo) return null;
  const host = `${owner.toLowerCase()}.github.io`;
  return repo.toLowerCase() === host ? `https://${host}/` : `https://${host}/${repo}/`;
}

/** Joins a public base URL with a hash route, e.g. ("https://a.github.io/r/", "/homes/x"). */
export function joinHashRoute(base: string, route: string): string {
  const clean = route.startsWith('/') ? route : `/${route}`;
  return `${base}#${clean}`;
}
