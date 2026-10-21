import type { ShowcaseConfig } from './types.ts';
import { site } from './site.ts';
import { branding } from './branding.ts';
import { agent } from './agent.ts';
import { properties } from './properties.ts';
import { neighborhoods } from './neighborhoods.ts';
import { integrations } from './integrations.ts';

export const config: ShowcaseConfig = { site, branding, agent, properties, neighborhoods, integrations };

export { site, branding, agent, properties, neighborhoods, integrations };
export type * from './types.ts';
