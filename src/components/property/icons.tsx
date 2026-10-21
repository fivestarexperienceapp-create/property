import { BedDouble, Briefcase, Car, ChefHat, Flame, Home, Sparkles, Sun, Trees, Building2, Flower2 } from 'lucide-react';
import type { HighlightIcon } from '../../config/types';

export const highlightIcons: Record<HighlightIcon, typeof Home> = {
  kitchen: ChefHat,
  patio: Sun,
  office: Briefcase,
  suite: BedDouble,
  yard: Flower2,
  garage: Car,
  fireplace: Flame,
  terrace: Building2,
  trees: Trees,
  sparkle: Sparkles,
  home: Home,
};
