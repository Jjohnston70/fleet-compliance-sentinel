import { runEnvCheck } from '../scripts/check-env';
import * as Sentry from '@sentry/nextjs';

const STARTUP_CHECK_FLAG = '__chief_env_check_ran__';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config');
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config');
  }

  const g = globalThis as Record<string, unknown>;
  if (g[STARTUP_CHECK_FLAG]) {
    return;
  }

  g[STARTUP_CHECK_FLAG] = true;
  runEnvCheck({ exitOnCritical: false });
}

export const onRequestError = Sentry.captureRequestError;
