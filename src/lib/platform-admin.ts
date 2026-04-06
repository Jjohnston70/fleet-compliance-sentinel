const PLATFORM_ADMIN_IDS = new Set<string>([
  // Jacob Johnston
  'user_2stXa9LWIFKFCMlkBsfVGoZLhgK',
]);

export function isPlatformAdminUser(userId: string | null | undefined): boolean {
  if (typeof userId !== 'string' || userId.trim().length === 0) return false;
  return PLATFORM_ADMIN_IDS.has(userId.trim());
}

