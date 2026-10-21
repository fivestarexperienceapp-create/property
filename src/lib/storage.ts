import { useCallback, useMemo, useSyncExternalStore } from 'react';
import { site } from '../config';

/**
 * On-device storage, namespaced by app id AND the app's path, so apps hosted on the
 * same GitHub Pages origin (username.github.io/app-a/, /app-b/) never share data.
 * Falls back to memory when storage is blocked (private modes, strict settings).
 */
function appPath(): string {
  try {
    return new URL('./', window.location.href).pathname;
  } catch {
    return '/';
  }
}

export const STORAGE_PREFIX = `pshow:${site.appId}@${appPath()}:`;

const memory = new Map<string, string>();
const listeners = new Map<string, Set<() => void>>();

function probe(): boolean {
  try {
    const key = `${STORAGE_PREFIX}__probe`;
    window.localStorage.setItem(key, '1');
    window.localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

export const storageAvailable = typeof window !== 'undefined' && probe();

function readRaw(key: string): string | null {
  const full = STORAGE_PREFIX + key;
  if (!storageAvailable) return memory.get(full) ?? null;
  try {
    return window.localStorage.getItem(full);
  } catch {
    return memory.get(full) ?? null;
  }
}

function notify(key: string) {
  listeners.get(key)?.forEach((fn) => fn());
}

function writeRaw(key: string, value: string | null): boolean {
  const full = STORAGE_PREFIX + key;
  let persisted = false;
  if (storageAvailable) {
    try {
      if (value === null) window.localStorage.removeItem(full);
      else window.localStorage.setItem(full, value);
      persisted = true;
    } catch {
      persisted = false;
    }
  }
  if (!persisted) {
    if (value === null) memory.delete(full);
    else memory.set(full, value);
  }
  notify(key);
  return persisted;
}

if (typeof window !== 'undefined') {
  // Keep multiple open tabs of the same app in sync.
  window.addEventListener('storage', (event) => {
    if (event.key?.startsWith(STORAGE_PREFIX)) notify(event.key.slice(STORAGE_PREFIX.length));
  });
}

function subscribe(key: string, fn: () => void) {
  let set = listeners.get(key);
  if (!set) listeners.set(key, (set = new Set()));
  set.add(fn);
  return () => set!.delete(fn);
}

export function readJson<T>(key: string, fallback: T): T {
  const raw = readRaw(key);
  if (raw == null) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJson<T>(key: string, value: T): boolean {
  return writeRaw(key, JSON.stringify(value));
}

export function removeKey(key: string) {
  writeRaw(key, null);
}

/** React state persisted on this device. `sanitize` guards against malformed stored data. */
export function useStoredState<T>(key: string, fallback: T, sanitize: (value: unknown) => T) {
  const raw = useSyncExternalStore(
    useCallback((fn) => subscribe(key, fn), [key]),
    () => readRaw(key),
    () => null,
  );
  const value = useMemo(() => {
    if (raw == null) return fallback;
    try {
      return sanitize(JSON.parse(raw));
    } catch {
      return fallback;
    }
    // fallback/sanitize are expected to be stable module-level values
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [raw]);
  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      const current = (() => {
        const r = readRaw(key);
        if (r == null) return fallback;
        try {
          return sanitize(JSON.parse(r));
        } catch {
          return fallback;
        }
      })();
      const resolved = typeof next === 'function' ? (next as (prev: T) => T)(current) : next;
      writeJson(key, resolved);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  );
  return [value, setValue] as const;
}
