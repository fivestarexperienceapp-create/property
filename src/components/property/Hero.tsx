import { ArrowDown, CalendarDays, Heart, Images, Share2 } from 'lucide-react';
import type { Property } from '../../config/types';
import { formatBaths, formatNumber, formatOpenHouse, formatPrice, upcomingOpenHouses } from '../../lib/format';
import { useFavorites } from '../../state/collections';
import { toast } from '../../state/toast';
import { ResponsiveImage } from '../ui/ResponsiveImage';
import { IconButton } from '../ui/Button';

export function Hero({
  property,
  onOpenGallery,
  onExplore,
  onShare,
  onPlayStory,
}: {
  property: Property;
  onOpenGallery: (index: number) => void;
  onExplore: () => void;
  onShare: () => void;
  /** Opens the feature stories; the button is hidden when stories are off. */
  onPlayStory?: () => void;
}) {
  const favorites = useFavorites();
  const saved = favorites.has(property.id);
  const openHouse = upcomingOpenHouses(property.openHouses)[0];
  const oh = openHouse ? formatOpenHouse(openHouse) : null;
  const stats = [
    { value: String(property.beds), label: property.beds === 1 ? 'Bed' : 'Beds' },
    { value: formatBaths(property), label: 'Baths' },
    { value: formatNumber(property.interiorSqft), label: 'Sq Ft' },
    { value: formatNumber(property.lotAcres), label: 'Acres', wide: true },
  ];

  return (
    <section aria-labelledby="property-title" className="relative isolate flex min-h-[calc(100svh-6rem)] items-end overflow-hidden bg-ink text-white md:min-h-[min(calc(100svh-6rem),58rem)]">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <ResponsiveImage photo={property.photos[0]} priority sizes="100vw" className="hero-settle size-full" />
      </div>
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgb(18_17_15/0.9)_0%,rgb(18_17_15/0.72)_38%,rgb(18_17_15/0.3)_62%,rgb(18_17_15/0.2)_100%)] md:bg-[linear-gradient(to_top,rgb(18_17_15/0.86)_0%,rgb(18_17_15/0.55)_32%,rgb(18_17_15/0.08)_62%,rgb(18_17_15/0.22)_100%)]"
      />

      {onPlayStory && (
        <button
          type="button"
          onClick={onPlayStory}
          data-print-hide
          className="absolute top-4 left-4 inline-flex items-center gap-2.5 rounded-full border border-white/30 bg-black/25 py-1 pr-4 pl-1 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-black/40 md:top-6 md:left-8"
        >
          <span aria-hidden className="rounded-full bg-[conic-gradient(var(--color-sage-soft),var(--color-sage),#c9a15b,var(--color-sage-soft))] p-[2px]">
            <span className="block size-9 overflow-hidden rounded-full border-2 border-black/40">
              <ResponsiveImage photo={property.photos[1] ?? property.photos[0]} decorative sizes="80px" className="size-full" />
            </span>
          </span>
          Watch story
        </button>
      )}
      <div className="absolute top-4 right-4 flex gap-2 md:top-6 md:right-8" data-print-hide>
        <IconButton
          tone="glass"
          label={saved ? `Remove ${property.name} from saved homes` : `Save ${property.name}`}
          aria-pressed={saved}
          onClick={() => toast(favorites.toggle(property.id) ? 'Saved to this device' : 'Removed from saved homes', 'success')}
        >
          <Heart aria-hidden className={`size-5 ${saved ? 'fill-white' : ''}`} />
        </IconButton>
        <IconButton tone="glass" label="Share this home" onClick={onShare}>
          <Share2 aria-hidden className="size-5" />
        </IconButton>
      </div>

      <div className="container-page pt-32 pb-24 md:pb-14 lg:pb-14 [text-shadow:0_1px_18px_rgb(0_0_0/0.25)]">
        <div className="flex items-end justify-between gap-10">
          <div className="fade-up max-w-3xl">
            <div className="mb-4 flex flex-wrap items-center gap-2 text-[0.72rem] font-semibold tracking-[0.16em] uppercase">
              <span className="rounded-full bg-white px-3 py-1 text-ink">{property.status}</span>
              <span className="text-white/85">{property.community}</span>
            </div>
            <h1 id="property-title" tabIndex={-1} className="font-display text-[3.2rem] leading-[0.95] tracking-tight outline-none md:text-7xl lg:text-[5.75rem]">
              {property.name}
            </h1>
            <p className="font-display mt-3 text-[2.1rem] leading-none md:mt-4 md:text-5xl">{formatPrice(property.price)}</p>
            <ul className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.95rem] text-white/90 md:text-lg" aria-label="Key details">
              {stats.map((s) => (
                <li key={s.label} className={`items-baseline gap-1.5 ${s.wide ? 'hidden sm:flex' : 'flex'}`}>
                  <span className="font-semibold text-white">{s.value}</span>
                  <span>{s.label}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-3 sm:mt-7" data-print-hide>
              <button
                type="button"
                onClick={onExplore}
                className="inline-flex h-13 items-center gap-2 rounded-full bg-white px-6 text-base font-semibold text-ink shadow-[var(--shadow-lift)] transition [text-shadow:none] hover:bg-canvas motion-safe:active:scale-[0.98] sm:px-7"
              >
                Explore the Home
                <ArrowDown aria-hidden className="size-4 motion-safe:animate-bounce" />
              </button>
              <button
                type="button"
                onClick={() => onOpenGallery(0)}
                className="inline-flex h-13 items-center gap-2 rounded-full border border-white/45 bg-white/10 px-5 text-base font-semibold text-white backdrop-blur-md transition hover:bg-white/20 sm:px-6"
                aria-label={`View all ${property.photos.length} photos`}
              >
                <Images aria-hidden className="size-4" />
                {property.photos.length}
                <span className="hidden sm:inline">photos</span>
              </button>
            </div>
            {oh && (
              <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-black/35 px-3.5 py-1.5 text-sm text-white/95 backdrop-blur-sm">
                <CalendarDays aria-hidden className="size-4 text-sage-soft" />
                <span className="sm:hidden">Open house · {oh.short}</span>
                <span className="hidden sm:inline">
                  Open house · {oh.day}, {oh.date} · {oh.time}
                </span>
              </p>
            )}
          </div>
          {property.photos.length > 2 && (
            <div className="hidden shrink-0 gap-3 xl:flex" data-print-hide>
              {property.photos.slice(1, 3).map((photo, i) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => onOpenGallery(i + 1)}
                  className="group relative h-36 w-52 overflow-hidden rounded-2xl ring-1 ring-white/30"
                  aria-label={`Open photo: ${photo.caption ?? photo.alt}`}
                >
                  <ResponsiveImage photo={photo} sizes="208px" decorative className="size-full transition duration-700 group-hover:scale-105" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
