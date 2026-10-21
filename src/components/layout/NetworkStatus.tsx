import { RefreshCw, WifiOff, X } from 'lucide-react';
import { builtAt } from 'virtual:showcase-build';
import { applyUpdate, dismissUpdate, useOnline, usePwaState } from '../../lib/pwa';
import { formatSavedDate } from '../../lib/format';

/** Offline + stale-content notice and the "new version" prompt. */
export function NetworkStatus() {
  const online = useOnline();
  const { updateReady } = usePwaState();
  const saved = formatSavedDate(builtAt);
  return (
    <>
      {!online && (
        <div role="status" className="sticky top-16 z-30 border-b border-[#e7d8b8] bg-[#faf1dc] text-[#5b4a22]" data-print-hide>
          <p className="container-page flex items-center gap-2 py-2 text-sm">
            <WifiOff aria-hidden className="size-4 shrink-0" />
            <span>
              <strong className="font-semibold">You’re offline.</strong> Showing details saved on this device{saved ? ` (published ${saved})` : ''}. Prices and availability may have changed.
            </span>
          </p>
        </div>
      )}
      {updateReady && (
        <div role="alert" className="fade-up fixed inset-x-3 bottom-24 z-[60] mx-auto flex max-w-md items-center gap-3 rounded-2xl bg-ink p-3 pl-4 text-sm text-white shadow-[var(--shadow-lift)] lg:bottom-6" data-print-hide>
          <RefreshCw aria-hidden className="size-4 shrink-0 text-sage" />
          <span className="flex-1">Updated listing details are available.</span>
          <button type="button" onClick={applyUpdate} className="rounded-full bg-white px-3.5 py-1.5 font-semibold text-ink hover:bg-canvas">
            Refresh
          </button>
          <button type="button" onClick={dismissUpdate} aria-label="Dismiss update notice" className="rounded-full p-1.5 text-white/70 hover:text-white">
            <X aria-hidden className="size-4" />
          </button>
        </div>
      )}
    </>
  );
}
