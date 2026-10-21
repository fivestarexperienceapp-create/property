import { Heart, Smartphone, Trash2 } from 'lucide-react';
import { properties } from '../config';
import { formatBaths, formatNumber, formatPrice } from '../lib/format';
import { href } from '../lib/router';
import { storageAvailable } from '../lib/storage';
import { useFavorites, useNotes } from '../state/collections';
import { toast } from '../state/toast';
import { PrivateNotes } from '../components/property/PrivateNotes';
import { LinkButton } from '../components/ui/Button';
import { ResponsiveImage } from '../components/ui/ResponsiveImage';

export function SavedPage() {
  const favorites = useFavorites();
  const { notes } = useNotes();
  const list = properties.filter((p) => favorites.ids.includes(p.id) || notes[p.id]);

  return (
    <div className="container-page pt-12 pb-24 md:pt-20">
      <p className="eyebrow mb-3">Your shortlist</p>
      <h1 tabIndex={-1} className="font-display text-5xl leading-none outline-none md:text-7xl">
        Saved homes &amp; notes
      </h1>
      <p className="mt-5 flex max-w-2xl items-start gap-2.5 rounded-2xl bg-sage-soft/60 p-4 text-sm leading-relaxed">
        <Smartphone aria-hidden className="mt-0.5 size-4 shrink-0 text-sage-strong" />
        <span>
          Saved homes and private notes are stored only in this browser on this device. They don’t sync to your other devices or browsers, and clearing your browser data removes them.
          {!storageAvailable && ' This browser is currently blocking storage, so items will be cleared when you leave.'}
        </span>
      </p>

      {list.length === 0 ? (
        <div className="mt-10 flex flex-col items-center rounded-[1.5rem] border border-dashed border-line px-6 py-16 text-center">
          <Heart aria-hidden className="size-8 text-sage" />
          <h2 className="font-display mt-4 text-3xl">No saved homes yet</h2>
          <p className="mt-2 max-w-md text-muted">Tap the heart on any home to keep it here, along with your private notes.</p>
          <LinkButton className="mt-6" href={href.homes()}>
            Browse homes
          </LinkButton>
        </div>
      ) : (
        <ul className="mt-10 grid gap-5">
          {list.map((p) => {
            const saved = favorites.has(p.id);
            return (
              <li key={p.id} className="grid overflow-hidden rounded-[1.5rem] bg-surface shadow-[var(--shadow-soft)] md:grid-cols-[18rem_1fr]">
                <a href={href.property(p.id)} className="block">
                  <ResponsiveImage photo={p.photos[0]} sizes="(min-width: 768px) 288px, 100vw" decorative className="aspect-[16/10] size-full md:aspect-auto" />
                </a>
                <div className="grid gap-6 p-5 md:p-7 lg:grid-cols-[1fr_1.3fr]">
                  <div>
                    <p className="font-display text-3xl leading-none">{formatPrice(p.price)}</p>
                    <a href={href.property(p.id)} className="mt-2 block text-lg font-semibold hover:text-sage-strong">
                      {p.name}
                    </a>
                    <p className="text-sm text-muted">
                      {p.beds} beds · {formatBaths(p)} baths · {formatNumber(p.interiorSqft)} sq ft
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold">
                      <a href={href.property(p.id)} className="text-sage-strong underline-offset-4 hover:underline">
                        View home
                      </a>
                      {saved ? (
                        <button
                          type="button"
                          onClick={() => {
                            favorites.toggle(p.id);
                            toast(notes[p.id] ? 'Removed from saved. Your note is kept.' : 'Removed from saved homes');
                          }}
                          className="inline-flex items-center gap-1.5 text-muted hover:text-ink"
                        >
                          <Trash2 aria-hidden className="size-4" /> Remove
                        </button>
                      ) : (
                        <button type="button" onClick={() => favorites.toggle(p.id)} className="inline-flex items-center gap-1.5 text-muted hover:text-ink">
                          <Heart aria-hidden className="size-4" /> Save
                        </button>
                      )}
                    </div>
                  </div>
                  <PrivateNotes propertyId={p.id} propertyName={p.name} compact />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
