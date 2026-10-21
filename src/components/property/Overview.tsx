import type { Property } from '../../config/types';
import { Reveal } from '../ui/Reveal';
import { ResponsiveImage } from '../ui/ResponsiveImage';

export function Overview({ property, onOpenGallery }: { property: Property; onOpenGallery: (index: number) => void }) {
  const featureIndex = property.photos.length > 1 ? 1 : 0;
  const feature = property.photos[featureIndex];
  return (
    <section id="overview" aria-labelledby="overview-title" className="py-16 md:py-28">
      <div className="container-page grid items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
        <Reveal>
          <p className="eyebrow mb-4">Overview</p>
          <h2 id="overview-title" className="font-display text-[2.3rem] leading-[1.05] md:text-[3.4rem]">
            {property.headline}
          </h2>
          <div className="mt-6 space-y-5 text-[1.05rem] leading-[1.75] text-muted">
            {property.description.map((p, i) => (
              <p key={i} className={i === 0 ? 'text-ink/85' : undefined}>
                {p}
              </p>
            ))}
          </div>
        </Reveal>
        <Reveal delay={120}>
          <figure>
            <button type="button" onClick={() => onOpenGallery(featureIndex)} className="group block w-full overflow-hidden rounded-[1.75rem]" aria-label={`Open photo: ${feature.caption ?? feature.alt}`}>
              <ResponsiveImage photo={feature} sizes="(min-width: 1024px) 50vw, 100vw" className="aspect-[4/5] w-full transition duration-[1.2s] group-hover:scale-[1.03] sm:aspect-[4/3] lg:aspect-[4/5]" />
            </button>
            {feature.caption && <figcaption className="mt-3 text-sm text-muted">{feature.caption}</figcaption>}
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
