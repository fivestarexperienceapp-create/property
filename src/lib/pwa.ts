import { useSyncExternalStore } from 'react';

interface PwaState {
  /** A new version finished installing and is waiting for the visitor to refresh. */
  updateReady: boolean;
  /** First install finished: the app shell now works offline. */
  offlineReady: boolean;
}

let state: PwaState = { updateReady: false, offlineReady: false };
const listeners = new Set<() => void>();
let waiting: ServiceWorker | null = null;
let userAcceptedUpdate = false;

function set(patch: Partial<PwaState>) {
  state = { ...state, ...patch };
  listeners.forEach((fn) => fn());
}

function markWaiting(worker: ServiceWorker) {
  waiting = worker;
  set({ updateReady: true });
}

export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  const register = async () => {
    try {
      // Relative URL + scope keep the worker inside this app's folder on GitHub Pages.
      const registration = await navigator.serviceWorker.register('./sw.js', { scope: './' });
      if (registration.waiting && navigator.serviceWorker.controller) markWaiting(registration.waiting);
      registration.addEventListener('updatefound', () => {
        const worker = registration.installing;
        if (!worker) return;
        worker.addEventListener('statechange', () => {
          if (worker.state !== 'installed') return;
          if (navigator.serviceWorker.controller) markWaiting(worker);
          else set({ offlineReady: true });
        });
      });
      const check = () => registration.update().catch(() => undefined);
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') check();
      });
      window.setInterval(check, 60 * 60 * 1000);
    } catch {
      // Service workers can be blocked (private modes, policies). The site still works online.
    }
  };
  if (document.readyState === 'complete') register();
  else window.addEventListener('load', register, { once: true });

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (userAcceptedUpdate) window.location.reload();
  });
}

export function applyUpdate() {
  userAcceptedUpdate = true;
  if (waiting) waiting.postMessage({ type: 'SKIP_WAITING' });
  else window.location.reload();
}

export function dismissUpdate() {
  set({ updateReady: false });
}

export function usePwaState(): PwaState {
  return useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    () => state,
    () => state,
  );
}

function subscribeOnline(fn: () => void) {
  window.addEventListener('online', fn);
  window.addEventListener('offline', fn);
  return () => {
    window.removeEventListener('online', fn);
    window.removeEventListener('offline', fn);
  };
}

export function useOnline(): boolean {
  return useSyncExternalStore(subscribeOnline, () => navigator.onLine, () => true);
}
