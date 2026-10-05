/**
 * Service content for the Cosmic Navigator.
 * Rendering components read from here; no copy is hard-coded in components.
 * Claims are limited to the content directions supplied by the client.
 */

export type ServiceId = 'order' | 'comply' | 'grow' | 'fund';

export interface Service {
  id: ServiceId;
  index: '01' | '02' | '03' | '04';
  /** Direction label, e.g. ORDER */
  category: string;
  /** Service name, e.g. Accounting */
  name: string;
  /** Short line used on nodes and the journey. */
  tagline: string;
  /** One-line hook used in the hover panel and explorer. */
  hook: string;
  /** Detail-state headline. */
  headline: string;
  lead: string;
  capabilities: string[];
  cta: string;
  /** Pre-filled WhatsApp message. */
  whatsappMessage: string;
}

export const services: Service[] = [
  {
    id: 'order',
    index: '01',
    category: 'Order',
    name: 'Accounting',
    tagline: 'Know your numbers.',
    hook: 'Clear records, reconciled accounts and reports you can act on.',
    headline: 'Know exactly where your business stands.',
    lead: 'Cosmic can support businesses with:',
    capabilities: [
      'Monthly bookkeeping',
      'Bank reconciliation',
      'Profit & loss',
      'Balance sheet',
      'GST-ready records',
      'Year-end financial preparation',
    ],
    cta: 'Get an accounting quotation',
    whatsappMessage: "Hi Cosmic, I'd like a quotation for accounting support.",
  },
  {
    id: 'comply',
    index: '02',
    category: 'Comply',
    name: 'Corporate Secretary',
    tagline: 'Stay compliant.',
    hook: 'Filings, meetings and statutory admin handled on time.',
    headline: 'Stay compliant without the runaround.',
    lead: 'Cosmic can support businesses with:',
    capabilities: [
      'Annual filings',
      'AGM support',
      'Corporate compliance',
      'Statutory administration',
      'Ongoing corporate secretary support',
    ],
    cta: 'Get a corporate secretary quotation',
    whatsappMessage: "Hi Cosmic, I'd like to discuss corporate secretary support.",
  },
  {
    id: 'grow',
    index: '03',
    category: 'Grow',
    name: 'Singapore Grants',
    tagline: 'Find opportunities.',
    hook: 'Find opportunities beyond your balance sheet.',
    headline: 'Find opportunities worth exploring.',
    lead: 'Cosmic can support businesses with:',
    capabilities: [
      'Grant discovery',
      'Eligibility guidance',
      'Application support',
      'Funding opportunity navigation',
    ],
    cta: 'Explore grant opportunities',
    whatsappMessage: "Hi Cosmic, I'd like to explore Singapore grants for my business.",
  },
  {
    id: 'fund',
    index: '04',
    category: 'Fund',
    name: 'SME Business Loans',
    tagline: 'Finance the next step.',
    hook: 'Financing options matched to where your business is heading.',
    headline: 'Finance the next step.',
    lead: 'Cosmic can support businesses with:',
    capabilities: ['Working capital', 'Business financing', 'Growth financing', 'Funding guidance'],
    cta: 'Discuss business financing',
    whatsappMessage: "Hi Cosmic, I'd like to discuss SME business loan options.",
  },
];

export const serviceById = Object.fromEntries(services.map((s) => [s.id, s])) as Record<
  ServiceId,
  Service
>;

export const audiences = [
  { label: 'Startups', note: 'Setting up the right foundations early.' },
  { label: 'Growing SMEs', note: 'Keeping order while the business scales.' },
  { label: 'Established businesses', note: 'Staying compliant and well-funded.' },
  { label: 'Business owners', note: 'One contact instead of five.' },
  { label: 'Companies navigating a new stage', note: 'Expansion, restructuring, or a new direction.' },
];

export const reasons = [
  { title: 'Singapore-based', body: 'Local context for Singapore businesses, filings and funding.' },
  { title: 'Built for SMEs', body: 'Support shaped around how small and medium businesses actually run.' },
  { title: 'One contact', body: 'Accounting, compliance, grants and loans through one relationship.' },
  { title: 'Practical guidance', body: 'Clear next steps rather than reports you have to decode.' },
  { title: 'Clear support', body: 'You know what is being handled and what is needed from you.' },
  { title: 'Business-focused', body: 'The work serves where your business needs to go next.' },
];
