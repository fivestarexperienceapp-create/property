import { Images } from 'lucide-react';
import type { Property } from '../../config/types';
import { href } from '../../lib/router';
import { Button } from '../ui/Button';
import { Reveal } from '../ui/Reveal';
import { ResponsiveImage } from '../ui/ResponsiveImage';
import { SectionHeading } from '../ui/SectionHeading';

export function GallerySection({ property, onOpenGallery }: { property: Property; onOpenGallery: (index: number) => void }) {
  const photos = property.photos;
  const illustrative = photos.some((p) => p.credit.isDemoArtwork);
  const mosaic = photos.slice(0, 5);
  return (
    <section id="photos" aria-labelledby="photos-title" className="py-16 md:py-28">
      <div className="container-page">
        <SectionHeading
          id="photos-title"
          eyebrow="Gallery"
          title="Take a look around"
          action={
            <Button variant="secondary" icon={<Images aria-hidden className="size-4" />} onClick={() => onOpenGallery(0)}>
              View all {photos.length} photos
            </Button>
          }
        />
        {/* Phones: swipeable strip. Larger screens: mosaic. */}
        <ul className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 md:hidden" aria-label="Photos">
          {photos.map((photo, i) => (
            <li key={photo.id} className="w-[82%] shrink-0 snap-center">
              <button type="button" onClick={() => onOpenGallery(i)} className="block w-full overflow-hidden rounded-2xl" aria-label={`Open photo ${i + 1} of ${photos.length}: ${photo.caption ?? photo.alt}`}>
                <ResponsiveImage photo={photo} sizes="82vw" className="aspect-[4/3] w-full" />
              </button>
              {photo.caption && <p className="mt-2 text-sm text-muted">{photo.caption}</p>}
            </li>
          ))}
        </ul>
        <Reveal className="hidden gap-3 md:grid md:grid-cols-4 md:grid-rows-2 lg:gap-4" as="div">
          {mosaic.map((photo, i) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => onOpenGallery(i)}
              className={`group relative overflow-hidden rounded-2xl ${i === 0 ? 'col-span-2 row-span-2 aspect-square lg:aspect-auto' : 'aspect-[4/3]'}`}
              aria-label={`Open photo ${i + 1} of ${photos.length}: ${photo.caption ?? photo.alt}`}
            >
              <ResponsiveImage photo={photo} sizes={i === 0 ? '50vw' : '25vw'} className="size-full transition duration-[1.2s] group-hover:scale-[1.04]" />
              <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-4 pt-10 pb-3 text-left text-sm font-medium text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
                {photo.caption}
              </span>
              {i === mosaic.length - 1 && photos.length > mosaic.length && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-lg font-semibold text-white">+{photos.length - mosaic.length} more</span>
              )}
            </button>
          ))}
        </Reveal>
        {illustrative && (
          <p className="mt-5 text-sm text-muted">
            Sample images are illustrative and may depict different homes.{' '}
            <a href={href.about()} className="font-semibold text-sage-strong underline-offset-4 hover:underline">
              Image credits
            </a>
          </p>
        )}
      </div>
    </section>
  );
}
