import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { config } from './index.ts';
import { DEMO_APP_ID } from './site.ts';
import { isFictionalPhone, isPlaceholderEmail, validateConfig } from './validate.ts';
import { checkPublicUrl, githubPagesUrlFromRepository, joinHashRoute } from './public-url.ts';
import type { ShowcaseConfig } from './types.ts';

const publicDir = path.resolve(import.meta.dirname, '../../public');
const fileExists = (p: string) => fs.existsSync(path.join(publicDir, p));
const clone = (): ShowcaseConfig => JSON.parse(JSON.stringify(config));

/** The current config with typical demo placeholders injected, so these tests hold for any customer content. */
function withPlaceholders(): ShowcaseConfig {
  const c = clone();
  c.site.appId = DEMO_APP_ID;
  c.agent.name = 'John Doe';
  c.agent.contact.phone = '+16155550142';
  c.agent.contact.email = 'john.doe@example.com';
  c.properties[0].isFictional = true;
  c.properties[0].photos[0].credit.isDemoArtwork = true;
  c.neighborhoods[0].isSample = true;
  c.neighborhoods[0].places.push({ id: 'zz-sample', name: 'Sample Café', category: 'restaurants', lat: 36.15, lng: -86.8, sample: true });
  return c;
}

describe('current configuration', () => {
  it('has no errors in its current mode', () => {
    const result = validateConfig(config, { fileExists, resolvedPublicUrl: 'https://agent-sites.github.io/demo/' });
    expect(result.errors).toEqual([]);
  });
});

describe('customer-mode safeguards', () => {
  it('refuses to publish demo content and placeholders as a real site', () => {
    const live = withPlaceholders();
    live.site.demoMode = false;
    const { errors } = validateConfig(live, { resolvedPublicUrl: 'https://agent-sites.github.io/demo/' });
    const text = errors.join('\n');
    expect(text).toMatch(/placeholder number/);
    expect(text).toMatch(/reserved placeholder domain/);
    expect(text).toMatch(/marked fictional/);
    expect(text).toMatch(/demo artwork/);
    expect(text).toMatch(/sample place/);
    expect(text).toMatch(/site.appId is still/);
    expect(text).toMatch(/Demo content still present: "John Doe"/);
  });

  it('requires a public URL for customer sites', () => {
    const live = clone();
    live.site.demoMode = false;
    live.site.publicUrl = '';
    expect(validateConfig(live, { resolvedPublicUrl: null }).errors.join('\n')).toMatch(/Public URL unavailable/);
    const demo = clone();
    demo.site.demoMode = true;
    demo.site.publicUrl = '';
    const demoResult = validateConfig(demo, { resolvedPublicUrl: null });
    expect(demoResult.errors).toEqual([]);
    expect(demoResult.warnings.join('\n')).toMatch(/Public URL unavailable/);
  });

  it('detects placeholder phones and emails', () => {
    expect(isFictionalPhone('+16155550142')).toBe(true);
    expect(isFictionalPhone('(615) 555-0199')).toBe(true);
    expect(isFictionalPhone('+10000000000')).toBe(true);
    expect(isFictionalPhone('+16155550242')).toBe(false);
    expect(isPlaceholderEmail('john.doe@example.com')).toBe(true);
    expect(isPlaceholderEmail('agent@mail.example.org')).toBe(true);
    expect(isPlaceholderEmail('me@site.test')).toBe(true);
    expect(isPlaceholderEmail('jane@realagency.com')).toBe(false);
  });

  it('catches broken references', () => {
    const bad = clone();
    bad.site.featuredPropertyId = 'missing';
    bad.properties[0].highlights.push({ title: 'Test', text: 'Test', icon: 'home', photoId: 'nope' });
    bad.properties[0].neighborhoodId = 'nowhere';
    bad.properties[0].stories = { slideSeconds: 1, slides: [{ photoId: 'ghost', title: 'Ghost slide' }] };
    const text = validateConfig(bad).errors.join('\n');
    expect(text).toMatch(/featuredPropertyId/);
    expect(text).toMatch(/unknown photo "nope"/);
    expect(text).toMatch(/neighborhoodId "nowhere"/);
    expect(text).toMatch(/slideSeconds must be between 3 and 20/);
    expect(text).toMatch(/story slide "Ghost slide" references unknown photo "ghost"/);
  });
});

describe('public URL handling', () => {
  it('normalizes GitHub Pages and custom domain URLs', () => {
    expect(checkPublicUrl('https://agent-sites.github.io/willow')).toEqual({ ok: true, url: 'https://agent-sites.github.io/willow/' });
    expect(checkPublicUrl('https://homes.janesmith.com/index.html#/x')).toEqual({ ok: true, url: 'https://homes.janesmith.com/' });
  });
  it('never accepts local, private, insecure or placeholder addresses', () => {
    for (const bad of ['http://agent.github.io/x/', 'https://localhost:5173/', 'https://127.0.0.1/', 'https://192.168.1.4/', 'https://USERNAME.github.io/REPOSITORY/', 'not a url', '']) {
      expect(checkPublicUrl(bad).ok).toBe(false);
    }
  });
  it('derives the Pages URL from the repository', () => {
    expect(githubPagesUrlFromRepository('AgentSites/willow-demo')).toBe('https://agentsites.github.io/willow-demo/');
    expect(githubPagesUrlFromRepository('agentsites/agentsites.github.io')).toBe('https://agentsites.github.io/');
    expect(githubPagesUrlFromRepository(undefined)).toBeNull();
  });
  it('builds shareable hash links', () => {
    expect(joinHashRoute('https://a.github.io/r/', '/homes/the-willow-house')).toBe('https://a.github.io/r/#/homes/the-willow-house');
  });
});
