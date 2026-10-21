import { publicUrl } from 'virtual:showcase-build';
import { joinHashRoute } from '../config/public-url';
import { href } from './router';

/**
 * Customer-facing links are built from the configured public URL, never from the
 * current address, so QR codes can't point at localhost or a preview server.
 */
export function publicLink(route: string): string | null {
  return publicUrl ? joinHashRoute(publicUrl, route.replace(/^#/, '')) : null;
}

export function propertyLink(id: string): string | null {
  return publicLink(href.property(id));
}

/** Link for the share button. Falls back to the current page address only when no public URL exists. */
export function shareLink(route: string): string {
  return publicLink(route) ?? `${window.location.origin}${window.location.pathname}${route}`;
}

export type ShareOutcome = 'shared' | 'copied' | 'cancelled' | 'manual';

export async function shareOrCopy(data: { title: string; text: string; url: string }): Promise<ShareOutcome> {
  if (navigator.share && window.matchMedia('(pointer: coarse)').matches) {
    try {
      await navigator.share(data);
      return 'shared';
    } catch (error) {
      if ((error as DOMException)?.name === 'AbortError') return 'cancelled';
    }
  }
  return (await copyText(data.url)) ? 'copied' : 'manual';
}

export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to the legacy path
  }
  try {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    return ok;
  } catch {
    return false;
  }
}
