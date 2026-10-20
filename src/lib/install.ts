import { useSyncExternalStore } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export type InstallPlatform =
  | 'installed'
  | 'prompt'
  | 'ios'
  | 'mac-safari'
  | 'android-firefox'
  | 'samsung'
  | 'android-other'
  | 'firefox-desktop'
  | 'chromium-desktop'
  | 'other';

let deferred: BeforeInstallPromptEvent | null = null;
let installed = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((fn) => fn());

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferred = event as BeforeInstallPromptEvent;
    emit();
  });
  window.addEventListener('appinstalled', () => {
    installed = true;
    deferred = null;
    emit();
  });
}

export function isStandalone(): boolean {
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function detectInstallPlatform(): InstallPlatform {
  if (installed || isStandalone()) return 'installed';
  if (deferred) return 'prompt';
  const ua = navigator.userAgent;
  const isIOS = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (isIOS) return 'ios';
  if (/Android/.test(ua)) {
    if (/SamsungBrowser/.test(ua)) return 'samsung';
    if (/Firefox/.test(ua)) return 'android-firefox';
    return 'android-other';
  }
  if (/Firefox/.test(ua)) return 'firefox-desktop';
  if (/Macintosh/.test(ua) && /Safari/.test(ua) && !/Chrome|Chromium|Edg|OPR/.test(ua)) return 'mac-safari';
  if (/Chrome|Chromium|Edg/.test(ua)) return 'chromium-desktop';
  return 'other';
}

export async function promptInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
  if (!deferred) return 'unavailable';
  const event = deferred;
  deferred = null;
  await event.prompt();
  const choice = await event.userChoice;
  emit();
  return choice.outcome;
}

export function useInstallPlatform(): InstallPlatform {
  return useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    detectInstallPlatform,
    () => 'other' as InstallPlatform,
  );
}
