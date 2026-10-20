import { useEffect, useRef, useState } from 'react';

export interface NavSection {
  id: string;
  label: string;
}

export function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  const heading = el.querySelector<HTMLElement>('h2');
  if (heading) {
    heading.setAttribute('tabindex', '-1');
    heading.focus({ preventScroll: true });
  }
}

/** Sticky in-page navigation with scroll-spy. */
export function SectionNav({ sections }: { sections: NavSection[] }) {
  const [active, setActive] = useState<string | null>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const line = window.innerHeight * 0.35;
      let current: string | null = null;
      for (const s of sections) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= line) current = s.id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [sections]);

  useEffect(() => {
    const list = listRef.current;
    const item = active ? list?.querySelector<HTMLElement>(`[data-id="${active}"]`) : null;
    if (list && item) {
      const left = item.offsetLeft - list.clientWidth / 2 + item.clientWidth / 2;
      list.scrollTo({ left, behavior: 'smooth' });
    }
  }, [active]);

  return (
    <nav aria-label="Sections" className="sticky top-16 z-30 border-b border-line bg-canvas/92 backdrop-blur-lg" data-print-hide>
      <ul ref={listRef} className="no-scrollbar container-page flex gap-1 overflow-x-auto py-2">
        {sections.map((s) => (
          <li key={s.id} data-id={s.id} className="shrink-0">
            <button
              type="button"
              onClick={() => scrollToSection(s.id)}
              aria-current={active === s.id ? 'location' : undefined}
              className={`h-9 rounded-full px-4 text-sm font-medium transition ${active === s.id ? 'bg-ink text-white' : 'text-muted hover:bg-ink/5 hover:text-ink'}`}
            >
              {s.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
