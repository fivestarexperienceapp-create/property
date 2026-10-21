import { ArrowRight } from 'lucide-react';
import { branding, properties, site } from '../../config';
import { href } from '../../lib/router';
import { Reveal } from '../ui/Reveal';
import { SectionHeading } from '../ui/SectionHeading';
import { ListingCard } from './ListingCard';

export function MoreHomes({ excludeId }: { excludeId: string }) {
  const others = properties.filter((p) => p.id !== excludeId).slice(0, 3);
  if (!others.length) return null;
  return (
    <section aria-labelledby="more-title" className="py-16 md:py-24" data-print-hide>
      <div className="container-page">
        <SectionHeading
          id="more-title"
          eyebrow={`More from ${branding.brokerageName}`}
          title="You might also like"
          action={
            <a href={href.homes()} className="inline-flex items-center gap-2 font-semibold text-sage-strong underline-offset-4 hover:underline">
              Browse all homes <ArrowRight aria-hidden className="size-4" />
            </a>
          }
        />
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {others.map((p, i) => (
            <Reveal as="li" key={p.id} delay={i * 80}>
              <ListingCard property={p} featured={p.id === site.featuredPropertyId} />
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
