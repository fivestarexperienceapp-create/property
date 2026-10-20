import { site } from '../config';
import type { OpenHouse, Property } from '../config/types';

const currency = new Intl.NumberFormat(site.locale, {
  style: 'currency',
  currency: site.currency,
  maximumFractionDigits: 0,
});
const number = new Intl.NumberFormat(site.locale, { maximumFractionDigits: 2 });

export const formatPrice = (value: number) => currency.format(value);
export const formatMoney = (value: number) => currency.format(Math.round(value));
export const formatNumber = (value: number) => number.format(value);

const compact = new Intl.NumberFormat(site.locale, {
  style: 'currency',
  currency: site.currency,
  notation: 'compact',
  maximumFractionDigits: 2,
});

/** "$625K" style compact price for chips and filters. */
export const formatPriceShort = (value: number) => compact.format(value);

export function bathCount(p: Pick<Property, 'baths'>): number {
  return p.baths.full + p.baths.half * 0.5;
}

export function formatBaths(p: Pick<Property, 'baths'>): string {
  return formatNumber(bathCount(p));
}

export function pricePerSqft(p: Pick<Property, 'price' | 'interiorSqft'>): number {
  return p.interiorSqft > 0 ? p.price / p.interiorSqft : 0;
}

function toLocalDate(date: string, time: string): Date {
  const [y, m, d] = date.split('-').map(Number);
  const [hh, mm] = time.split(':').map(Number);
  return new Date(y, m - 1, d, hh, mm);
}

export function formatOpenHouse(oh: OpenHouse): { day: string; date: string; time: string; short: string } {
  const start = toLocalDate(oh.date, oh.start);
  const end = toLocalDate(oh.date, oh.end);
  const time = new Intl.DateTimeFormat(site.locale, { hour: 'numeric', minute: '2-digit' });
  const compact = (d: Date) => time.format(d).replace(':00', '');
  return {
    day: new Intl.DateTimeFormat(site.locale, { weekday: 'long' }).format(start),
    date: new Intl.DateTimeFormat(site.locale, { month: 'long', day: 'numeric' }).format(start),
    time: `${time.format(start)} – ${time.format(end)}`,
    short: `${new Intl.DateTimeFormat(site.locale, { weekday: 'short', month: 'short', day: 'numeric' }).format(start)} · ${compact(start)}–${compact(end)}`,
  };
}

/** Open houses whose date has not passed (compared by calendar day). */
export function upcomingOpenHouses(list: OpenHouse[] | undefined, now = new Date()): OpenHouse[] {
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  return (list ?? []).filter((oh) => oh.date >= today).sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));
}

export function formatSavedDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat(site.locale, { month: 'long', day: 'numeric', year: 'numeric' }).format(d);
}

export function formatTimeShort(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const sameDay = d.toDateString() === new Date().toDateString();
  return new Intl.DateTimeFormat(site.locale, sameDay ? { hour: 'numeric', minute: '2-digit' } : { month: 'short', day: 'numeric' }).format(d);
}
