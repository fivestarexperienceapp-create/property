import { Plus, Rows3, X } from 'lucide-react';
import { properties } from '../config';
import type { Property } from '../config/types';
import { estimatePayment } from '../lib/mortgage';
import { formatBaths, formatMoney, formatNumber, formatPrice, pricePerSqft } from '../lib/format';
import { href } from '../lib/router';
import { COMPARE_LIMIT, useCompare } from '../state/collections';
import { DEFAULT_ASSUMPTIONS } from '../components/property/MortgageCalculator';
import { LinkButton } from '../components/ui/Button';
import { ResponsiveImage } from '../components/ui/ResponsiveImage';

function monthly(p: Property) {
  return estimatePayment({
    price: p.price,
    downPayment: (p.price * DEFAULT_ASSUMPTIONS.downPercent) / 100,
    ratePercent: DEFAULT_ASSUMPTIONS.ratePercent,
    termYears: DEFAULT_ASSUMPTIONS.termYears,
    annualTaxes: p.annualTaxes,
    annualInsurance: p.annualInsurance,
    hoaMonthly: p.hoaMonthly,
    pmiMonthly: 0,
  }).total;
}

interface Row {
  label: string;
  value: (p: Property) => string;
  /** Returns a number used to mark the best value. */
  score?: (p: Property) => number;
  best?: 'min' | 'max';
}

const rows: Row[] = [
  { label: 'Price', value: (p) => formatPrice(p.price), score: (p) => p.price, best: 'min' },
  { label: 'Est. monthly payment*', value: (p) => formatMoney(monthly(p)), score: monthly, best: 'min' },
  { label: 'Bedrooms', value: (p) => String(p.beds), score: (p) => p.beds, best: 'max' },
  { label: 'Bathrooms', value: (p) => formatBaths(p), score: (p) => p.baths.full + p.baths.half / 2, best: 'max' },
  { label: 'Interior', value: (p) => `${formatNumber(p.interiorSqft)} sq ft`, score: (p) => p.interiorSqft, best: 'max' },
  { label: 'Price per sq ft', value: (p) => formatMoney(pricePerSqft(p)), score: pricePerSqft, best: 'min' },
  { label: 'Lot', value: (p) => `${formatNumber(p.lotAcres)} acres`, score: (p) => p.lotAcres, best: 'max' },
  { label: 'Garage', value: (p) => `${p.garageSpaces} ${p.garageSpaces === 1 ? 'car' : 'cars'}`, score: (p) => p.garageSpaces, best: 'max' },
  { label: 'Year built', value: (p) => String(p.yearBuilt), score: (p) => p.yearBuilt, best: 'max' },
  { label: 'Style', value: (p) => p.style },
  { label: 'HOA', value: (p) => (p.hoaMonthly ? `${formatMoney(p.hoaMonthly)} / mo` : 'None'), score: (p) => p.hoaMonthly, best: 'min' },
  { label: 'Property taxes', value: (p) => `${formatMoney(p.annualTaxes)} / yr`, score: (p) => p.annualTaxes, best: 'min' },
];

