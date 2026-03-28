// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'development',
  release: process.env.VERCEL_GIT_COMMIT_SHA,

  // Sampling: 100% in dev, reduce in production if needed
  tracesSampleRate: 1,

  // Enable structured logging to Sentry
  enableLogs: true,

  // Do NOT send PII by default — SOC 2 compliance (CC6.1)
  sendDefaultPii: false,
});
