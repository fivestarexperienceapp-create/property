import { Component, lazy, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Hand, MapPinOff, Navigation, X } from 'lucide-react';
import { integrations, neighborhoods } from '../../config';
import type { PlaceCategory, Property } from '../../config/types';
import { useOnline } from '../../lib/pwa';
import { SampleTag } from '../ui/Badge';
import { SectionHeading } from '../ui/SectionHeading';
import { CATEGORIES, CATEGORY_ORDER, directionsUrl } from './categories';
import type { MapStatus } from './LeafletMap';
import { SchematicMap } from './SchematicMap';

const LeafletMap = lazy(() => import('./LeafletMap'));

class MapErrorBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export function NeighborhoodExplorer({ property }: { property: Property }) {
  const neighborhood = neighborhoods.find((n) => n.id === property.neighborhoodId);
  const [visible, setVisible] = useState<Set<PlaceCategory>>(() => new Set(CATEGORY_ORDER));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [status, setStatus] = useState<MapStatus>('loading');
  const [inView, setInView] = useState(false);
  const [interactive, setInteractive] = useState(false);
  const online = useOnline();
  const mapBoxRef = useRef<HTMLDivElement>(null);
  const coarse = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

  useEffect(() => {
    const el = mapBoxRef.current;
    if (!el || !('IntersectionObserver' in window)) {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(([entry]) => entry.isIntersecting && (setInView(true), io.disconnect()), { rootMargin: '400px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const counts = useMemo(() => {
    const out = {} as Record<PlaceCategory, number>;
    for (const c of CATEGORY_ORDER) out[c] = neighborhood?.places.filter((p) => p.category === c).length ?? 0;
    return out;
  }, [neighborhood]);

  if (!neighborhood) return null;
  const categories = CATEGORY_ORDER.filter((c) => counts[c] > 0);
  const allOn = categories.every((c) => visible.has(c));
  const places = neighborhood.places.filter((p) => visible.has(p.category));
  const showSchematic = !integrations.map.enabled || !online || status === 'failed';

  const toggle = (c: PlaceCategory) =>
    setVisible((prev) => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      return next;
    });

  const chip = (active: boolean) =>
    `inline-flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition ${active ? 'border-ink bg-ink text-white' : 'border-line bg-surface text-muted hover:border-ink/40 hover:text-ink'}`;

  return (
    <section id="neighborhood" aria-labelledby="neighborhood-title" className="bg-linen py-16 md:py-28">
      <div className="container-page">
        <SectionHeading
          id="neighborhood-title"
          eyebrow="Neighborhood"
          title={neighborhood.title}
          intro={
            <>
              <p>{neighborhood.intro}</p>
              {neighborhood.isSample && (
                <p className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-ink">
                  <SampleTag /> Illustrative markers only. Directions are disabled for sample places.
                </p>
              )}
            </>
          }
        />

        <div role="group" aria-label="Filter places by category" className="no-scrollbar -mx-5 mb-5 flex gap-2 overflow-x-auto px-5 pb-1 md:mx-0 md:flex-wrap md:px-0">
          <button type="button" aria-pressed={allOn} className={chip(allOn)} onClick={() => setVisible(new Set(allOn ? [] : categories))}>
            All
          </button>
          {categories.map((c) => {
            const meta = CATEGORIES[c];
            const Icon = meta.icon;
            const on = visible.has(c);
            return (
              <button key={c} type="button" aria-pressed={on} className={chip(on)} onClick={() => toggle(c)}>
                <Icon aria-hidden className="size-4" style={{ color: on ? '#fff' : meta.color }} />
                {meta.label}
                <span className={`text-xs ${on ? 'text-white/70' : 'text-muted'}`}>{counts[c]}</span>
              </button>
            );
          })}
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
          <div ref={mapBoxRef} className="relative isolate h-[22rem] overflow-hidden rounded-[1.5rem] bg-surface shadow-[var(--shadow-soft)] md:h-[30rem] lg:h-[34rem]">
            {showSchematic ? (
              <>
                <SchematicMap neighborhood={neighborhood} visible={visible} selectedId={selectedId} onSelect={setSelectedId} />
                <p className="absolute inset-x-3 bottom-3 flex items-center gap-2 rounded-xl bg-surface/95 px-3 py-2 text-xs text-muted shadow-[var(--shadow-soft)]">
                  <MapPinOff aria-hidden className="size-4 shrink-0 text-sage-strong" />
                  {integrations.map.enabled ? 'Map imagery isn’t available right now, so this is a simplified layout. The list shows the same places.' : 'Simplified layout of nearby places.'}
                </p>
              </>
            ) : (
              inView && (
                <MapErrorBoundary onError={() => setStatus('failed')}>
                  <Suspense fallback={<div className="size-full animate-pulse bg-linen" />}>
                    <LeafletMap neighborhood={neighborhood} visible={visible} selectedId={selectedId} onSelect={setSelectedId} onStatus={setStatus} interactive={interactive} />
                  </Suspense>
                </MapErrorBoundary>
              )
            )}
            {!showSchematic && coarse && (
              interactive ? (
                <button type="button" onClick={() => setInteractive(false)} className="absolute top-3 right-3 z-[500] inline-flex h-10 items-center gap-1.5 rounded-full bg-ink px-4 text-sm font-semibold text-white shadow-[var(--shadow-lift)]">
                  <X aria-hidden className="size-4" /> Done
                </button>
              ) : (
                <button type="button" onClick={() => setInteractive(true)} className="absolute right-3 bottom-8 z-[500] inline-flex h-10 items-center gap-1.5 rounded-full bg-surface/95 px-4 text-sm font-semibold text-ink shadow-[var(--shadow-lift)]">
                  <Hand aria-hidden className="size-4 text-sage-strong" /> Tap to explore map
                </button>
              )
            )}
            {neighborhood.isSample && (
              <span className="pointer-events-none absolute top-3 left-14 z-[500] rounded-full bg-surface/95 px-3 py-1.5 text-[0.7rem] font-semibold tracking-wider text-sage-strong uppercase shadow-[var(--shadow-soft)]">
                {neighborhood.title}
              </span>
            )}
          </div>

          <div className="flex max-h-[34rem] flex-col overflow-hidden rounded-[1.5rem] bg-surface shadow-[var(--shadow-soft)]">
            <p className="border-b border-line px-5 py-3.5 text-sm font-semibold" aria-live="polite">
              {places.length} {places.length === 1 ? 'place' : 'places'} nearby
            </p>
            {places.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
                <p className="text-muted">No categories selected.</p>
                <button type="button" className="font-semibold text-sage-strong underline-offset-4 hover:underline" onClick={() => setVisible(new Set(categories))}>
                  Show all places
                </button>
              </div>
            ) : (
              <ul className="divide-y divide-line overflow-y-auto overscroll-contain">
                {places.map((p) => {
                  const meta = CATEGORIES[p.category];
                  const Icon = meta.icon;
                  const selected = p.id === selectedId;
                  return (
                    <li key={p.id} className={selected ? 'bg-sage-soft/60' : undefined}>
                      <div className="flex gap-3 px-5 py-4">
                        <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-full text-white" style={{ background: meta.color }}>
                          <Icon aria-hidden className="size-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <button type="button" onClick={() => setSelectedId(p.id)} aria-pressed={selected} className="text-left font-semibold hover:text-sage-strong">
                            {p.name}
                          </button>
                          <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted">
                            {meta.singular}
                            {p.sample && <SampleTag />}
                          </p>
                          {p.description && <p className="mt-1.5 text-sm text-muted">{p.description}</p>}
                          {p.sample ? (
                            <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted" aria-disabled="true">
                              <Navigation aria-hidden className="size-3.5 opacity-50" /> Directions unavailable for sample places
                            </p>
                          ) : (
                            <a href={directionsUrl(p.lat, p.lng)} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-sage-strong hover:underline">
                              <Navigation aria-hidden className="size-3.5" /> Directions
                            </a>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
