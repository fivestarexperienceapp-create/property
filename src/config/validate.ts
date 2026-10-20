import type { ShowcaseConfig } from './types.ts';
import { checkPublicUrl } from './public-url.ts';
import { DEMO_APP_ID } from './site.ts';

export const PHOTO_WIDTHS = [640, 1280, 1920] as const;

export interface ValidationResult {
  errors: string[];
  warnings: string[];
}

export interface ValidationOptions {
  /** Public URL after build-time resolution (config value or GitHub Pages address). */
  resolvedPublicUrl?: string | null;
  /** Checks that a file exists under public/. Provided by the build. */
  fileExists?: (publicPath: string) => boolean;
}

/** Phrases that only belong in the demo. Their presence on a customer site is an error. */
const DEMO_PHRASES = [
  'Willow & Stone',
  'John Doe',
  'Willow House',
  'Willow Creek Estates',
  'Linden Square',
  'Linden Townhome',
  'Hawthorne Ridge',
  'fictional',
  'Sample neighborhood',
];

const RESERVED_EMAIL_DOMAIN = /@(?:[a-z0-9-]+\.)*(example\.(com|org|net)|[a-z0-9-]+\.(test|invalid|example|localhost))$/i;
/** North American fictional range 555-0100 through 555-0199. */
const FICTIONAL_PHONE = /555-?01\d\d$/;

const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^\d{2}:\d{2}$/;

function digits(value: string | undefined): string {
  return (value ?? '').replace(/[^\d]/g, '');
}

export function isFictionalPhone(value: string | undefined): boolean {
  const d = digits(value);
  if (!d) return false;
  const local = d.length === 11 && d.startsWith('1') ? d.slice(1) : d;
  return FICTIONAL_PHONE.test(`${local.slice(3, 6)}-${local.slice(6)}`) || /^0+$/.test(local) || /^(\d)\1+$/.test(local);
}

export function isPlaceholderEmail(value: string | undefined): boolean {
  if (!value) return false;
  return RESERVED_EMAIL_DOMAIN.test(value.trim());
}

function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

