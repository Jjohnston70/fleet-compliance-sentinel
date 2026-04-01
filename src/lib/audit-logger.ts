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
const MAX_REDACTION_DEPTH = 5;
const MAX_ARRAY_ITEMS = 25;
const MAX_STRING_CHARS = 1_000;

function normalizeKey(key: string): string {
  return key.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}

function shouldRedactKey(rawKey: string): boolean {
  const normalized = normalizeKey(rawKey);
  if (REDACTED_METADATA_KEYS.has(normalized)) return true;
  return REDACTED_METADATA_KEY_MATCHERS.some((matcher) => normalized.includes(matcher));
}

export function sanitize(metadata?: AuditMetadata): AuditMetadata | undefined {
  if (!metadata) return undefined;

  const sanitized: AuditMetadata = {};
  for (const [rawKey, value] of Object.entries(metadata)) {
    const key = rawKey.trim();
    if (!key) continue;
    if (shouldRedactKey(key)) continue;
    sanitized[key] = value;
  }

  return Object.keys(sanitized).length > 0 ? sanitized : undefined;
}

export function redactAuditValue(value: unknown, depth = 0): unknown {
  if (value === null || value === undefined) return value;
  if (depth >= MAX_REDACTION_DEPTH) return '[REDACTED_DEPTH_LIMIT]';

  if (typeof value === 'string') {
    if (value.length <= MAX_STRING_CHARS) return value;
    return `${value.slice(0, MAX_STRING_CHARS)}...[TRUNCATED]`;
  }
  if (typeof value === 'number' || typeof value === 'boolean') return value;
  if (Array.isArray(value)) {
    return value.slice(0, MAX_ARRAY_ITEMS).map((entry) => redactAuditValue(entry, depth + 1));
  }
  if (typeof value === 'object') {
    const output: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      if (shouldRedactKey(key)) {
        output[key] = '[REDACTED]';
        continue;
      }
      output[key] = redactAuditValue(nested, depth + 1);
    }
    return output;
  }
  return String(value);
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
