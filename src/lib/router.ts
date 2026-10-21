import { useSyncExternalStore } from 'react';

export type Route =
  | { name: 'home' }
  | { name: 'property'; id: string }
  | { name: 'homes' }
  | { name: 'compare' }
  | { name: 'saved' }
  | { name: 'agent' }
  | { name: 'about' }
  | { name: 'not-found'; path: string };

/** Hash routes (#/homes/the-willow-house) work on GitHub Pages without server rewrites. */
export function parseHash(hash: string): Route {
  const path = decodeURIComponent(hash.replace(/^#/, '').split('?')[0]).replace(/\/+$/, '') || '/';
  const parts = path.split('/').filter(Boolean);
  if (path === '/' || parts.length === 0) return { name: 'home' };
  if (parts[0] === 'homes' && parts.length === 1) return { name: 'homes' };
  if (parts[0] === 'homes' && parts.length === 2) return { name: 'property', id: parts[1] };
  if (parts.length === 1 && ['compare', 'saved', 'agent', 'about'].includes(parts[0])) {
    return { name: parts[0] as 'compare' | 'saved' | 'agent' | 'about' };
  }
  return { name: 'not-found', path };
}

export const href = {
  home: () => '#/',
  homes: () => '#/homes',
  property: (id: string) => `#/homes/${encodeURIComponent(id)}`,
  compare: () => '#/compare',
  saved: () => '#/saved',
  agent: () => '#/agent',
  about: () => '#/about',
};

function subscribe(callback: () => void) {
  window.addEventListener('hashchange', callback);
  return () => window.removeEventListener('hashchange', callback);
}

export function useHash(): string {
  return useSyncExternalStore(subscribe, () => window.location.hash, () => '');
}

export function navigate(to: string) {
  if (window.location.hash === to) return;
  window.location.hash = to;
}
