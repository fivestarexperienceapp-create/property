import { CheckCircle2, Info, X } from 'lucide-react';
import { dismissToast, useToasts } from '../../state/toast';

export function Toaster() {
  const toasts = useToasts();
  return (
    <div aria-live="polite" role="status" className="pointer-events-none fixed inset-x-0 bottom-24 z-[70] flex flex-col items-center gap-2 px-4 lg:bottom-8" data-print-hide>
      {toasts.map((t) => (
        <div key={t.id} className="fade-up pointer-events-auto flex max-w-md items-center gap-3 rounded-full bg-ink py-2.5 pr-2.5 pl-4 text-sm text-white shadow-[var(--shadow-lift)]">
          {t.tone === 'success' ? <CheckCircle2 aria-hidden className="size-4 shrink-0 text-sage" /> : <Info aria-hidden className="size-4 shrink-0 text-sage" />}
          <span>{t.text}</span>
          <button type="button" onClick={() => dismissToast(t.id)} className="rounded-full p-1 text-white/70 hover:text-white" aria-label="Dismiss notification">
            <X aria-hidden className="size-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
