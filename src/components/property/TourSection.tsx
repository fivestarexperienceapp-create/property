import type { Property } from '../../config/types';
import { assetUrl } from '../../lib/media';
import { SectionHeading } from '../ui/SectionHeading';

/** Video or virtual tour. Renders nothing unless a tour is configured for the listing. */
export function TourSection({ property }: { property: Property }) {
  const tour = property.tour;
  if (!tour) return null;
  return (
    <section id="tour" aria-labelledby="tour-title" className="py-16 md:py-24">
      <div className="container-page">
        <SectionHeading id="tour-title" eyebrow={tour.kind === 'matterport' ? 'Virtual tour' : 'Video tour'} title={tour.title} />
        <div className="overflow-hidden rounded-[1.75rem] bg-ink shadow-[var(--shadow-lift)]">
          {tour.kind === 'video' ? (
            <video controls preload="metadata" className="aspect-video w-full" src={assetUrl(tour.url)}>
              Your browser can’t play this video.
            </video>
          ) : (
            <iframe
              src={tour.url}
              title={tour.title}
              className="aspect-video w-full"
              loading="lazy"
              allow="fullscreen; xr-spatial-tracking; accelerometer; gyroscope; picture-in-picture"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          )}
        </div>
      </div>
    </section>
  );
}
