/**
 * Public site copy — update `contactEmail` to a real inbox you monitor
 * (Stripe and users may use it).
 */
export const SITE = {
  name: 'Rize',
  legalEntity: 'Rize', // Short product name; adjust if you register a legal entity later
  contactEmail: 'hello@rize.app',
  tagline: 'A gentle coach in your pocket — mornings, habits, and your day in one calm place.',
  /** Store URLs — replace with real links when listing is live. */
  appStoreUrl: '#',
  googlePlayUrl: '#',
  /** Social proof — use real data when available. */
  appStoreRating: '4.8',
  socialProof: "Finally an app that doesn't shame me for missing a day.",
} as const
