import type { AgentConfig } from './types.ts';

export const agent: AgentConfig = {
  name: 'John Doe',
  title: 'Real Estate Agent',
  // photo: 'media/agent/headshot-640.webp',
  initials: 'JD',
  intro:
    'John guides buyers through every step of finding a home, from the first showing to the closing table, with clear advice and an easy, unhurried approach.',
  bio: [
    'John Doe is the fictional agent featured in this demo. On a live site, this space introduces the agent in their own words: how they work, the neighborhoods they know best, and what clients can expect.',
    'Every contact button, inquiry form and scheduling link on this page connects directly to the agent on a live site.',
  ],
  specialties: ['First-time buyers', 'Move-up homes', 'New construction'],
  serviceArea: 'Greater St. Louis area',
  languages: ['English'],
  credentials: '',
  contact: {
    // 555-01xx numbers and example.com addresses are reserved for fiction.
    phone: '+13145550142',
    phoneDisplay: '(314) 555-0142',
    sms: '+13145550142',
    email: 'john.doe@example.com',
    schedulingUrl: '',
    websiteUrl: '',
  },
};
