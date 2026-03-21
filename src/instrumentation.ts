import { runEnvCheck } from '../scripts/check-env';

const STARTUP_CHECK_FLAG = '__chief_env_check_ran__';

export async function register() {
  const g = globalThis as Record<string, unknown>;
  if (g[STARTUP_CHECK_FLAG]) {
    return;
  }

  g[STARTUP_CHECK_FLAG] = true;
  runEnvCheck({ exitOnCritical: false });
}
