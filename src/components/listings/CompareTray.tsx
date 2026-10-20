import { ArrowRight, X } from 'lucide-react';
import { properties } from '../../config';
import { photoUrl } from '../../lib/media';
import { href } from '../../lib/router';
import { COMPARE_LIMIT, useCompare } from '../../state/collections';
import { SafeImg } from '../ui/SafeImg';

export function CompareTray() {
  const compare = useCompare();
  const selected = compare.ids.map((id) => properties.find((p) => p.id === id)!).filter(Boolean);
  if (!selected.length) return null;
  return (
    <div className="safe-bottom fade-up fixed inset-x-0 bottom-0 z-40 border-t border-line bg-canvas/95 pt-3 backdrop-blur-lg" data-print-hide>
      <div className="container-page flex items-center gap-3">
        <ul className="flex -space-x-3" aria-label="Homes selected to compare">
          {selected.map((p) => (
            <li key={p.id} className="relative">
              <SafeImg src={photoUrl(p.photos[0], 640)} alt={p.name} className="size-11 rounded-full border-2 border-canvas object-cover" />
            </li>
          ))}
        </ul>
        <p className="min-w-0 flex-1 text-sm">
          <span className="font-semibold">{selected.length}</span> of {COMPARE_LIMIT} selected
        </p>
        <button type="button" onClick={compare.clear} className="inline-flex size-10 items-center justify-center rounded-full text-muted hover:bg-ink/5" aria-label="Clear compare list">
          <X aria-hidden className="size-4" />
        </button>
        <a href={href.compare()} className="inline-flex h-11 items-center gap-2 rounded-full bg-sage-strong px-5 text-sm font-semibold text-white shadow-[var(--shadow-soft)] hover:brightness-110">
          Compare <ArrowRight aria-hidden className="size-4" />
        </a>
      </div>
    </div>
  );
}
