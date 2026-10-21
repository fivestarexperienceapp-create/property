import { useMemo, useState } from 'react';
import { Heart, SlidersHorizontal } from 'lucide-react';
import { branding, properties, site } from '../config';
import { formatPriceShort } from '../lib/format';
import { useFavorites } from '../state/collections';
import { CompareTray } from '../components/listings/CompareTray';
import { ListingCard } from '../components/listings/ListingCard';
import { Button } from '../components/ui/Button';
import { Reveal } from '../components/ui/Reveal';

type Sort = 'featured' | 'price-asc' | 'price-desc' | 'newest' | 'largest';

const STEP = 100_000;
const minP = Math.floor(Math.min(...properties.map((p) => p.price)) / STEP) * STEP;
const maxP = Math.ceil(Math.max(...properties.map((p) => p.price)) / STEP) * STEP;
const PRICE_STEPS = Array.from({ length: Math.max(1, (maxP - minP) / STEP + 1) }, (_, i) => minP + i * STEP);
const BED_OPTIONS = [0, 2, 3, 4, 5];

export function ListingsPage() {
  const favorites = useFavorites();
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);
  const [beds, setBeds] = useState(0);
  const [savedOnly, setSavedOnly] = useState(false);
  const [sort, setSort] = useState<Sort>('featured');

  const results = useMemo(() => {
    const list = properties.filter(
      (p) => (!minPrice || p.price >= minPrice) && (!maxPrice || p.price <= maxPrice) && p.beds >= beds && (!savedOnly || favorites.ids.includes(p.id)),
    );
    const sorted = [...list];
    if (sort === 'price-asc') sorted.sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') sorted.sort((a, b) => b.price - a.price);
    if (sort === 'newest') sorted.sort((a, b) => b.yearBuilt - a.yearBuilt);
    if (sort === 'largest') sorted.sort((a, b) => b.interiorSqft - a.interiorSqft);
    if (sort === 'featured') sorted.sort((a, b) => Number(b.id === site.featuredPropertyId) - Number(a.id === site.featuredPropertyId));
    return sorted;
  }, [minPrice, maxPrice, beds, savedOnly, sort, favorites.ids]);

  const filtered = minPrice || maxPrice || beds || savedOnly;
  const invalidRange = minPrice > 0 && maxPrice > 0 && minPrice > maxPrice;
  const reset = () => {
    setMinPrice(0);
    setMaxPrice(0);
    setBeds(0);
    setSavedOnly(false);
  };
  const label = 'text-xs font-semibold tracking-[0.12em] text-muted uppercase';

  return (
    <div className="pb-28">
      <section className="container-page pt-12 pb-8 md:pt-20 md:pb-12">
        <p className="eyebrow mb-3">{branding.brokerageName}</p>
        <h1 tabIndex={-1} className="font-display text-5xl leading-none outline-none md:text-7xl">
          Homes for sale
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted">Browse every listing, save favorites to this device and compare up to three homes side by side.</p>
      </section>

      <section aria-label="Filters" className="container-page">
        <div className="grid gap-4 rounded-[1.5rem] border border-line bg-surface p-4 shadow-[var(--shadow-soft)] sm:grid-cols-2 md:p-5 lg:grid-cols-[1.2fr_1.2fr_auto_auto]">
          <fieldset className="grid grid-cols-2 gap-2">
            <legend className={`${label} mb-2`}>Price</legend>
            <label className="sr-only" htmlFor="min-price">Minimum price</label>
            <select id="min-price" className="field" value={minPrice} onChange={(e) => setMinPrice(Number(e.target.value))}>
              <option value={0}>No min</option>
              {PRICE_STEPS.map((v) => (
                <option key={v} value={v}>
                  {formatPriceShort(v)}
                </option>
              ))}
            </select>
            <label className="sr-only" htmlFor="max-price">Maximum price</label>
            <select id="max-price" className="field" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))}>
              <option value={0}>No max</option>
              {PRICE_STEPS.map((v) => (
                <option key={v} value={v}>
                  {formatPriceShort(v)}
                </option>
              ))}
            </select>
          </fieldset>
          <fieldset>
            <legend className={`${label} mb-2`}>Bedrooms</legend>
            <div role="radiogroup" aria-label="Minimum bedrooms" className="grid grid-cols-5 gap-1 rounded-xl border border-line bg-linen p-1">
              {BED_OPTIONS.map((b) => (
                <button
                  key={b}
                  type="button"
                  role="radio"
                  aria-checked={beds === b}
                  onClick={() => setBeds(b)}
                  className={`h-[2.35rem] rounded-lg text-sm font-semibold transition ${beds === b ? 'bg-surface text-ink shadow-sm' : 'text-muted hover:text-ink'}`}
                >
                  {b === 0 ? 'Any' : `${b}+`}
                </button>
              ))}
            </div>
          </fieldset>
          <div className="flex flex-col">
            <span className={`${label} mb-2`} id="saved-label">Show</span>
            <button
              type="button"
              aria-pressed={savedOnly}
              aria-describedby="saved-label"
              onClick={() => setSavedOnly((v) => !v)}
              className={`inline-flex h-[2.95rem] items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition ${savedOnly ? 'border-sage-strong bg-sage-soft text-sage-strong' : 'border-line text-muted hover:text-ink'}`}
            >
              <Heart aria-hidden className={`size-4 ${savedOnly ? 'fill-sage-strong' : ''}`} /> Saved only
            </button>
          </div>
          <div className="flex flex-col">
            <label htmlFor="sort" className={`${label} mb-2`}>
              Sort
            </label>
            <select id="sort" className="field" value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
              <option value="featured">Featured</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="newest">Newest built</option>
              <option value="largest">Largest</option>
            </select>
          </div>
        </div>
        <div className="mt-5 mb-5 flex items-center justify-between gap-3">
          <p className="text-sm text-muted" aria-live="polite">
            {results.length} {results.length === 1 ? 'home' : 'homes'}
            {filtered ? ' match your filters' : ''}
          </p>
          {!!filtered && (
            <button type="button" onClick={reset} className="text-sm font-semibold text-sage-strong underline-offset-4 hover:underline">
              Reset filters
            </button>
          )}
        </div>
      </section>

      <section aria-label="Results" className="container-page">
        {results.length ? (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((p, i) => (
              <Reveal as="li" key={p.id} delay={i * 70}>
                <ListingCard property={p} featured={p.id === site.featuredPropertyId} />
              </Reveal>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center rounded-[1.5rem] border border-dashed border-line px-6 py-16 text-center">
            <SlidersHorizontal aria-hidden className="size-8 text-sage" />
            <h2 className="font-display mt-4 text-3xl">No homes match these filters</h2>
            <p className="mt-2 max-w-md text-muted">
              {invalidRange
                ? 'The minimum price is higher than the maximum. Adjust the price range to see homes.'
                : savedOnly && !favorites.ids.length
                  ? 'You haven’t saved any homes yet. Tap the heart on a listing to save it to this device.'
                  : 'Try widening the price range or lowering the number of bedrooms.'}
            </p>
            <Button className="mt-6" onClick={reset}>
              Show all homes
            </Button>
          </div>
        )}
      </section>
      <CompareTray />
    </div>
  );
}
