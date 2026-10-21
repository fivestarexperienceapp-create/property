/// <reference types="vite/client" />

declare module 'virtual:showcase-build' {
  /** Resolved public site URL ending in "/", or null when unavailable (QR codes disabled). */
  export const publicUrl: string | null;
  /** ISO timestamp of the build; used for the offline "saved on" notice. */
  export const builtAt: string;
  export const photoWidths: readonly number[];
}
