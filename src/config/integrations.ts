import type { IntegrationsConfig } from './types.ts';

export const integrations: IntegrationsConfig = {
  map: {
    enabled: true,
    // Review the provider's usage policy before commercial use (see README).
    tileUrl: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
    maxZoom: 19,
    tint: 'warm',
    allowServiceWorkerCaching: false,
  },
  inquiry: {
    // e.g. 'https://formspree.io/f/abcdwxyz'. "" = email-draft fallback.
    endpoint: '',
    format: 'json',
    extraFields: {},
  },
};
