import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

const globalForStripe = globalThis as unknown as { stripe?: Stripe };

export const stripe = globalForStripe.stripe ?? new Stripe(stripeSecretKey, {
  typescript: true,
});

if (process.env.NODE_ENV !== 'production') {
  globalForStripe.stripe = stripe;
}
