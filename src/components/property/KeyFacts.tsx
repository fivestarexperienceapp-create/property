import { BedDouble, Bath, CalendarRange, Car, Home, Ruler, Tag, Trees } from 'lucide-react';
import type { Property } from '../../config/types';
import { formatBaths, formatNumber, formatPrice } from '../../lib/format';

export function KeyFacts({ property }: { property: Property }) {
  const facts = [
    { icon: Tag, label: 'Price', value: formatPrice(property.price) },
    { icon: BedDouble, label: 'Bedrooms', value: String(property.beds) },
    { icon: Bath, label: 'Bathrooms', value: formatBaths(property) },
    { icon: Ruler, label: 'Interior', value: `${formatNumber(property.interiorSqft)} sq ft` },
    { icon: Trees, label: 'Lot', value: `${formatNumber(property.lotAcres)} acres` },
    { icon: Car, label: 'Garage', value: `${property.garageSpaces} ${property.garageSpaces === 1 ? 'car' : 'cars'}` },
    { icon: CalendarRange, label: 'Built', value: String(property.yearBuilt) },
    { icon: Home, label: 'Style', value: property.style },
  ];
  return (
    <section aria-label="Property facts" className="border-b border-line bg-surface">
      <dl className="container-page grid grid-cols-2 gap-px py-2 sm:grid-cols-4 lg:grid-cols-8">
        {facts.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex flex-col gap-1 px-1 py-4 sm:px-3 lg:items-center lg:text-center">
            <dt className="flex items-center gap-1.5 text-[0.7rem] font-semibold tracking-[0.14em] text-muted uppercase">
              <Icon aria-hidden className="size-3.5 text-sage" />
              {label}
            </dt>
            <dd className="font-display text-xl leading-tight text-ink md:text-[1.4rem]">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
