import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { CalendarCheck, CalendarPlus, ChevronLeft, ChevronRight, Heart, ImageOff, MessageCircleQuestion, Pause, Play, X } from 'lucide-react';
import type { Property } from '../../config/types';
import { upcomingOpenHouses } from '../../lib/format';
import { downloadBlob, openHouseIcs } from '../../lib/ics';
import { photoSrcSet, photoUrl } from '../../lib/media';
import { usePrefersReducedMotion } from '../../lib/motion';
import { propertyLink } from '../../lib/share';
import { slideDurationMs, type Slide } from '../../lib/stories';
import { useFavorites } from '../../state/collections';
import { useContact } from '../contact/ContactContext';
import { BrandMark } from '../ui/BrandMark';

const HOLD_MS = 220;
const SWIPE_PX = 50;

/**
 * Full-screen feature stories. Tap the right side (or →) for the next slide and the
 * left side (or ←) to go back, swipe sideways, press and hold to pause, drag down or
 * press Escape to close. Slides advance on their own unless reduced motion is on.
 */
export function StoryViewer({ property, slides, start, onClose }: { property: Property; slides: Slide[]; start: number | null; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const progress = useRef(0);
  const gesture = useRef<{ x: number; y: number; id: number; moved: boolean; held: boolean; timer: number } | null>(null);
  // A swipe or hold ends with a click on the tap zone underneath; ignore it briefly.
  const suppressUntil = useRef(0);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [held, setHeld] = useState(false);
  const [pageHidden, setPageHidden] = useState(false);
  const [ended, setEnded] = useState(false);
  const [failed, setFailed] = useState<Record<string, boolean>>({});
  const [dragY, setDragY] = useState(0);
  const reducedMotion = usePrefersReducedMotion();
  const { openInquiry } = useContact();
  const favorites = useFavorites();

  const open = start !== null;
  const duration = slideDurationMs(property);
  const autoplay = !reducedMotion;
  const running = open && autoplay && !paused && !held && !pageHidden && !ended;
  const slide = slides[Math.min(index, slides.length - 1)];

  const close = useCallback(() => dialogRef.current?.close(), []);

  const go = useCallback(
    (next: number) => {
      if (next >= slides.length) {
        close();
        return;
      }
      progress.current = 0;
      setEnded(false);
      setIndex(Math.max(0, next));
    },
    [slides.length, close],
  );

  // Open / close the dialog
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      progress.current = 0;
      setIndex(start ?? 0);
      setPaused(false);
      setEnded(false);
      dialog.showModal();
      // showModal() focuses the first control (a tap zone); start on Close instead.
      requestAnimationFrame(() => closeRef.current?.focus());
      document.documentElement.style.overflow = 'hidden';
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open, start]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleClose = () => {
      document.documentElement.style.overflow = '';
      onClose();
    };
    dialog.addEventListener('close', handleClose);
    return () => dialog.removeEventListener('close', handleClose);
  }, [onClose]);

  // Pause while the tab or app is in the background
  useEffect(() => {
    const onVisibility = () => setPageHidden(document.visibilityState === 'hidden');
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  // Progress timer (drives the current bar directly to avoid re-rendering every frame)
  useEffect(() => {
    if (!running) return;
    let last = performance.now();
    let frame = requestAnimationFrame(function tick(now) {
      progress.current += (now - last) / duration;
      last = now;
      if (barRef.current) barRef.current.style.transform = `scaleX(${Math.min(1, progress.current)})`;
      if (progress.current >= 1) {
        if (index < slides.length - 1) go(index + 1);
        else setEnded(true);
        return;
      }
      frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [running, index, duration, slides.length, go]);

  // Keyboard
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      const onControl = (e.target as HTMLElement)?.closest('button, a, input, textarea, select');
      if (e.key === 'ArrowRight') go(index + 1);
      else if (e.key === 'ArrowLeft') go(index - 1);
      else if (e.key === ' ' && !onControl) setPaused((p) => !p);
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, index, go]);

  // Preload the next image
  useEffect(() => {
    const next = slides[index + 1];
    if (!open || !next) return;
    const img = new Image();
    img.srcset = photoSrcSet(next.photo);
    img.sizes = '140vh';
    img.src = photoUrl(next.photo, 1920);
  }, [open, index, slides]);

  // ----- Gestures: hold to pause, swipe sideways to move, drag down to close
  const onPointerDown = (e: ReactPointerEvent) => {
    if ((e.target as HTMLElement).closest('[data-story-ui]')) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const timer = window.setTimeout(() => {
      if (gesture.current && !gesture.current.moved) {
        gesture.current.held = true;
        setHeld(true);
      }
    }, HOLD_MS);
    gesture.current = { x: e.clientX, y: e.clientY, id: e.pointerId, moved: false, held: false, timer };
  };
  const onPointerMove = (e: ReactPointerEvent) => {
    const g = gesture.current;
    if (!g || g.id !== e.pointerId) return;
    const dx = e.clientX - g.x;
    const dy = e.clientY - g.y;
    if (!g.moved && Math.hypot(dx, dy) > 10) {
      g.moved = true;
      window.clearTimeout(g.timer);
    }
    if (g.moved && dy > 0 && Math.abs(dy) > Math.abs(dx)) setDragY(dy);
  };
  const endGesture = (e: ReactPointerEvent) => {
    const g = gesture.current;
    gesture.current = null;
    setDragY(0);
    if (!g || g.id !== e.pointerId) return;
    window.clearTimeout(g.timer);
    setHeld(false);
    const dx = e.clientX - g.x;
    const dy = e.clientY - g.y;
    if (g.held || g.moved) suppressUntil.current = performance.now() + 150;
    if (!g.moved) return;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > SWIPE_PX) go(index + (dx < 0 ? 1 : -1));
    else if (dy > 110) close();
  };
  const tap = (direction: 1 | -1) => () => {
    if (performance.now() < suppressUntil.current) return;
    go(index + direction);
  };

  const cta = (action: () => void) => () => {
    close();
    window.setTimeout(action, 0);
  };
  const saved = favorites.has(property.id);
  const illustrative = slide?.photo.credit.isDemoArtwork;
  const barState = (i: number) => (i < index || (i === index && (ended || !autoplay)) ? 1 : i === index ? progress.current : 0);

  return (
    <dialog ref={dialogRef} aria-label={`${property.name} feature stories`} className="m-0 h-dvh max-h-none w-screen max-w-none overflow-hidden bg-[#0e0d0c] p-0 text-white backdrop:bg-black">
      {open && slide && (
        <div className="relative flex h-full items-center justify-center">
          {/* Soft blurred backdrop on larger screens */}
          <div aria-hidden className="absolute inset-0 hidden overflow-hidden sm:block">
            <img src={photoUrl(slide.photo, 640)} alt="" className="size-full scale-125 object-cover opacity-40 blur-3xl" />
          </div>

          {slides.length > 1 && (
            <button
              type="button"
              onClick={() => go(index - 1)}
              disabled={index === 0}
              className="relative z-10 mr-6 hidden size-12 items-center justify-center rounded-full bg-white/10 backdrop-blur hover:bg-white/20 disabled:opacity-30 sm:inline-flex"
              aria-label="Previous story"
            >
              <ChevronLeft aria-hidden className="size-6" />
            </button>
          )}

          <div
            className="relative z-10 h-full w-full overflow-hidden bg-black select-none sm:aspect-[9/16] sm:h-[min(92dvh,56rem)] sm:w-auto sm:rounded-[1.75rem] sm:shadow-[0_30px_80px_-20px_rgb(0_0_0/0.8)]"
            style={{
              transform: dragY ? `translateY(${dragY}px) scale(${Math.max(0.9, 1 - dragY / 2000)})` : undefined,
              transition: dragY ? 'none' : 'transform 0.25s ease',
              WebkitTouchCallout: 'none',
            }}
            onContextMenu={(e) => e.preventDefault()}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endGesture}
            onPointerCancel={endGesture}
          >
            {/* Photo */}
            <div key={slide.id} className="fade-in absolute inset-0 touch-none">
              {failed[slide.id] ? (
                <div className="flex size-full flex-col items-center justify-center gap-2 bg-[#24221f] text-sm text-white/70">
                  <ImageOff aria-hidden className="size-6" /> Photo unavailable offline
                </div>
              ) : (
                <img
                  src={photoUrl(slide.photo, 1920)}
                  srcSet={photoSrcSet(slide.photo)}
                  sizes="140vh"
                  alt={slide.photo.alt}
                  draggable={false}
                  onError={() => setFailed((f) => ({ ...f, [slide.id]: true }))}
                  className="story-zoom size-full object-cover"
                  style={{ objectPosition: slide.focus ?? slide.photo.focus, animationDuration: `${duration}ms`, animationPlayState: running ? 'running' : 'paused' }}
                />
              )}
            </div>
            <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-black/60 to-transparent" />
            <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-black/90 via-black/55 to-transparent" />

            {/* Tap zones: left third goes back, the rest goes forward */}
            <button type="button" onClick={tap(-1)} className="absolute inset-y-0 left-0 w-1/3 touch-none outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-inset" aria-label="Previous story" />
            <button type="button" onClick={tap(1)} className="absolute inset-y-0 right-0 w-2/3 touch-none outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-inset" aria-label="Next story" />

            {/* Header */}
            <div data-story-ui className="absolute inset-x-0 top-0 px-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
              <div className="flex gap-1" aria-hidden>
                {slides.map((s, i) => (
                  <span key={s.id} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/30">
                    <span
                      ref={i === index ? barRef : undefined}
                      className="block h-full origin-left rounded-full bg-white"
                      style={{ transform: `scaleX(${barState(i)})` }}
                    />
                  </span>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-2.5 pl-1">
                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-white/95">
                  <BrandMark className="size-6" />
                </span>
                <div className="min-w-0 flex-1 leading-tight">
                  <p className="truncate text-sm font-semibold">{property.name}</p>
                  <p className="text-xs text-white/70">
                    {index + 1} of {slides.length}
                    {illustrative ? ' · Illustrative image' : ''}
                  </p>
                </div>
                {autoplay && (
                  <button
                    type="button"
                    onClick={() => setPaused((p) => !p)}
                    aria-pressed={paused}
                    className="inline-flex size-10 items-center justify-center rounded-full hover:bg-white/15"
                    aria-label={paused ? 'Play story' : 'Pause story'}
                  >
                    {paused ? <Play aria-hidden className="size-5" /> : <Pause aria-hidden className="size-5" />}
                  </button>
                )}
                <button type="button" ref={closeRef} onClick={close} className="inline-flex size-10 items-center justify-center rounded-full hover:bg-white/15" aria-label="Close stories">
                  <X aria-hidden className="size-6" />
                </button>
              </div>
            </div>

            {/* Caption and actions */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 px-6 pb-[max(1.75rem,env(safe-area-inset-bottom))] [text-shadow:0_1px_16px_rgb(0_0_0/0.35)]">
              <div key={slide.id} className="fade-up">
                <p className="text-[0.7rem] font-semibold tracking-[0.2em] text-sage-soft uppercase">{slide.kicker}</p>
                <h2 className={`font-display mt-2 leading-[1.02] ${slide.kind === 'cover' ? 'text-[2.9rem]' : 'text-[2.2rem]'}`}>{slide.title}</h2>
                {slide.text && <p className="mt-3 text-[0.98rem] leading-relaxed text-white/88">{slide.text}</p>}
                {slide.kind === 'cover' && !autoplay && <p className="mt-4 text-sm text-white/70">Tap the right side or use the arrow keys to continue.</p>}
              </div>

              {slide.kind === 'open-house' && (
                <div data-story-ui className="pointer-events-auto mt-5 flex flex-wrap gap-2 [text-shadow:none]">
                  <button
                    type="button"
                    onClick={() => {
                      const next = upcomingOpenHouses(property.openHouses)[0];
                      if (next) downloadBlob(`${property.id}-open-house.ics`, new Blob([openHouseIcs(property, next, propertyLink(property.id))], { type: 'text/calendar' }));
                    }}
                    className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-ink"
                  >
                    <CalendarPlus aria-hidden className="size-4" /> Add to calendar
                  </button>
                  <button type="button" onClick={cta(() => openInquiry({ type: 'tour', propertyId: property.id }))} className="inline-flex h-11 items-center gap-2 rounded-full border border-white/45 bg-white/10 px-5 text-sm font-semibold backdrop-blur">
                    <CalendarCheck aria-hidden className="size-4" /> Request a private tour
                  </button>
                </div>
              )}

              {slide.kind === 'closing' && (
                <div data-story-ui className="pointer-events-auto mt-5 grid gap-2 [text-shadow:none]">
                  <button type="button" onClick={cta(() => openInquiry({ type: 'tour', propertyId: property.id }))} className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-5 font-semibold text-ink">
                    <CalendarCheck aria-hidden className="size-4" /> Schedule a Tour
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={cta(() => openInquiry({ type: 'question', propertyId: property.id }))} className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/45 bg-white/10 px-4 text-sm font-semibold backdrop-blur">
                      <MessageCircleQuestion aria-hidden className="size-4" /> Ask a question
                    </button>
                    <button
                      type="button"
                      onClick={() => favorites.toggle(property.id)}
                      aria-pressed={saved}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/45 bg-white/10 px-4 text-sm font-semibold backdrop-blur"
                    >
                      <Heart aria-hidden className={`size-4 ${saved ? 'fill-white' : ''}`} /> {saved ? 'Saved' : 'Save home'}
                    </button>
                  </div>
                </div>
              )}
            </div>
            <p className="sr-only" aria-live="polite">
              Story {index + 1} of {slides.length}: {slide.title}
            </p>
          </div>

          {slides.length > 1 && (
            <button
              type="button"
              onClick={() => go(index + 1)}
              className="relative z-10 ml-6 hidden size-12 items-center justify-center rounded-full bg-white/10 backdrop-blur hover:bg-white/20 sm:inline-flex"
              aria-label={index === slides.length - 1 ? 'Close stories' : 'Next story'}
            >
              <ChevronRight aria-hidden className="size-6" />
            </button>
          )}
        </div>
      )}
    </dialog>
  );
}
