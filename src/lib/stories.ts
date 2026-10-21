import { agent } from '../config';
import type { Photo, Property } from '../config/types';
import { formatBaths, formatNumber, formatOpenHouse, formatPrice, upcomingOpenHouses } from './format';

export type SlideKind = 'cover' | 'feature' | 'open-house' | 'closing';

export interface Slide {
  id: string;
  kind: SlideKind;
  photo: Photo;
  kicker: string;
  title: string;
  text?: string;
  /** object-position for the tall crop */
  focus?: string;
}

export const DEFAULT_SLIDE_SECONDS = 6;
/** Keeps auto-built stories short enough to finish. */
export const MAX_FEATURE_SLIDES = 8;

/**
 * Builds a listing's story: a cover, the feature slides (custom or derived from
 * highlights and photos), an upcoming open house if any, and a closing contact slide.
 */
export function buildStory(property: Property, now: Date = new Date()): Slide[] {
  const { photos } = property;
  if (property.stories?.enabled === false || !photos.length) return [];
  const byId = new Map(photos.map((p) => [p.id, p]));
  const cover = photos[0];

  const slides: Slide[] = [
    {
      id: 'cover',
      kind: 'cover',
      photo: cover,
      kicker: `${property.status} · ${property.community}`,
      title: property.name,
      text: `${formatPrice(property.price)} · ${property.beds} beds · ${formatBaths(property)} baths · ${formatNumber(property.interiorSqft)} sq ft`,
    },
  ];

  const custom = property.stories?.slides?.filter((s) => byId.has(s.photoId)) ?? [];
  if (custom.length) {
    custom.forEach((s, i) =>
      slides.push({ id: `custom-${i}`, kind: 'feature', photo: byId.get(s.photoId)!, kicker: s.kicker ?? 'Inside', title: s.title, text: s.text, focus: s.focus }),
    );
  } else {
    const used = new Set([cover.id]);
    const features: Slide[] = [];
    for (const h of property.highlights) {
      const photo = h.photoId ? byId.get(h.photoId) : undefined;
      if (!photo || used.has(photo.id)) continue;
      used.add(photo.id);
      features.push({ id: `highlight-${photo.id}`, kind: 'feature', photo, kicker: 'Highlight', title: h.title, text: h.text });
    }
    for (const photo of photos) {
      if (used.has(photo.id)) continue;
      used.add(photo.id);
      features.push({ id: `photo-${photo.id}`, kind: 'feature', photo, kicker: 'Take a look', title: photo.caption || photo.alt });
    }
    slides.push(...features.slice(0, MAX_FEATURE_SLIDES));
  }

  const openHouse = upcomingOpenHouses(property.openHouses, now)[0];
  if (openHouse) {
    const f = formatOpenHouse(openHouse);
    slides.push({
      id: 'open-house',
      kind: 'open-house',
      photo: cover,
      kicker: 'Open house',
      title: `${f.day}, ${f.date}`,
      text: [f.time, openHouse.note].filter(Boolean).join(' · '),
    });
  }

  slides.push({
    id: 'closing',
    kind: 'closing',
    photo: photos[photos.length - 1],
    kicker: agent.name,
    title: 'Want to see it in person?',
    text: `Schedule a private tour of ${property.name} or ask ${agent.name.split(' ')[0]} a question.`,
  });
  return slides;
}

export function slideDurationMs(property: Property): number {
  return (property.stories?.slideSeconds ?? DEFAULT_SLIDE_SECONDS) * 1000;
}
