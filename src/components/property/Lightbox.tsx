import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { Photo } from '../../config/types';
import { photoSrcSet, photoUrl } from '../../lib/media';
import { SafeImg } from '../ui/SafeImg';

/**
 * Fullscreen gallery: swipe left/right on touch screens, drag down to close,
 * arrow keys and Home/End on keyboards, Escape to close.
 */
export function Lightbox({ photos, index, onIndex, onClose, title }: { photos: Photo[]; index: number | null; onIndex: (i: number) => void; onClose: () => void; title: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const thumbsRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; id: number; axis: 'x' | 'y' | null; t: number } | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [failed, setFailed] = useState<Record<string, boolean>>({});
  const open = index !== null;
  const count = photos.length;
  const current = index ?? 0;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      document.documentElement.style.overflow = 'hidden';
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onDialogClose = () => {
      document.documentElement.style.overflow = '';
      onClose();
    };
    dialog.addEventListener('close', onDialogClose);
    return () => dialog.removeEventListener('close', onDialogClose);
  }, [onClose]);

  const go = useCallback((next: number) => onIndex((next + count) % count), [count, onIndex]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(current + 1);
      else if (e.key === 'ArrowLeft') go(current - 1);
      else if (e.key === 'Home') onIndex(0);
      else if (e.key === 'End') onIndex(count - 1);
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, current, count, go, onIndex]);

  useEffect(() => {
    const strip = thumbsRef.current;
    const thumb = strip?.querySelector<HTMLElement>(`[data-index="${current}"]`);
    if (strip && thumb) strip.scrollTo({ left: thumb.offsetLeft - strip.clientWidth / 2 + thumb.clientWidth / 2, behavior: 'smooth' });
  }, [current, open]);

  const onPointerDown = (e: ReactPointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    drag.current = { x: e.clientX, y: e.clientY, id: e.pointerId, axis: null, t: performance.now() };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: ReactPointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (!d.axis && Math.hypot(dx, dy) > 8) d.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
    if (d.axis) {
      setDragging(true);
      setOffset(d.axis === 'x' ? { x: dx, y: 0 } : { x: 0, y: Math.max(0, dy) });
    }
  };
  const onPointerUp = (e: ReactPointerEvent) => {
    const d = drag.current;
    drag.current = null;
    setDragging(false);
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    const velocity = Math.abs(dx) / Math.max(1, performance.now() - d.t);
    setOffset({ x: 0, y: 0 });
    if (d.axis === 'x' && (Math.abs(dx) > 60 || velocity > 0.5)) go(current + (dx < 0 ? 1 : -1));
    else if (d.axis === 'y' && dy > 110) dialogRef.current?.close();
  };

  const photo = photos[current];
  const nearby = (i: number) => Math.abs(i - current) <= 1 || (current === 0 && i === count - 1) || (current === count - 1 && i === 0);

  return (
    <dialog ref={dialogRef} aria-label={`${title} photo gallery`} className="m-0 h-dvh w-screen bg-[#141311] p-0 text-white backdrop:bg-black">
      {open && photo && (
        <div className="fade-in flex h-full flex-col" style={{ opacity: offset.y ? Math.max(0.4, 1 - offset.y / 400) : 1 }}>
          <div className="flex items-center gap-3 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2 md:px-6">
            <p className="text-sm font-medium tabular-nums text-white/80" aria-live="polite">
              {current + 1} / {count}
            </p>
            <p className="min-w-0 flex-1 truncate text-sm text-white/70">{title}</p>
            <button
              type="button"
              autoFocus
              onClick={() => dialogRef.current?.close()}
              className="inline-flex size-11 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
              aria-label="Close gallery"
            >
              <X aria-hidden className="size-5" />
            </button>
          </div>

          <div
            className="relative min-h-0 flex-1 touch-none overflow-hidden select-none"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <div
              className={`flex h-full ${dragging ? '' : 'transition-transform duration-300 ease-[var(--ease-soft)] motion-reduce:transition-none'}`}
              style={{ transform: `translate3d(calc(${-current * 100}% + ${offset.x}px), ${offset.y}px, 0)` }}
            >
              {photos.map((p, i) => (
                <div key={p.id} className="flex h-full w-full shrink-0 items-center justify-center px-2 md:px-20" aria-hidden={i !== current}>
                  {nearby(i) &&
                    (failed[p.id] ? (
                      <p className="text-sm text-white/70">This photo isn’t available offline.</p>
                    ) : (
                      <img
                        src={photoUrl(p, 1920)}
                        srcSet={photoSrcSet(p)}
                        sizes="100vw"
                        alt={p.alt}
                        draggable={false}
                        onError={() => setFailed((f) => ({ ...f, [p.id]: true }))}
                        className="max-h-full max-w-full rounded-lg object-contain"
                      />
                    ))}
                </div>
              ))}
            </div>
            {count > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => go(current - 1)}
                  className="absolute top-1/2 left-3 hidden size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 backdrop-blur hover:bg-white/25 sm:inline-flex"
                  aria-label="Previous photo"
                >
                  <ChevronLeft aria-hidden className="size-6" />
                </button>
                <button
                  type="button"
                  onClick={() => go(current + 1)}
                  className="absolute top-1/2 right-3 hidden size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 backdrop-blur hover:bg-white/25 sm:inline-flex"
                  aria-label="Next photo"
                >
                  <ChevronRight aria-hidden className="size-6" />
                </button>
              </>
            )}
          </div>

          <div className="px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] md:px-6">
            <div className="mx-auto max-w-4xl text-center">
              <p className="font-display text-xl">{photo.caption ?? photo.alt}</p>
              <p className="mt-1 text-xs text-white/55">
                {photo.credit.label}
                {photo.credit.author ? ` · ${photo.credit.author}` : ''} · {photo.credit.license}
                {photo.credit.isDemoArtwork ? ' · Illustrative image; may not depict this home.' : ''}
              </p>
              <p className="mt-1 text-xs text-white/45 sm:hidden">Swipe to browse · drag down to close</p>
            </div>
            <div ref={thumbsRef} className="no-scrollbar mx-auto mt-3 hidden max-w-5xl gap-2 overflow-x-auto md:flex">
              {photos.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  data-index={i}
                  onClick={() => onIndex(i)}
                  aria-label={`Show photo ${i + 1}: ${p.caption ?? p.alt}`}
                  aria-current={i === current ? 'true' : undefined}
                  className={`h-14 w-20 shrink-0 overflow-hidden rounded-md ring-2 transition ${i === current ? 'opacity-100 ring-white' : 'opacity-50 ring-transparent hover:opacity-90'}`}
                >
                  <SafeImg src={photoUrl(p, 640)} alt="" loading="lazy" className="size-full object-cover" draggable={false} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </dialog>
  );
}
