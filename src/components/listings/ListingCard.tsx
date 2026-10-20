import { Check, Heart, Plus } from 'lucide-react';
import type { Property } from '../../config/types';
import { formatBaths, formatNumber, formatPrice } from '../../lib/format';
import { href } from '../../lib/router';
import { COMPARE_LIMIT, useCompare, useFavorites } from '../../state/collections';
import { toast } from '../../state/toast';
import { ResponsiveImage } from '../ui/ResponsiveImage';

export function ListingCard({ property, showCompare = true, featured = false }: { property: Property; showCompare?: boolean; featured?: boolean }) {
  const favorites = useFavorites();
  const compare = useCompare();
  const saved = favorites.has(property.id);
  const comparing = compare.has(property.id);
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[1.5rem] bg-surface shadow-[var(--shadow-soft)] transition duration-300 hover:shadow-[var(--shadow-lift)]">
      <div className="relative overflow-hidden">
        <ResponsiveImage photo={property.photos[0]} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="aspect-[4/3] w-full transition duration-[1.2s] group-hover:scale-[1.04]" />
        <div className="pointer-events-none absolute top-3 left-3 flex gap-2">
          <span className="rounded-full bg-white/95 px-3 py-1 text-[0.7rem] font-semibold tracking-wider text-ink uppercase">{property.status}</span>
          {featured && <span className="rounded-full bg-sage-strong px-3 py-1 text-[0.7rem] font-semibold tracking-wider text-white uppercase">Featured</span>}
        </div>
        <button
          type="button"
          onClick={() => toast(favorites.toggle(property.id) ? `Saved ${property.name}` : `Removed ${property.name}`, 'success')}
          aria-pressed={saved}
          aria-label={saved ? `Remove ${property.name} from saved homes` : `Save ${property.name}`}
          className="absolute top-3 right-3 z-10 inline-flex size-10 items-center justify-center rounded-full bg-white/95 text-ink shadow-[var(--shadow-soft)] transition hover:scale-105"
        >
          <Heart aria-hidden className={`size-[1.15rem] ${saved ? 'fill-sage-strong text-sage-strong' : ''}`} />
        </button>
      </div>
      <div className="flex flex-1 flex-col p-5 md:p-6">
        <p className="font-display text-[1.9rem] leading-none">{formatPrice(property.price)}</p>
        <h3 className="mt-2 text-lg font-semibold">
          <a href={href.property(property.id)} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
            {property.name}
          </a>
        </h3>
        <p className="text-sm text-muted">
          {property.community} · {property.location.area}
        </p>
        <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1 border-t border-line pt-4 text-sm" aria-label="Key details">
          <li>
            <strong className="font-semibold">{property.beds}</strong> <span className="text-muted">beds</span>
          </li>
          <li>
            <strong className="font-semibold">{formatBaths(property)}</strong> <span className="text-muted">baths</span>
          </li>
          <li>
            <strong className="font-semibold">{formatNumber(property.interiorSqft)}</strong> <span className="text-muted">sq ft</span>
          </li>
        </ul>
        {showCompare && (
          <button
            type="button"
            aria-pressed={comparing}
            onClick={() => {
              const r = compare.toggle(property.id);
              if (r === 'full') toast(`You can compare up to ${COMPARE_LIMIT} homes. Remove one first.`);
            }}
            className={`relative z-10 mt-4 inline-flex h-10 items-center justify-center gap-2 self-start rounded-full border px-4 text-sm font-semibold transition ${comparing ? 'border-sage-strong bg-sage-soft text-sage-strong' : 'border-line text-muted hover:border-ink/40 hover:text-ink'}`}
          >
            {comparing ? <Check aria-hidden className="size-4" /> : <Plus aria-hidden className="size-4" />}
            {comparing ? 'Comparing' : 'Compare'}
          </button>
        )}
      </div>
    </article>
  );
}
