import { useEffect, useId, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  /** Optional eyebrow above the title. */
  eyebrow?: ReactNode;
}

/**
 * Accessible dialog built on <dialog>: focus is contained, Escape closes, and the
 * page behind is inert. Bottom sheet on phones, centered panel on larger screens.
 */
export function Sheet({ open, onClose, title, description, children, size = 'md', eyebrow }: SheetProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      document.documentElement.style.overflow = 'hidden';
    } else if (!open && dialog.open) {
      dialog.close();
    }
    return () => {
      if (!open) document.documentElement.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const handleClose = () => {
      document.documentElement.style.overflow = '';
      onClose();
    };
    dialog.addEventListener('close', handleClose);
    return () => dialog.removeEventListener('close', handleClose);
  }, [onClose]);

  useEffect(() => () => {
    document.documentElement.style.overflow = '';
  }, []);

  const widths = { sm: 'sm:max-w-md', md: 'sm:max-w-lg', lg: 'sm:max-w-2xl' };

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      onClick={(e) => {
        if (e.target === ref.current) ref.current?.close();
      }}
      className="m-0 mt-auto w-full bg-transparent p-0 sm:m-auto"
    >
      {open && (
        <div
          className={`sheet-in mx-auto flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-canvas text-ink shadow-[var(--shadow-lift)] sm:rounded-3xl ${widths[size]}`}
        >
          <div className="flex items-start gap-4 border-b border-line px-5 pt-5 pb-4 sm:px-7 sm:pt-6">
            <div className="min-w-0 flex-1">
              {eyebrow && <p className="eyebrow mb-1.5">{eyebrow}</p>}
              <h2 id={titleId} className="font-display text-2xl leading-tight sm:text-3xl">
                {title}
              </h2>
              {description && (
                <p id={descId} className="mt-1.5 text-sm leading-relaxed text-muted">
                  {description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => ref.current?.close()}
              className="-mr-1 inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-line bg-surface hover:border-ink/30"
              aria-label="Close"
            >
              <X aria-hidden className="size-5" />
            </button>
          </div>
          <div className="safe-bottom overflow-y-auto overscroll-contain px-5 pt-5 sm:px-7 sm:pb-7">{children}</div>
        </div>
      )}
    </dialog>
  );
}
