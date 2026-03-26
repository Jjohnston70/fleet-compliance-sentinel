import Stripe from 'stripe';

interface StripeCache {
  client: Stripe;
  key: string;
}

const globalForStripe = globalThis as unknown as {
  __stripeCache?: StripeCache;
};

function readStripeSecretKey(): string | null {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  return key && key.length > 0 ? key : null;
}

export function getStripeClient(): Stripe | null {
  const key = readStripeSecretKey();
  if (!key) return null;

  const cached = globalForStripe.__stripeCache;
  if (cached && cached.key === key) {
    return cached.client;
  }

  const client = new Stripe(key, { typescript: true });
  globalForStripe.__stripeCache = { client, key };
  return client;
}
