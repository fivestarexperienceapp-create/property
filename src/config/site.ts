import type { SiteConfig } from './types.ts';

/** Fixed id of the bundled demo. Customer sites must use their own id. */
export const DEMO_APP_ID = 'willow-stone-demo';

export const site: SiteConfig = {
  appId: DEMO_APP_ID,
  // Central switch. Set to false for a real customer site; the build then
  // refuses to publish fictional listings or placeholder contact details.
  demoMode: true,
  // "" = use the GitHub Pages address detected during deployment.
  publicUrl: '',
  title: 'The Willow House · Willow & Stone Realty',
  description:
    'Explore The Willow House, a four-bedroom contemporary farmhouse in Willow Creek Estates, Nashville. A demo property showcase with fictional agency and listings.',
  appName: 'Willow & Stone Homes',
  appShortName: 'W&S Homes',
  locale: 'en-US',
  currency: 'USD',
  timeZone: 'America/Chicago',
  featuredPropertyId: 'the-willow-house',
};
