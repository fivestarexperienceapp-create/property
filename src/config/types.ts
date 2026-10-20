/**
 * Content types for a property showcase site.
 *
 * Every customer-specific detail lives in the sibling config files
 * (site, branding, agent, properties, neighborhoods, integrations).
 * Components never hard-code customer content.
 */

export interface SiteConfig {
  /**
   * Unique id for this customer app (lowercase letters, numbers, dashes).
   * Namespaces service-worker caches and on-device saved data so several apps
   * hosted on the same GitHub Pages account never share or erase each other's data.
   */
  appId: string;
  /** true = fictional sales demo. false = real customer site (strict validation at build). */
  demoMode: boolean;
  /**
   * Public address of the deployed site, ending in a slash, e.g.
   * "https://username.github.io/repository/" or "https://homes.example-agent.com/".
   * Leave "" to use the address reported by GitHub Pages during deployment.
   * QR codes and share links always use this address, never localhost.
   */
  publicUrl: string;
  /** Browser tab / social preview title. */
  title: string;
  /** Social preview and search description. */
  description: string;
  /** Installed app name and the short label under the home-screen icon. */
  appName: string;
  appShortName: string;
  /** BCP 47 locale for number/date formatting. */
  locale: string;
  /** ISO 4217 currency code. */
  currency: string;
  /** IANA time zone used to describe open-house times. */
  timeZone: string;
  /** Listing shown on the home screen. */
  featuredPropertyId: string;
}

export interface BrandColors {
  /** Page background (warm white). */
  background: string;
  /** Cards and raised surfaces. */
  surface: string;
  /** Alternate section background. */
  surfaceAlt: string;
  /** Primary text (charcoal). */
  ink: string;
  /** Secondary text. Keep at least 4.5:1 contrast with background. */
  inkMuted: string;
  /** Hairlines and borders. */
  line: string;
  /** Accent used for icons, chips and highlights. */
  accent: string;
  /** Darker accent for buttons and links (white text must stay readable on it). */
  accentStrong: string;
  /** Pale accent tint for backgrounds. */
  accentSoft: string;
}

export interface BrandMarkPath {
  d: string;
  /** Use a brand color token or any CSS color. */
  fill: 'accent' | 'accentStrong' | 'ink' | 'background' | 'surface' | string;
  opacity?: number;
}

export interface BrandingConfig {
  brokerageName: string;
  /** Wordmark shown in the header, e.g. primary "Willow & Stone", secondary "Realty". */
  wordmark: { primary: string; secondary?: string };
  tagline: string;
  colors: BrandColors;
  /** Simple vector mark (24-unit or larger viewBox). Used in the header and to generate app icons. */
  mark: { viewBox: string; paths: BrandMarkPath[] };
  /** Short legal lines for the footer (e.g. brokerage disclosures, Equal Housing Opportunity). */
  legal: string[];
}

export interface AgentContact {
  /** E.164 format, e.g. "+13145550142". Calls are disabled in demo mode. */
  phone?: string;
  /** Human-friendly phone, e.g. "(314) 555-0142". */
  phoneDisplay?: string;
  /** Number for text messages (E.164). Defaults to phone. */
  sms?: string;
  email?: string;
  /** Online booking page (Calendly, Acuity, etc.). */
  schedulingUrl?: string;
  websiteUrl?: string;
}

export interface AgentConfig {
  name: string;
  title: string;
  /** Path under public/ to a square headshot, e.g. "media/agent/headshot-640.webp". Initials are shown when omitted. */
  photo?: string;
  initials: string;
  /** One or two sentences shown on property pages. */
  intro: string;
  /** Longer profile paragraphs for the agent page. */
  bio: string[];
  specialties: string[];
  serviceArea?: string;
  languages?: string[];
  /** Licensing line for real sites only (e.g. "Licensed in Missouri"). Leave empty in demos. */
  credentials?: string;
  contact: AgentContact;
}

export interface PhotoCredit {
  /** Short credit line shown in captions and the credits list. */
  label: string;
  author?: string;
  sourceUrl?: string;
  license: string;
  licenseUrl?: string;
  /** Marks artwork that ships with the demo. Not allowed on customer sites. */
  isDemoArtwork?: boolean;
}

export interface Photo {
  id: string;
  /**
   * Path under public/ without the width suffix. The photo pipeline writes
   * `${src}-640.webp`, `${src}-1280.webp` and `${src}-1920.webp`.
   */
  src: string;
  alt: string;
  caption?: string;
  /** CSS object-position for cropping, e.g. "50% 60%". */
  focus?: string;
  credit: PhotoCredit;
}

export type HighlightIcon =
  | 'kitchen'
  | 'patio'
  | 'office'
  | 'suite'
  | 'yard'
  | 'garage'
  | 'fireplace'
  | 'terrace'
  | 'trees'
  | 'sparkle'
  | 'home';

