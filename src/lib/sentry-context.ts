import * as Sentry from '@sentry/nextjs';

export function setSentryRequestContext(userId: string, orgId: string) {
  Sentry.setUser({ id: userId });
  Sentry.setTag('orgId', orgId);
}

