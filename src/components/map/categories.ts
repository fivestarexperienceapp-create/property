import { GraduationCap, ShoppingBasket, Stethoscope, Trees, Utensils } from 'lucide-react';
import type { PlaceCategory } from '../../config/types';

export const CATEGORY_ORDER: PlaceCategory[] = ['restaurants', 'groceries', 'parks', 'schools', 'healthcare'];

/** Marker icon paths from Lucide (ISC license), used inside Leaflet's HTML markers. */
export const CATEGORIES: Record<PlaceCategory, { label: string; singular: string; color: string; icon: typeof Utensils; paths: string[] }> = {
  restaurants: {
    label: 'Restaurants',
    singular: 'Restaurant',
    color: '#A8664A',
    icon: Utensils,
    paths: ['M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2', 'M7 2v20', 'M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7'],
  },
  groceries: {
    label: 'Groceries',
    singular: 'Grocery',
    color: '#76844F',
    icon: ShoppingBasket,
    paths: ['m15 11-1 9', 'm19 11-4-7', 'M2 11h20', 'm3.5 11 1.6 7.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6l1.7-7.4', 'M4.5 15.5h15', 'm5 11 4-7', 'm9 11 1 9'],
  },
  parks: {
    label: 'Parks',
    singular: 'Park',
    color: '#4B7354',
    icon: Trees,
    paths: ['M10 10v.2A3 3 0 0 1 8.9 16H5a3 3 0 0 1-1-5.8V10a3 3 0 0 1 6 0Z', 'M7 16v6', 'M13 19v3', 'M12 19h8.3a1 1 0 0 0 .7-1.7L18 14h.3a1 1 0 0 0 .7-1.7L16 9h.2a1 1 0 0 0 .8-1.7L13 3l-1.4 1.5'],
  },
  schools: {
    label: 'Schools',
    singular: 'School',
    color: '#566B88',
    icon: GraduationCap,
    paths: ['M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z', 'M22 10v6', 'M6 12.5V16a6 3 0 0 0 12 0v-3.5'],
  },
  healthcare: {
    label: 'Healthcare',
    singular: 'Healthcare',
    color: '#94546A',
    icon: Stethoscope,
    paths: ['M11 2v2', 'M5 2v2', 'M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1', 'M8 15a6 6 0 0 0 12 0v-3', 'M22 10a2 2 0 1 1-4 0a2 2 0 1 1 4 0'],
  },
};

export function directionsUrl(lat: number, lng: number) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}
