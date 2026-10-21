import { agent, branding, site } from '../../config';
import type { Property } from '../../config/types';
import { formatBaths, formatNumber, formatOpenHouse, formatPrice, upcomingOpenHouses } from '../../lib/format';
import { photoUrl } from '../../lib/media';
import { propertyLink } from '../../lib/share';
import { BrandMark } from '../ui/BrandMark';
import { SafeImg } from '../ui/SafeImg';
import { useQrSvg } from './ShareQr';

/** One-page summary shown only when printing. */
export function PrintSummary({ property }: { property: Property }) {
  const url = propertyLink(property.id);
  const svg = useQrSvg(url);
  const oh = upcomingOpenHouses(property.openHouses)[0];
  const facts: Array<[string, string]> = [
    ['Price', formatPrice(property.price)],
    ['Bedrooms', String(property.beds)],
    ['Bathrooms', formatBaths(property)],
    ['Interior', `${formatNumber(property.interiorSqft)} sq ft`],
    ['Lot', `${formatNumber(property.lotAcres)} acres`],
    ['Garage', `${property.garageSpaces} cars`],
    ['Year built', String(property.yearBuilt)],
    ['Style', property.style],
  ];
  return (
    <article className="print-only text-[11pt] leading-snug text-black" aria-hidden>
      <header className="flex items-center justify-between border-b border-black/20 pb-3">
        <div className="flex items-center gap-2">
          <BrandMark className="size-8" />
          <span className="font-display text-xl font-semibold">{branding.brokerageName}</span>
        </div>
        {site.demoMode && <span className="text-[9pt]">Demo experience — fictional agency and properties.</span>}
      </header>
      <div className="mt-4 grid grid-cols-[1.3fr_1fr] gap-5">
        <div>
          <SafeImg src={photoUrl(property.photos[0], 1280)} alt="" className="aspect-[3/2] w-full rounded object-cover" />
          {property.photos.length > 2 && (
            <div className="mt-2 grid grid-cols-2 gap-2">
              {property.photos.slice(1, 3).map((p) => (
                <SafeImg key={p.id} src={photoUrl(p, 640)} alt="" className="aspect-[3/2] w-full rounded object-cover" />
              ))}
            </div>
          )}
        </div>
        <div>
          <p className="text-[9pt] tracking-widest uppercase">{property.community}</p>
          <h1 className="font-display text-[26pt] leading-none">{property.name}</h1>
          <p className="font-display mt-1 text-[20pt]">{formatPrice(property.price)}</p>
          <table className="mt-3 w-full text-[10pt]">
            <tbody>
              {facts.map(([k, v]) => (
                <tr key={k} className="border-b border-black/10">
                  <td className="py-1 pr-2 text-black/60">{k}</td>
                  <td className="py-1 text-right font-semibold">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {oh && (
            <p className="mt-3 text-[10pt]">
              <strong>Open house:</strong> {formatOpenHouse(oh).day}, {formatOpenHouse(oh).date}, {formatOpenHouse(oh).time}
            </p>
          )}
        </div>
      </div>
      <p className="mt-4">{property.summary}</p>
      <h2 className="font-display mt-3 text-[15pt]">Highlights</h2>
      <ul className="mt-1 list-disc pl-5">
        {property.highlights.map((h) => (
          <li key={h.title}>
            <strong>{h.title}.</strong> {h.text}
          </li>
        ))}
      </ul>
      <footer className="mt-5 flex items-end justify-between gap-6 border-t border-black/20 pt-3">
        <div>
          <p className="font-semibold">
            {agent.name}, {agent.title}
          </p>
          <p>{branding.brokerageName}</p>
          {!site.demoMode && (
            <p>
              {[agent.contact.phoneDisplay, agent.contact.email].filter(Boolean).join(' · ')}
            </p>
          )}
          {url && <p className="mt-1 text-[9pt] break-all">{url}</p>}
          <p className="mt-2 text-[8pt] text-black/60">
            {site.demoMode
              ? 'All details are fictional. Images are illustrative and may depict different homes.'
              : 'Information deemed reliable but not guaranteed. Verify all details independently.'}
          </p>
        </div>
        {url && svg && <div className="size-28 shrink-0 [&>svg]:size-full" dangerouslySetInnerHTML={{ __html: svg }} />}
      </footer>
    </article>
  );
}
