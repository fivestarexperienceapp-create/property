import { describe, expect, it } from 'vitest';
import { properties } from '../config';
import type { Property } from '../config/types';
import { buildStory, MAX_FEATURE_SLIDES } from './stories';

const clone = (id: string): Property => JSON.parse(JSON.stringify(properties.find((p) => p.id === id) ?? properties[0]));

function listing(): Property {
  const p = clone(properties[0].id);
  p.stories = undefined;
  p.openHouses = [];
  p.highlights = [
    { title: 'Kitchen island', text: 'Seats four.', icon: 'kitchen', photoId: p.photos[1]?.id },
    { title: 'No photo', text: 'Text only.', icon: 'home' },
  ];
  return p;
}

describe('buildStory', () => {
  it('opens with a cover and ends with a contact slide', () => {
    const slides = buildStory(listing());
    expect(slides[0].kind).toBe('cover');
    expect(slides[0].text).toMatch(/\$[\d,]+ · \d+ beds/);
    expect(slides.at(-1)?.kind).toBe('closing');
  });

  it('derives slides from highlights first, then remaining photos, without repeats', () => {
    const p = listing();
    const slides = buildStory(p).filter((s) => s.kind === 'feature');
    expect(slides[0].title).toBe('Kitchen island');
    const ids = slides.map((s) => s.photo.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).not.toContain(p.photos[0].id);
    expect(slides.length).toBe(Math.min(MAX_FEATURE_SLIDES, p.photos.length - 1));
  });

  it('caps auto-built stories', () => {
    const p = listing();
    p.photos = Array.from({ length: 15 }, (_, i) => ({ ...p.photos[0], id: `p${i}`, caption: `Photo ${i}` }));
    p.highlights = [];
    expect(buildStory(p).filter((s) => s.kind === 'feature').length).toBe(MAX_FEATURE_SLIDES);
  });

  it('uses custom slides in order and skips unknown photos', () => {
    const p = listing();
    p.stories = {
      slides: [
        { photoId: p.photos[1].id, kicker: 'Cook', title: 'First' },
        { photoId: 'missing', title: 'Skipped' },
        { photoId: p.photos[0].id, title: 'Second' },
      ],
    };
    const features = buildStory(p).filter((s) => s.kind === 'feature');
    expect(features.map((s) => s.title)).toEqual(['First', 'Second']);
    expect(features[0].kicker).toBe('Cook');
  });

  it('includes an upcoming open house only', () => {
    const p = listing();
    p.openHouses = [{ date: '2030-05-04', start: '13:00', end: '15:00' }];
    expect(buildStory(p, new Date(2030, 4, 1)).some((s) => s.kind === 'open-house')).toBe(true);
    expect(buildStory(p, new Date(2030, 4, 5)).some((s) => s.kind === 'open-house')).toBe(false);
  });

  it('can be turned off per listing', () => {
    const p = listing();
    p.stories = { enabled: false };
    expect(buildStory(p)).toEqual([]);
  });
});