export function validateConfig(config: ShowcaseConfig, options: ValidationOptions = {}): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const { site, branding, agent, properties, neighborhoods, integrations } = config;
  const live = !site.demoMode;

  // ---- Site -------------------------------------------------------------
  if (!/^[a-z0-9][a-z0-9-]{2,48}$/.test(site.appId)) {
    errors.push('site.appId must be 3-49 lowercase letters, numbers or dashes.');
  }
  if (!site.title.trim()) errors.push('site.title is required.');
  if (!site.appName.trim() || !site.appShortName.trim()) errors.push('site.appName and site.appShortName are required.');
  if (site.appShortName.length > 15) warnings.push('site.appShortName is longer than 15 characters and may be cut off under the app icon.');

  const publicUrlSource = options.resolvedPublicUrl ?? site.publicUrl;
  const publicUrl = checkPublicUrl(publicUrlSource);
  if (site.publicUrl && !checkPublicUrl(site.publicUrl).ok) {
    errors.push(`site.publicUrl: ${(checkPublicUrl(site.publicUrl) as { reason: string }).reason}`);
  } else if (!publicUrl.ok) {
    const message = `Public URL unavailable (${publicUrl.reason}) QR codes and share links need it. It is detected automatically on GitHub Pages, or set site.publicUrl.`;
    if (live) errors.push(message);
    else warnings.push(message);
  }

  // ---- Branding ----------------------------------------------------------
  for (const [key, value] of Object.entries(branding.colors)) {
    if (!HEX.test(value)) errors.push(`branding.colors.${key} must be a hex color like #4E5E48.`);
  }
  if (!branding.mark.paths.length) errors.push('branding.mark needs at least one path.');

  // ---- Agent -------------------------------------------------------------
  const contact = agent.contact;
  if (!agent.name.trim()) errors.push('agent.name is required.');
  if (contact.phone && !/^\+\d{8,15}$/.test(contact.phone)) errors.push('agent.contact.phone must be E.164, e.g. +13145551234.');
  if (contact.sms && !/^\+\d{8,15}$/.test(contact.sms)) errors.push('agent.contact.sms must be E.164, e.g. +13145551234.');
  if (contact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) errors.push('agent.contact.email is not a valid email address.');
  for (const key of ['schedulingUrl', 'websiteUrl'] as const) {
    const value = contact[key];
    if (value && !isHttpsUrl(value)) errors.push(`agent.contact.${key} must be an https URL.`);
  }
  if (live) {
    if (!contact.phone && !contact.email) errors.push('A real site needs at least an agent phone number or email.');
    if (isFictionalPhone(contact.phone) || isFictionalPhone(contact.sms)) {
      errors.push('agent.contact phone/sms is a placeholder number (555-01xx or repeated digits).');
    }
    if (isPlaceholderEmail(contact.email)) errors.push('agent.contact.email uses a reserved placeholder domain.');
    if (contact.schedulingUrl && /example\./i.test(contact.schedulingUrl)) errors.push('agent.contact.schedulingUrl is a placeholder.');
  }

  // ---- Properties --------------------------------------------------------
  if (!properties.length) errors.push('Add at least one property.');
  const ids = new Set<string>();
  for (const p of properties) {
    const at = `properties["${p.id}"]`;
    if (!SLUG.test(p.id)) errors.push(`${at}.id must be a lowercase slug like "the-willow-house".`);
    if (ids.has(p.id)) errors.push(`${at}: duplicate property id.`);
    ids.add(p.id);
    if (!p.name.trim()) errors.push(`${at}.name is required.`);
    for (const key of ['price', 'beds', 'interiorSqft', 'yearBuilt'] as const) {
      if (!Number.isFinite(p[key]) || p[key] <= 0) errors.push(`${at}.${key} must be a positive number.`);
    }
    for (const key of ['lotAcres', 'garageSpaces', 'hoaMonthly', 'annualTaxes', 'annualInsurance'] as const) {
      if (!Number.isFinite(p[key]) || p[key] < 0) errors.push(`${at}.${key} must be zero or more.`);
    }
    if (p.baths.full + p.baths.half <= 0) errors.push(`${at}.baths must include at least one bath.`);
    if (!p.photos.length) errors.push(`${at} needs at least one photo.`);
    const photoIds = new Set<string>();
    for (const photo of p.photos) {
      if (photoIds.has(photo.id)) errors.push(`${at}: duplicate photo id "${photo.id}".`);
      photoIds.add(photo.id);
      if (!photo.alt.trim()) errors.push(`${at}: photo "${photo.id}" needs alt text.`);
      if (!photo.credit.label.trim() || !photo.credit.license.trim()) errors.push(`${at}: photo "${photo.id}" needs a credit label and license.`);
      if (live && photo.credit.isDemoArtwork) errors.push(`${at}: photo "${photo.id}" is demo artwork. Replace it with the listing's photos.`);
      if (options.fileExists) {
        for (const width of PHOTO_WIDTHS) {
          const file = `${photo.src}-${width}.webp`;
          if (!options.fileExists(file)) errors.push(`${at}: missing image public/${file} (run the photo pipeline).`);
        }
      }
    }
    for (const h of p.highlights) {
      if (h.photoId && !photoIds.has(h.photoId)) errors.push(`${at}: highlight "${h.title}" references unknown photo "${h.photoId}".`);
    }
    if (!neighborhoods.some((n) => n.id === p.neighborhoodId)) errors.push(`${at}.neighborhoodId "${p.neighborhoodId}" does not exist.`);
    for (const oh of p.openHouses ?? []) {
      if (!DATE.test(oh.date) || !TIME.test(oh.start) || !TIME.test(oh.end)) {
        errors.push(`${at}: open house dates must be "YYYY-MM-DD" with "HH:MM" times.`);
      }
    }
    if (p.tour && !(p.tour.kind === 'video' && !/^https?:/i.test(p.tour.url)) && !isHttpsUrl(p.tour.url)) {
      errors.push(`${at}.tour.url must be an https embed URL.`);
    }
    if (p.floorPlan?.image && options.fileExists && !options.fileExists(p.floorPlan.image)) {
      errors.push(`${at}: missing floor plan image public/${p.floorPlan.image}.`);
    }
    if (live && p.isFictional) errors.push(`${at} is marked fictional. Customer sites can only publish real listings.`);
  }
  if (!ids.has(site.featuredPropertyId)) errors.push(`site.featuredPropertyId "${site.featuredPropertyId}" does not match a property.`);

  // ---- Neighborhoods -----------------------------------------------------
  for (const n of neighborhoods) {
    const at = `neighborhoods["${n.id}"]`;
    if (!Number.isFinite(n.center.lat) || !Number.isFinite(n.center.lng)) errors.push(`${at}.center needs numeric coordinates.`);
    for (const place of n.places) {
      if (Math.abs(place.lat) > 90 || Math.abs(place.lng) > 180) errors.push(`${at}: place "${place.name}" has invalid coordinates.`);
      if (live && place.sample) errors.push(`${at}: "${place.name}" is a sample place. Replace it with a real nearby place.`);
    }
    if (live && n.isSample) errors.push(`${at} is a sample explorer. Set isSample: false once real places are added.`);
  }

  // ---- Integrations ------------------------------------------------------
  const map = integrations.map;
  if (map.enabled) {
    if (!/^https:\/\/.+\{z\}.+\{x\}.+\{y\}/.test(map.tileUrl)) errors.push('integrations.map.tileUrl must be an https template with {z}, {x} and {y}.');
    if (!map.attribution.trim()) errors.push('integrations.map.attribution is required by tile providers.');
  }
  const inquiry = integrations.inquiry;
  if (inquiry.endpoint && !isHttpsUrl(inquiry.endpoint)) errors.push('integrations.inquiry.endpoint must be an https URL.');
  if (live && !inquiry.endpoint && !contact.email) {
    errors.push('Inquiries need either integrations.inquiry.endpoint or agent.contact.email (email-draft fallback).');
  }

  // ---- Leftover demo content ----------------------------------------------
  if (live) {
    if (site.appId === DEMO_APP_ID) errors.push(`site.appId is still "${DEMO_APP_ID}". Give each customer app its own id.`);
    const serialized = JSON.stringify(config).toLowerCase();
    for (const phrase of DEMO_PHRASES) {
      if (serialized.includes(phrase.toLowerCase())) errors.push(`Demo content still present: "${phrase}".`);
    }
  }

  return { errors, warnings };
}
