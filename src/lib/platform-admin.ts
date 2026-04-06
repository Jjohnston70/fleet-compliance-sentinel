/**
 * Platform admin identity resolution.
 *
 * Preferred config:
 *   FLEET_PLATFORM_ADMIN_USER_IDS="user_xxx,user_yyy"
 *
 * Backward compatibility:
 *   PLATFORM_ADMIN_USER_IDS="user_xxx,user_yyy"
 *
 * If neither env var is set, fall back to legacy hardcoded ID so existing
 * deployments do not lose access unexpectedly.
 */
const LEGACY_PLATFORM_ADMIN_IDS = new Set<string>([
  // Jacob Johnston (legacy fallback)
  'user_2stXa9LWIFKFCMlkBsfVGoZLhgK',
]);

function parseIdList(raw: string | undefined): Set<string> {
  if (!raw) return new Set<string>();
  return new Set(
    raw
      .split(',')
      .map((value) => value.trim())
      .filter((value) => value.length > 0),
  );
}

function getConfiguredPlatformAdminIds(): Set<string> {
  const preferred = parseIdList(process.env.FLEET_PLATFORM_ADMIN_USER_IDS);
  if (preferred.size > 0) return preferred;

  const legacyEnv = parseIdList(process.env.PLATFORM_ADMIN_USER_IDS);
  if (legacyEnv.size > 0) return legacyEnv;

  return LEGACY_PLATFORM_ADMIN_IDS;
}

export function isPlatformAdminUser(userId: string | null | undefined): boolean {
  if (typeof userId !== 'string' || userId.trim().length === 0) return false;
  return getConfiguredPlatformAdminIds().has(userId.trim());
}