export function ComparePage() {
  const compare = useCompare();
  const selected = compare.ids.map((id) => properties.find((p) => p.id === id)).filter((p): p is Property => !!p);
  const bestIds = (row: Row) => {
    if (!row.score || selected.length < 2) return new Set<string>();
    const values = selected.map((p) => row.score!(p));
    const target = row.best === 'min' ? Math.min(...values) : Math.max(...values);
    if (values.every((v) => v === target)) return new Set<string>();
    return new Set(selected.filter((p) => row.score!(p) === target).map((p) => p.id));
  };

  return (
    <div className="container-page pt-12 pb-24 md:pt-20">
      <p className="eyebrow mb-3">Side by side</p>
      <h1 tabIndex={-1} className="font-display text-5xl leading-none outline-none md:text-7xl">
        Compare homes
      </h1>
      <p className="mt-4 max-w-xl text-lg text-muted">Compare up to {COMPARE_LIMIT} homes. Your selection is stored only on this device.</p>

      {selected.length === 0 ? (
        <div className="mt-10 flex flex-col items-center rounded-[1.5rem] border border-dashed border-line px-6 py-16 text-center">
          <Rows3 aria-hidden className="size-8 text-sage" />
          <h2 className="font-display mt-4 text-3xl">Nothing to compare yet</h2>
          <p className="mt-2 max-w-md text-muted">Choose “Compare” on up to {COMPARE_LIMIT} homes to see prices, sizes and estimated payments side by side.</p>
          <LinkButton className="mt-6" href={href.homes()}>
            Browse homes
          </LinkButton>
        </div>
      ) : (
        <>
          <div className="mt-10 overflow-x-auto rounded-[1.5rem] border border-line bg-surface shadow-[var(--shadow-soft)]">
            <table className="w-full min-w-[40rem] border-collapse text-left text-[0.95rem]">
              <caption className="sr-only">Comparison of selected homes</caption>
              <thead>
                <tr>
                  <th scope="col" className="sticky left-0 z-10 w-36 bg-surface p-4 align-bottom text-xs font-semibold tracking-[0.12em] text-muted uppercase md:w-48">
                    Home
                  </th>
                  {selected.map((p) => (
                    <th key={p.id} scope="col" className="min-w-52 p-4 align-top font-normal">
                      <div className="relative">
                        <a href={href.property(p.id)} className="block overflow-hidden rounded-xl">
                          <ResponsiveImage photo={p.photos[0]} sizes="280px" decorative className="aspect-[4/3] w-full" />
                        </a>
                        <button
                          type="button"
                          onClick={() => compare.remove(p.id)}
                          className="absolute top-2 right-2 inline-flex size-9 items-center justify-center rounded-full bg-white/95 text-ink shadow-[var(--shadow-soft)]"
                          aria-label={`Remove ${p.name} from compare`}
                        >
                          <X aria-hidden className="size-4" />
                        </button>
                      </div>
                      <a href={href.property(p.id)} className="font-display mt-3 block text-2xl leading-tight hover:text-sage-strong">
                        {p.name}
                      </a>
                      <p className="text-sm text-muted">{p.community}</p>
                    </th>
                  ))}
                  {selected.length < COMPARE_LIMIT && (
                    <th scope="col" className="min-w-44 p-4 align-top">
                      <a href={href.homes()} className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line text-sm font-semibold text-muted hover:border-sage hover:text-sage-strong">
                        <Plus aria-hidden className="size-5" /> Add a home
                      </a>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const best = bestIds(row);
                  return (
                    <tr key={row.label} className="border-t border-line">
                      <th scope="row" className="sticky left-0 z-10 bg-surface p-4 text-sm font-medium text-muted">
                        {row.label}
                      </th>
                      {selected.map((p) => (
                        <td key={p.id} className="p-4">
                          <span className={best.has(p.id) ? 'font-semibold text-sage-strong' : ''}>{row.value(p)}</span>
                          {best.has(p.id) && <span className="ml-2 rounded-full bg-sage-soft px-2 py-0.5 text-[0.65rem] font-semibold tracking-wider text-sage-strong uppercase">Best</span>}
                        </td>
                      ))}
                      {selected.length < COMPARE_LIMIT && <td />}
                    </tr>
                  );
                })}
                <tr className="border-t border-line align-top">
                  <th scope="row" className="sticky left-0 z-10 bg-surface p-4 text-sm font-medium text-muted">
                    Highlights
                  </th>
                  {selected.map((p) => (
                    <td key={p.id} className="p-4">
                      <ul className="space-y-1 text-sm">
                        {p.highlights.map((h) => (
                          <li key={h.title}>• {h.title}</li>
                        ))}
                      </ul>
                    </td>
                  ))}
                  {selected.length < COMPARE_LIMIT && <td />}
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-muted">
            *Estimated with illustrative assumptions: {DEFAULT_ASSUMPTIONS.downPercent}% down, {DEFAULT_ASSUMPTIONS.ratePercent}% fixed for {DEFAULT_ASSUMPTIONS.termYears} years, plus each listing’s estimated taxes, insurance and HOA. Estimated payment only. Not a loan offer. Actual costs and eligibility vary.
          </p>
          {selected.length > 0 && (
            <button type="button" onClick={compare.clear} className="mt-4 text-sm font-semibold text-sage-strong underline-offset-4 hover:underline">
              Clear comparison
            </button>
          )}
        </>
      )}
    </div>
  );
}
