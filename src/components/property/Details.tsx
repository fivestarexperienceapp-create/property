import type { Property } from '../../config/types';
import { Reveal } from '../ui/Reveal';
import { SectionHeading } from '../ui/SectionHeading';

export function Details({ property }: { property: Property }) {
  return (
    <section id="details" aria-labelledby="details-title" className="bg-linen py-16 md:py-28">
      <div className="container-page">
        <SectionHeading id="details-title" eyebrow="Property details" title="The finer points" intro={property.style ? `${property.style} · Built ${property.yearBuilt}` : undefined} />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {property.facts.map((group, i) => (
            <Reveal key={group.title} delay={i * 80} className="rounded-[1.5rem] bg-surface p-6 shadow-[var(--shadow-soft)] md:p-7">
              <h3 className="font-display mb-4 text-2xl">{group.title}</h3>
              <dl className="divide-y divide-line">
                {group.items.map((item) => (
                  <div key={item.label} className="flex justify-between gap-4 py-2.5 text-[0.95rem]">
                    <dt className="text-muted">{item.label}</dt>
                    <dd className="text-right font-medium text-ink">{item.value}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
