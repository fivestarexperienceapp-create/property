import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import type { Slide } from '../../lib/stories';
import { Reveal } from '../ui/Reveal';
import { ResponsiveImage } from '../ui/ResponsiveImage';

/** Strip of story tiles; each opens the full-screen story at that slide. */
export function StoriesSection({ slides, onPlay }: { slides: Slide[]; onPlay: (index: number) => void }) {
  const listRef = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const update = () => setEdges({ start: list.scrollLeft < 8, end: list.scrollLeft + list.clientWidth >= list.scrollWidth - 8 });
    update();
    list.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      list.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [slides.length]);

  const scroll = (direction: 1 | -1) => {
    const list = listRef.current;
    if (!list) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    list.scrollBy({ left: direction * list.clientWidth * 0.8, behavior: reduce ? 'auto' : 'smooth' });
  };

  if (!slides.length) return null;
  const fade = `linear-gradient(to right, ${edges.start ? '#000' : 'transparent'} 0, #000 48px, #000 calc(100% - 48px), ${edges.end ? '#000' : 'transparent'} 100%)`;
  return (
    <section id="stories" aria-labelledby="stories-title" className="overflow-hidden bg-ink py-16 text-white md:py-24">
      <div className="container-page">
        <div className="mb-8 flex flex-col gap-5 md:mb-10 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="mb-3 text-[0.72rem] font-semibold tracking-[0.16em] text-sage uppercase">Feature stories</p>
            <h2 id="stories-title" className="font-display text-[2.1rem] leading-[1.08] md:text-5xl">
              Take the quick tour
            </h2>
            <p className="mt-4 text-[1.02rem] leading-relaxed text-white/70">Tap through the home one space at a time, just like stories on your phone.</p>
          </div>
          <div className="flex shrink-0 items-center gap-2 self-start md:self-auto">
            <button
              type="button"
              onClick={() => onPlay(0)}
              className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 font-semibold text-ink transition hover:bg-canvas motion-safe:active:scale-[0.98]"
            >
              <Play aria-hidden className="size-4 fill-ink" /> Play the story
            </button>
            {!(edges.start && edges.end) && (
              <div className="hidden gap-2 md:flex">
                <button
                  type="button"
                  onClick={() => scroll(-1)}
                  disabled={edges.start}
                  className="inline-flex size-12 items-center justify-center rounded-full border border-white/25 transition hover:bg-white/10 disabled:opacity-30"
                  aria-label="Scroll stories back"
                >
                  <ChevronLeft aria-hidden className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={() => scroll(1)}
                  disabled={edges.end}
                  className="inline-flex size-12 items-center justify-center rounded-full border border-white/25 transition hover:bg-white/10 disabled:opacity-30"
                  aria-label="Scroll stories forward"
                >
                  <ChevronRight aria-hidden className="size-5" />
                </button>
              </div>
            )}
          </div>
        </div>
        <Reveal>
          <ul
            ref={listRef}
            className="no-scrollbar -mx-5 flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5 pb-2 md:mx-0 md:scroll-px-0 md:gap-4 md:px-0"
            style={{ maskImage: fade, WebkitMaskImage: fade }}
            aria-label="Story slides"
          >
            {slides.map((slide, i) => (
              <li key={slide.id} className="w-[9.5rem] shrink-0 snap-start sm:w-44 lg:w-48">
                <button
                  type="button"
                  onClick={() => onPlay(i)}
                  className="group relative block aspect-[9/16] w-full overflow-hidden rounded-[1.25rem] bg-white/5 ring-1 ring-white/10 transition hover:ring-white/40"
                  aria-label={`Play story ${i + 1} of ${slides.length}: ${slide.title}`}
                >
                  <ResponsiveImage
                    photo={slide.photo}
                    decorative
                    sizes="(min-width: 640px) 540px, 420px"
                    className="size-full transition duration-[1.2s] group-hover:scale-[1.05]"
                    style={slide.focus ? { objectPosition: slide.focus } : undefined}
                  />
                  <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/25" />
                  <span aria-hidden className="absolute top-3 left-3 inline-flex size-7 items-center justify-center rounded-full bg-black/35 text-xs font-semibold backdrop-blur">
                    {i + 1}
                  </span>
                  {i === 0 && (
                    <span aria-hidden className="absolute top-3 right-3 inline-flex size-8 items-center justify-center rounded-full bg-white text-ink">
                      <Play className="size-3.5 fill-ink" />
                    </span>
                  )}
                  <span aria-hidden className="absolute inset-x-3 bottom-3 text-left">
                    <span className="block text-[0.62rem] font-semibold tracking-[0.16em] text-sage-soft uppercase">{slide.kicker}</span>
                    <span className="font-display mt-1 block text-[1.15rem] leading-tight">{slide.title}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
