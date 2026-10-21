import type { Neighborhood, Place, PlaceCategory } from './types.ts';

/**
 * Illustrative places for the demo. Every marker is labeled as a sample, does not
 * represent a real business and has directions disabled. For a customer site,
 * replace with real nearby places, set `isSample: false` and add `home` coordinates.
 */
function sample(id: string, name: string, category: PlaceCategory, lat: number, lng: number, description: string): Place {
  return { id, name, category, lat, lng, description, sample: true };
}

export const neighborhoods: Neighborhood[] = [
  {
    id: 'sample-nashville',
    title: 'Sample neighborhood explorer',
    intro:
      'A general look at the Nashville area. The homes in this demo are fictional, so no home location is shown, and every marker below is an illustrative placeholder rather than a real business or school.',
    isSample: true,
    center: { lat: 36.146, lng: -86.802 },
    zoom: 11,
    places: [
      sample('r1', 'Sample Bistro', 'restaurants', 36.168, -86.842, 'Placeholder for a neighborhood restaurant.'),
      sample('r2', 'Sample Café & Bakery', 'restaurants', 36.131, -86.772, 'Placeholder for a coffee shop or bakery.'),
      sample('r3', 'Sample Wood-Fired Kitchen', 'restaurants', 36.191, -86.756, 'Placeholder for a casual dinner spot.'),
      sample('g1', 'Sample Neighborhood Market', 'groceries', 36.155, -86.885, 'Placeholder for a full-service grocery store.'),
      sample('g2', 'Sample Organic Grocer', 'groceries', 36.104, -86.818, 'Placeholder for a specialty grocer.'),
      sample('g3', 'Sample Farmers Market', 'groceries', 36.177, -86.722, 'Placeholder for a seasonal market.'),
      sample('p1', 'Sample Community Park', 'parks', 36.121, -86.852, 'Placeholder for a park with trails and playgrounds.'),
      sample('p2', 'Sample Greenway Trailhead', 'parks', 36.203, -86.835, 'Placeholder for a walking and biking trail.'),
      sample('p3', 'Sample Lakeside Park', 'parks', 36.086, -86.874, 'Placeholder for a park with open water.'),
      sample('s1', 'Sample Elementary School', 'schools', 36.160, -86.806, 'Placeholder for a nearby elementary school.'),
      sample('s2', 'Sample Middle School', 'schools', 36.117, -86.744, 'Placeholder for a nearby middle school.'),
      sample('s3', 'Sample High School', 'schools', 36.196, -86.880, 'Placeholder for a nearby high school.'),
      sample('h1', 'Sample Family Clinic', 'healthcare', 36.148, -86.736, 'Placeholder for a primary-care clinic.'),
      sample('h2', 'Sample Urgent Care', 'healthcare', 36.096, -86.770, 'Placeholder for an urgent-care center.'),
      sample('h3', 'Sample Pharmacy', 'healthcare', 36.182, -86.905, 'Placeholder for a neighborhood pharmacy.'),
    ],
  },
];
