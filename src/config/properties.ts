import type { Photo, PhotoCredit, Property } from './types.ts';
import { upcomingWeekday } from './demo-dates.ts';

/** Credit for the original illustrations bundled with the demo. */
const demoArtwork: PhotoCredit = {
  label: 'Original illustration created for this demo',
  license: 'Included with this project',
  isDemoArtwork: true,
};

function photo(listing: string, file: string, alt: string, caption: string, focus?: string): Photo {
  return { id: file, src: `media/${listing}/${file}`, alt, caption, focus, credit: demoArtwork };
}

export const properties: Property[] = [
  {
    id: 'the-willow-house',
    name: 'The Willow House',
    status: 'For sale',
    headline: 'Modern farmhouse living, designed for gathering',
    summary:
      'A light-filled contemporary farmhouse with an open kitchen, covered patio and landscaped backyard on a third of an acre.',
    description: [
      'Set on a gently landscaped 0.32-acre lot in Willow Creek Estates, The Willow House pairs classic farmhouse lines with clean, contemporary finishes. Board-and-batten siding, black-framed windows and a cedar-accented front porch welcome you into 2,850 square feet of thoughtfully planned living space.',
      'The heart of the home is an open kitchen anchored by a generous island, flowing into the dining area and a vaulted great room with a fireplace. Wide glass doors open to a covered patio overlooking the backyard, an easy setting for weekday dinners and weekend gatherings.',
      'A dedicated home office keeps work separate from daily life, while the spacious primary suite offers a quiet retreat with a spa-inspired bath and walk-in closet. Three additional bedrooms, two more full baths and a two-car garage complete a home built in 2019 for comfortable, everyday living.',
    ],
    price: 625000,
    beds: 4,
    baths: { full: 3, half: 0 },
    interiorSqft: 2850,
    lotAcres: 0.32,
    garageSpaces: 2,
    yearBuilt: 2019,
    style: 'Contemporary farmhouse',
    community: 'Willow Creek Estates',
    location: { area: 'Nashville, TN', streetAddress: '' },
    hoaMonthly: 65,
    annualTaxes: 5100,
    annualInsurance: 1800,
    highlights: [
      {
        title: 'Open kitchen with a large island',
        text: 'A generous island with seating for four sits at the center of an open kitchen that flows into the dining area and great room.',
        icon: 'kitchen',
        photoId: 'kitchen',
      },
      {
        title: 'Covered patio',
        text: 'Step outside to a covered patio with room for outdoor dining and lounging, sheltered from afternoon sun and passing showers.',
        icon: 'patio',
        photoId: 'patio',
      },
      {
        title: 'Dedicated home office',
        text: 'A quiet office off the entry with built-in shelving and natural light, ready for working from home.',
        icon: 'office',
        photoId: 'office',
      },
      {
        title: 'Spacious primary suite',
        text: 'A tranquil main-level retreat with a walk-in closet and a spa-inspired bath with soaking tub and double vanity.',
        icon: 'suite',
        photoId: 'primary-suite',
      },
      {
        title: 'Landscaped backyard',
        text: 'Layered plantings, a generous lawn and garden beds frame a private backyard on a 0.32-acre lot.',
        icon: 'yard',
        photoId: 'backyard',
      },
    ],
    facts: [
      {
        title: 'Interior',
        items: [
          { label: 'Bedrooms', value: '4' },
          { label: 'Bathrooms', value: '3 full' },
          { label: 'Living area', value: '2,850 sq ft' },
          { label: 'Primary suite', value: 'Main level' },
          { label: 'Fireplace', value: 'Great room' },
          { label: 'Flooring', value: 'Wide-plank oak, tile in baths' },
          { label: 'Heating & cooling', value: 'Forced air, central air' },
          { label: 'Laundry', value: 'Main-level mudroom' },
        ],
      },
      {
        title: 'Exterior & lot',
        items: [
          { label: 'Lot size', value: '0.32 acres' },
          { label: 'Garage', value: 'Attached, 2 cars' },
          { label: 'Outdoor living', value: 'Covered rear patio, front porch' },
          { label: 'Landscaping', value: 'Lawn, garden beds, shade trees' },
        ],
      },
      {
        title: 'Construction',
        items: [
          { label: 'Year built', value: '2019' },
          { label: 'Style', value: 'Contemporary farmhouse' },
          { label: 'Exterior', value: 'Board-and-batten siding, stone accents' },
          { label: 'Roof', value: 'Architectural shingle, metal accents' },
        ],
      },
      {
        title: 'Community & costs',
        items: [
          { label: 'Community', value: 'Willow Creek Estates' },
          { label: 'HOA', value: '$65 / month' },
          { label: 'Property taxes', value: '$5,100 / year' },
        ],
      },
    ],
    photos: [
      photo('the-willow-house', 'exterior', 'Front of a white contemporary farmhouse with black windows, a cedar porch and a two-car garage at golden hour', 'Front elevation at golden hour', '58% 55%'),
      photo('the-willow-house', 'great-room', 'Vaulted great room with exposed beams, a stone fireplace and tall windows', 'Vaulted great room'),
      photo('the-willow-house', 'kitchen', 'Open kitchen with sage cabinetry, a large white island, pendant lights and bar stools', 'Open kitchen with island'),
      photo('the-willow-house', 'dining', 'Dining area with a wood table, linen chairs and glass doors to the patio', 'Dining area'),
      photo('the-willow-house', 'office', 'Home office with a desk facing a window and built-in shelving', 'Dedicated home office'),
      photo('the-willow-house', 'primary-suite', 'Primary bedroom with an upholstered bed, nightstands and large windows', 'Primary suite'),
      photo('the-willow-house', 'primary-bath', 'Primary bath with a freestanding soaking tub and double vanity', 'Spa-inspired primary bath'),
      photo('the-willow-house', 'patio', 'Covered patio with outdoor sofa, dining table and ceiling fan overlooking the lawn', 'Covered patio'),
      photo('the-willow-house', 'backyard', 'Landscaped backyard with lawn, garden beds and shade trees behind the house', 'Landscaped backyard'),
      photo('the-willow-house', 'exterior-dusk', 'The farmhouse at dusk with warm light glowing in the windows', 'Evening view'),
    ],
    stories: {
      slideSeconds: 5,
      slides: [
        { photoId: 'great-room', kicker: 'Gather', title: 'A vaulted great room', text: 'Exposed beams and a stone fireplace anchor the main living space, with tall windows on either side.' },
        { photoId: 'kitchen', kicker: 'Cook', title: 'An open kitchen built around the island', text: 'Seating for four, open shelving and room for everyone to help with dinner.' },
        { photoId: 'dining', kicker: 'Dine', title: 'Dinners that spill onto the patio', text: 'Wide glass doors connect the dining area to the covered patio.' },
        { photoId: 'office', kicker: 'Work', title: 'A dedicated home office', text: 'Built-in shelving and a desk by the window, away from the busy main rooms.' },
        { photoId: 'primary-suite', kicker: 'Rest', title: 'A spacious primary suite', text: 'A calm main-level retreat with a walk-in closet.' },
        { photoId: 'primary-bath', kicker: 'Unwind', title: 'A spa-inspired bath', text: 'A freestanding soaking tub beneath the window and a double vanity.' },
        { photoId: 'patio', kicker: 'Relax', title: 'Covered patio living', text: 'Outdoor dining and lounging, sheltered from afternoon sun and passing showers.' },
        { photoId: 'backyard', kicker: 'Play', title: 'A landscaped backyard', text: 'A generous lawn framed by garden beds on a third of an acre.' },
      ],
    },
    openHouses: [{ date: upcomingWeekday(6), start: '13:00', end: '15:00', note: 'Sample open house for the demo' }],
    neighborhoodId: 'sample-nashville',
    isFictional: true,
  },
  {
    id: 'the-linden-townhome',
    name: 'The Linden Townhome',
    status: 'New listing',
    headline: 'Easy, low-maintenance living with a rooftop retreat',
    summary: 'A bright modern townhome with an open main level, three bedrooms and a private rooftop terrace.',
    description: [
      'The Linden Townhome offers three levels of light-filled living in the fictional Linden Square community. An open main level connects the kitchen, dining and living areas, with tall windows that brighten the space throughout the day.',
      'Upstairs, the primary bedroom includes a walk-in closet and a dual-sink bath, alongside two additional bedrooms and a full hall bath. A private rooftop terrace provides a quiet spot for morning coffee or evenings outdoors.',
    ],
    price: 449000,
    beds: 3,
    baths: { full: 2, half: 1 },
    interiorSqft: 1920,
    lotAcres: 0.05,
    garageSpaces: 1,
    yearBuilt: 2021,
    style: 'Modern townhome',
    community: 'Linden Square',
    location: { area: 'Nashville, TN', streetAddress: '' },
    hoaMonthly: 210,
    annualTaxes: 3650,
    annualInsurance: 1200,
    highlights: [
      {
        title: 'Private rooftop terrace',
        text: 'An outdoor room above it all, sized for a lounge set and container garden.',
        icon: 'terrace',
        photoId: 'terrace',
      },
      {
        title: 'Open main level',
        text: 'Kitchen, dining and living share one bright, flexible space with tall windows.',
        icon: 'kitchen',
        photoId: 'living',
      },
      {
        title: 'Low-maintenance living',
        text: 'Exterior upkeep and landscaping are covered by the community association.',
        icon: 'sparkle',
      },
    ],
    facts: [
      {
        title: 'Interior',
        items: [
          { label: 'Bedrooms', value: '3' },
          { label: 'Bathrooms', value: '2 full, 1 half' },
          { label: 'Living area', value: '1,920 sq ft' },
          { label: 'Flooring', value: 'Luxury vinyl plank, carpet in bedrooms' },
        ],
      },
      {
        title: 'Exterior & lot',
        items: [
          { label: 'Lot size', value: '0.05 acres' },
          { label: 'Garage', value: 'Attached, 1 car' },
          { label: 'Outdoor living', value: 'Rooftop terrace' },
        ],
      },
      {
        title: 'Construction',
        items: [
          { label: 'Year built', value: '2021' },
          { label: 'Style', value: 'Modern townhome' },
        ],
      },
      {
        title: 'Community & costs',
        items: [
          { label: 'Community', value: 'Linden Square' },
          { label: 'HOA', value: '$210 / month' },
          { label: 'Property taxes', value: '$3,650 / year' },
        ],
      },
    ],
    photos: [
      photo('the-linden-townhome', 'exterior', 'Row of modern three-story townhomes with brick, wood accents and large windows', 'Front exterior', '50% 50%'),
      photo('the-linden-townhome', 'living', 'Open living and kitchen area with tall windows and a sectional sofa', 'Open main level'),
      photo('the-linden-townhome', 'bedroom', 'Primary bedroom with soft linens and a large window', 'Primary bedroom'),
      photo('the-linden-townhome', 'terrace', 'Rooftop terrace with lounge seating, planters and a skyline view at sunset', 'Rooftop terrace'),
    ],
    neighborhoodId: 'sample-nashville',
    isFictional: true,
  },
  {
    id: 'hawthorne-ridge-residence',
    name: 'Hawthorne Ridge Residence',
    status: 'For sale',
    headline: 'Room to spread out, with wooded views',
    summary: 'A spacious five-bedroom transitional home with a chef’s kitchen, screened porch and three-car garage.',
    description: [
      'Hawthorne Ridge Residence sits on three-quarters of an acre backing to mature trees in the fictional Hawthorne Ridge community. A two-story great room with a wall of windows frames the wooded views.',
      'The kitchen is built for cooking and entertaining, with a large center island and walk-in pantry. A screened porch, a finished lower level and a three-car garage give everyone room to spread out.',
    ],
    price: 895000,
    beds: 5,
    baths: { full: 4, half: 1 },
    interiorSqft: 4200,
    lotAcres: 0.74,
    garageSpaces: 3,
    yearBuilt: 2008,
    style: 'Transitional',
    community: 'Hawthorne Ridge',
    location: { area: 'Nashville, TN', streetAddress: '' },
    hoaMonthly: 95,
    annualTaxes: 7300,
    annualInsurance: 2600,
    highlights: [
      {
        title: 'Chef’s kitchen',
        text: 'A large center island, walk-in pantry and generous counter space for cooking together.',
        icon: 'kitchen',
        photoId: 'kitchen',
      },
      {
        title: 'Screened porch',
        text: 'Enjoy the wooded views in comfort from a screened porch off the great room.',
        icon: 'trees',
        photoId: 'porch',
      },
      {
        title: 'Three-car garage',
        text: 'Space for vehicles, bikes and a workshop corner.',
        icon: 'garage',
      },
    ],
    facts: [
      {
        title: 'Interior',
        items: [
          { label: 'Bedrooms', value: '5' },
          { label: 'Bathrooms', value: '4 full, 1 half' },
          { label: 'Living area', value: '4,200 sq ft' },
          { label: 'Lower level', value: 'Finished' },
          { label: 'Fireplace', value: 'Great room' },
        ],
      },
      {
        title: 'Exterior & lot',
        items: [
          { label: 'Lot size', value: '0.74 acres' },
          { label: 'Garage', value: 'Attached, 3 cars' },
          { label: 'Outdoor living', value: 'Screened porch' },
        ],
      },
      {
        title: 'Construction',
        items: [
          { label: 'Year built', value: '2008' },
          { label: 'Style', value: 'Transitional' },
        ],
      },
      {
        title: 'Community & costs',
        items: [
          { label: 'Community', value: 'Hawthorne Ridge' },
          { label: 'HOA', value: '$95 / month' },
          { label: 'Property taxes', value: '$7,300 / year' },
        ],
      },
    ],
    photos: [
      photo('hawthorne-ridge-residence', 'exterior', 'Large two-story transitional home with stone and siding, a three-car garage and mature trees', 'Front exterior', '50% 55%'),
      photo('hawthorne-ridge-residence', 'great-room', 'Two-story great room with a wall of windows facing trees', 'Two-story great room'),
      photo('hawthorne-ridge-residence', 'kitchen', 'Kitchen with navy island, white cabinetry and brass pendant lights', 'Chef’s kitchen'),
      photo('hawthorne-ridge-residence', 'porch', 'Screened porch with wicker seating overlooking woods', 'Screened porch'),
    ],
    neighborhoodId: 'sample-nashville',
    isFictional: true,
  },
];
