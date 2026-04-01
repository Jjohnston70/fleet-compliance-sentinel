export type AuditAction =
  | 'data.read'
  | 'data.write'
  | 'data.delete'
  | 'data.restore'
  | 'import.upload'
  | 'import.approve'
  | 'import.reject'
  | 'import.rollback'
  | 'auth.login'
  | 'auth.logout'
  | 'auth.failed'
  | 'cron.run'
  | 'cron.failed'
  | 'penny.query'
  | 'ai.usage.recorded'
  | 'budget.alert'
  | 'admin.action'
  | 'rate_limit.exceeded';

type AuditSeverity = 'info' | 'warn' | 'error';
type AuditMetadata = Record<string, string | number | boolean>;

const REDACTED_METADATA_KEYS = new Set([
  'name',
  'drivername',
  'email',
  'ssn',
  'dob',
  'medicalcard',
  'licensenumber',
  'address',
]);

const REDACTED_METADATA_KEY_MATCHERS = [
  'primarycontact',
  'contactemail',
  'contactphone',
  'email',
  'phone',
  'ssn',
  'dob',
  'address',
  'licensenumber',
  'medicalcard',
  'drivername',
  'firstname',
  'lastname',
  'fullname',
];

function normalizeKey(key: string): string {
  return key.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function sanitize(metadata?: AuditMetadata): AuditMetadata | undefined {
  if (!metadata) return undefined;

  const sanitized: AuditMetadata = {};
  for (const [rawKey, value] of Object.entries(metadata)) {
    const key = rawKey.trim();
    if (!key) continue;
    const normalized = normalizeKey(key);
    if (REDACTED_METADATA_KEYS.has(normalized)) continue;
    if (REDACTED_METADATA_KEY_MATCHERS.some((matcher) => normalized.includes(matcher))) continue;
    sanitized[key] = value;
  }

  return Object.keys(sanitized).length > 0 ? sanitized : undefined;
}

export function auditLog(event: {
  action: AuditAction;
  userId: string;
  orgId: string;
  resourceType?: string;
  resourceId?: string;
  metadata?: AuditMetadata;
  severity?: AuditSeverity;
}): void {
  const payload = {
    timestamp: new Date().toISOString(),
    action: event.action,
    userId: event.userId,
    orgId: event.orgId,
    resourceType: event.resourceType ?? null,
    resourceId: event.resourceId ?? null,
    metadata: sanitize(event.metadata) ?? null,
    severity: event.severity ?? 'info',
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'unknown',
  };

  console.log(JSON.stringify(payload));
}
