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
    id: 'sample-st-louis',
    title: 'Sample neighborhood explorer',
    intro:
      'A general look at the St. Louis area. The homes in this demo are fictional, so no home location is shown, and every marker below is an illustrative placeholder rather than a real business or school.',
    isSample: true,
    center: { lat: 38.628, lng: -90.335 },
    zoom: 11,
    places: [
      sample('r1', 'Sample Bistro', 'restaurants', 38.652, -90.381, 'Placeholder for a neighborhood restaurant.'),
      sample('r2', 'Sample Café & Bakery', 'restaurants', 38.611, -90.297, 'Placeholder for a coffee shop or bakery.'),
      sample('r3', 'Sample Wood-Fired Kitchen', 'restaurants', 38.676, -90.322, 'Placeholder for a casual dinner spot.'),
      sample('g1', 'Sample Neighborhood Market', 'groceries', 38.637, -90.405, 'Placeholder for a full-service grocery store.'),
      sample('g2', 'Sample Organic Grocer', 'groceries', 38.594, -90.351, 'Placeholder for a specialty grocer.'),
      sample('g3', 'Sample Farmers Market', 'groceries', 38.661, -90.271, 'Placeholder for a seasonal market.'),
      sample('p1', 'Sample Community Park', 'parks', 38.622, -90.361, 'Placeholder for a park with trails and playgrounds.'),
      sample('p2', 'Sample Greenway Trailhead', 'parks', 38.689, -90.371, 'Placeholder for a walking and biking trail.'),
      sample('p3', 'Sample Lakeside Park', 'parks', 38.579, -90.414, 'Placeholder for a park with open water.'),
      sample('s1', 'Sample Elementary School', 'schools', 38.646, -90.344, 'Placeholder for a nearby elementary school.'),
      sample('s2', 'Sample Middle School', 'schools', 38.603, -90.391, 'Placeholder for a nearby middle school.'),
      sample('s3', 'Sample High School', 'schools', 38.668, -90.418, 'Placeholder for a nearby high school.'),
      sample('h1', 'Sample Family Clinic', 'healthcare', 38.631, -90.287, 'Placeholder for a primary-care clinic.'),
      sample('h2', 'Sample Urgent Care', 'healthcare', 38.586, -90.302, 'Placeholder for an urgent-care center.'),
      sample('h3', 'Sample Pharmacy', 'healthcare', 38.655, -90.437, 'Placeholder for a neighborhood pharmacy.'),
    ],
  },
];
