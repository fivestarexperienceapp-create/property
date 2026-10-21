import type { Property } from '../../config/types';
import { Reveal } from '../ui/Reveal';
import { ResponsiveImage } from '../ui/ResponsiveImage';
import { SectionHeading } from '../ui/SectionHeading';
import { highlightIcons } from './icons';

export function Highlights({ property, onOpenGallery }: { property: Property; onOpenGallery: (index: number) => void }) {
  const items = property.highlights;
  if (!items.length) return null;
  return (
    <section id="highlights" aria-labelledby="highlights-title" className="bg-linen py-16 md:py-28">
      <div className="container-page">
        <SectionHeading id="highlights-title" eyebrow="Highlights" title="What makes it special" />
        <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-6">
          {items.map((h, i) => {
            const Icon = highlightIcons[h.icon];
            const photoIndex = h.photoId ? property.photos.findIndex((p) => p.id === h.photoId) : -1;
            const photo = photoIndex >= 0 ? property.photos[photoIndex] : null;
            // Asymmetric editorial grid: two wide cards, then three.
            const span = items.length >= 5 ? (i < 2 ? 'lg:col-span-3' : 'lg:col-span-2') : items.length === 4 ? 'lg:col-span-3' : 'lg:col-span-2';
            return (
              <Reveal as="li" key={h.title} delay={(i % 3) * 90} className={`${span} ${items.length % 2 === 1 && i === items.length - 1 ? 'md:col-span-2 lg:col-span-2' : ''}`}>
                <article className="group flex h-full flex-col overflow-hidden rounded-[1.5rem] bg-surface shadow-[var(--shadow-soft)]">
                  {photo ? (
                    <button type="button" onClick={() => onOpenGallery(photoIndex)} className="relative block overflow-hidden" aria-label={`Open photo: ${photo.caption ?? h.title}`}>
                      <ResponsiveImage
                        photo={photo}
                        sizes="(min-width: 1024px) 40vw, (min-width: 768px) 50vw, 100vw"
                        className={`w-full transition duration-[1.2s] group-hover:scale-[1.04] ${i < 2 ? 'aspect-[16/10]' : 'aspect-[4/3]'}`}
                      />
                    </button>
                  ) : (
                    <div aria-hidden className="flex h-40 items-center justify-center bg-sage-soft bg-[radial-gradient(circle_at_30%_20%,rgb(255_255_255/0.6),transparent_60%)] md:h-48">
                      <Icon className="size-12 text-sage-strong/70" strokeWidth={1.2} />
                    </div>
                  )}
                  <div className="flex flex-1 gap-4 p-6 md:p-7">
                    <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-sage-soft text-sage-strong">
                      <Icon aria-hidden className="size-5" />
                    </span>
                    <div>
                      <h3 className="font-display text-[1.6rem] leading-tight">{h.title}</h3>
                      <p className="mt-2 text-[0.97rem] leading-relaxed text-muted">{h.text}</p>
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
