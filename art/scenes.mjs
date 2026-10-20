import { farmhouseFront, farmhouseBack, townhomes, transitional } from './exteriors.mjs';
import { kitchen, greatRoom, openLiving, dining, office, bedroom, bath, coveredPatio, rooftopTerrace, screenedPorch } from './interiors.mjs';

/** Scene name → drawing function. Names map to public/media/<name>-<width>.webp */
export const scenes = {
  // The Willow House
  'the-willow-house/exterior': () => farmhouseFront({ time: 'day' }),
  'the-willow-house/great-room': () => greatRoom({ seed: 3 }),
  'the-willow-house/kitchen': () => kitchen({ seed: 1 }),
  'the-willow-house/dining': () => dining({ seed: 5 }),
  'the-willow-house/office': () => office({ seed: 7 }),
  'the-willow-house/primary-suite': () => bedroom({ seed: 9 }),
  'the-willow-house/primary-bath': () => bath({ seed: 11 }),
  'the-willow-house/patio': () => coveredPatio({ seed: 13 }),
  'the-willow-house/backyard': () => farmhouseBack(),
  'the-willow-house/exterior-dusk': () => farmhouseFront({ time: 'dusk' }),
  // The Linden Townhome
  'the-linden-townhome/exterior': () => townhomes(),
  'the-linden-townhome/living': () => openLiving({ seed: 21 }),
  'the-linden-townhome/bedroom': () =>
    bedroom({ seed: 23, wall: '#eceae6', headboard: '#b9b6ae', duvet: '#f4f4f2', throwColor: '#7b8b8f', accentWall: false }),
  'the-linden-townhome/terrace': () => rooftopTerrace({ seed: 25 }),
  // Hawthorne Ridge Residence
  'hawthorne-ridge-residence/exterior': () => transitional(),
  'hawthorne-ridge-residence/great-room': () => greatRoom({ seed: 31, tall: true, wall: '#eeeae3', sofa: '#d6d2c8', rugColor: '#dcd8cf', floor: '#b8946c' }),
  'hawthorne-ridge-residence/kitchen': () =>
    kitchen({ seed: 33, cabinet: '#f4f2ed', island: '#2f3e55', islandTop: '#f5f4f0', pendantColor: '#c9a15b', pendantInner: '#f6e3b8', backsplash: '#eceae4', floor: '#b8946c' }),
  'hawthorne-ridge-residence/porch': () => screenedPorch({ seed: 35 }),
};