export interface Highlight {
  title: string;
  text: string;
  icon: HighlightIcon;
  /** Optional photo id from this listing to illustrate the highlight. */
  photoId?: string;
}

export interface FactGroup {
  title: string;
  items: { label: string; value: string }[];
}

export type RoomKind =
  | 'living'
  | 'kitchen'
  | 'bedroom'
  | 'bath'
  | 'office'
  | 'utility'
  | 'circulation'
  | 'outdoor'
  | 'garage';

export interface FloorRoom {
  name: string;
  /** Position and size in plan units (any consistent unit). */
  x: number;
  y: number;
  w: number;
  h: number;
  kind: RoomKind;
  /** Sides drawn as open (dashed) for open-concept spaces. */
  open?: Array<'top' | 'right' | 'bottom' | 'left'>;
}

export interface FloorLevel {
  id: string;
  name: string;
  width: number;
  height: number;
  rooms: FloorRoom[];
}

export interface FloorPlan {
  levels: FloorLevel[];
  /** Optional image floor plan (path under public/) used instead of the drawn layout. */
  image?: string;
}

export type TourKind = 'youtube' | 'vimeo' | 'matterport' | 'iframe' | 'video';

export interface TourConfig {
  kind: TourKind;
  /** Embed URL (https). For "video", a path under public/ or an https file URL. */
  url: string;
  title: string;
}

export interface OpenHouse {
  /** Local date in the site time zone, "YYYY-MM-DD". */
  date: string;
  /** 24-hour local times, "HH:MM". */
  start: string;
  end: string;
  note?: string;
}

export type ListingStatus = 'For sale' | 'New listing' | 'Coming soon' | 'Under contract';

export interface Property {
  /** URL slug, e.g. "the-willow-house" → #/homes/the-willow-house */
  id: string;
  name: string;
  status: ListingStatus;
  /** Short editorial headline for the overview section. */
  headline: string;
  /** One sentence for cards and share text. */
  summary: string;
  description: string[];
  price: number;
  beds: number;
  baths: { full: number; half: number };
  interiorSqft: number;
  lotAcres: number;
  garageSpaces: number;
  yearBuilt: number;
  style: string;
  community: string;
  location: {
    /** General area label, e.g. "Greater St. Louis". */
    area: string;
    /** Street address for real listings. Leave "" to hide. */
    streetAddress: string;
  };
  hoaMonthly: number;
  annualTaxes: number;
  /** Defaults the payment estimator's insurance assumption. */
  annualInsurance: number;
  highlights: Highlight[];
  facts: FactGroup[];
  photos: Photo[];
  floorPlan?: FloorPlan;
  tour?: TourConfig;
  openHouses?: OpenHouse[];
  neighborhoodId: string;
  /** Marks invented demo listings. Customer sites cannot publish fictional listings. */
  isFictional: boolean;
}

export type PlaceCategory = 'restaurants' | 'groceries' | 'parks' | 'schools' | 'healthcare';

export interface Place {
  id: string;
  name: string;
  category: PlaceCategory;
  lat: number;
  lng: number;
  description?: string;
  address?: string;
  websiteUrl?: string;
  /** Illustrative marker that does not represent a real place. Directions are disabled. */
  sample: boolean;
}

export interface Neighborhood {
  id: string;
  title: string;
  intro: string;
  /** Sample explorers are clearly labeled and never link to directions. */
  isSample: boolean;
  center: { lat: number; lng: number };
  zoom: number;
  /** Real listings only: the home's map position. Omit for fictional homes. */
  home?: { lat: number; lng: number; label: string };
  places: Place[];
}

export interface MapIntegration {
  enabled: boolean;
  /** Leaflet tile URL template. */
  tileUrl: string;
  /** Attribution HTML required by the tile provider. */
  attribution: string;
  maxZoom: number;
  subdomains?: string;
  /** Soft warm tint applied to tiles to match the brand palette. */
  tint: 'warm' | 'none';
  /** Only enable if the provider's terms allow offline storage. */
  allowServiceWorkerCaching: boolean;
}

export interface InquiryIntegration {
  /**
   * HTTPS endpoint that accepts form posts (Formspree, Basin, Getform, your own API...).
   * Leave "" to open a pre-filled email draft to the agent instead.
   */
  endpoint: string;
  format: 'json' | 'form';
  /** Extra static fields sent with every submission, e.g. { _subject: "New inquiry" }. */
  extraFields?: Record<string, string>;
}

export interface IntegrationsConfig {
  map: MapIntegration;
  inquiry: InquiryIntegration;
}

export interface ShowcaseConfig {
  site: SiteConfig;
  branding: BrandingConfig;
  agent: AgentConfig;
  properties: Property[];
  neighborhoods: Neighborhood[];
  integrations: IntegrationsConfig;
}
