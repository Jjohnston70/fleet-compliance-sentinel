import * as Sentry from '@sentry/nextjs';
import { scrubSentryEvent } from './lib/sentry-scrub';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN,
  environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'development',
  release: process.env.VERCEL_GIT_COMMIT_SHA,
  integrations: [Sentry.replayIntegration()],
  tracesSampleRate: 0.1,
  enableLogs: true,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  sendDefaultPii: false,
  beforeSend(event) {
    return scrubSentryEvent(event) as typeof event;
  },
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
