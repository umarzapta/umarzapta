/**
 * Site-level configuration. Real contact details come from environment
 * variables (see .env.example). Nothing is invented: when a value is not
 * configured the UI falls back to a clearly marked placeholder or hides it.
 */

export const PLACEHOLDER_NUMBER = 'REPLACE_WITH_BUSINESS_NUMBER';

const env = import.meta.env;

export const site = {
  name: 'Cosmic Division',
  legalName: 'Cosmic Division Pte. Ltd.',
  location: 'Singapore',
  whatsappNumber: (env.PUBLIC_WHATSAPP_NUMBER || '').replace(/\D/g, '') || PLACEHOLDER_NUMBER,
  phone: env.PUBLIC_PHONE || '',
  email: env.PUBLIC_EMAIL || '',
  nav: [
    { label: 'Services', href: '#services' },
    { label: 'About', href: '#about' },
  ],
  contactHref: '#contact',
};

export const hasWhatsApp = site.whatsappNumber !== PLACEHOLDER_NUMBER;

/**
 * Builds a wa.me deep link. When no number is configured the link routes to
 * the contact section so the prototype never ships a dead external link.
 */
export function whatsappHref(message?: string): string {
  if (!hasWhatsApp) return site.contactHref;
  const base = `https://wa.me/${site.whatsappNumber}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export const copy = {
  hero: {
    eyebrow: 'Cosmic Navigator',
    headline: ['Where does', 'your business', 'need to go?'],
    support: 'Choose a direction and discover how Cosmic can help your business move forward.',
    primary: 'Talk to Cosmic',
    secondary: 'Explore services',
  },
  journey: {
    headline: 'Every business has a next step.',
    support: 'Different moments require different kinds of support.',
  },
  explorer: {
    headline: 'What can we help you move forward?',
  },
  audiences: {
    eyebrow: 'Who we work with',
    headline: 'Built for businesses at every stage.',
  },
  why: {
    eyebrow: 'Why Cosmic',
    headline: 'Practical support, one point of contact.',
  },
  finalCta: {
    headline: 'Not sure where to start?',
    support:
      "You don't need to know exactly what you need. Tell us what's happening in your business and we'll help you find the right direction.",
    primary: 'Talk to Cosmic',
    secondary: 'Explore services',
  },
};
