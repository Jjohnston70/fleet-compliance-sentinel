import * as Sentry from '@sentry/nextjs';
import { scrubSentryEvent } from './src/lib/sentry-scrub';

Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'development',
  release: process.env.VERCEL_GIT_COMMIT_SHA,
  tracesSampleRate: 0.1,
  beforeSend(event) {
    return scrubSentryEvent(event) as unknown as typeof event;
  },
});
