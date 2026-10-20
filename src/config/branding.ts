import type { BrandingConfig } from './types.ts';

export const branding: BrandingConfig = {
  brokerageName: 'Willow & Stone Realty',
  wordmark: { primary: 'Willow & Stone', secondary: 'Realty' },
  tagline: 'Homes with a sense of place',
  colors: {
    background: '#FAF7F2',
    surface: '#FFFDF9',
    surfaceAlt: '#F2EDE4',
    ink: '#2A2927',
    inkMuted: '#5F5B54',
    line: '#E3DCD0',
    accent: '#8C9B80',
    accentStrong: '#4E5E48',
    accentSoft: '#E6EADF',
  },
  mark: {
    viewBox: '0 0 48 48',
    paths: [
      // Stone
      { d: 'M9.5 35.2c0-4.6 6.4-7.7 14.5-7.7s14.5 3.1 14.5 7.7-6.4 7.8-14.5 7.8S9.5 39.8 9.5 35.2Z', fill: 'ink' },
      // Willow leaves
      { d: 'M24.6 27.2C17.9 21.6 17.7 11.4 28.9 4.5c2.6 9.3.5 17.2-4.3 22.7Z', fill: 'accent' },
      { d: 'M22.6 27.4c-6.2-1.7-10-6.4-9.9-13.2 5.4 1.8 9.1 6.6 9.9 13.2Z', fill: 'accentStrong' },
    ],
  },
  legal: [],
};
