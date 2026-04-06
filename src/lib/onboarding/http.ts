import type { OnboardingEmployeeInput } from '@/lib/onboarding/types';

function optionalString(value: unknown, maxLength = 255): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, maxLength);
}

function optionalDate(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10);
}

function bool(value: unknown): boolean {
  return value === true || value === 'true' || value === 1 || value === '1';
}

function asObject(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

export function toOnboardingEmployeeInput(payload: unknown): OnboardingEmployeeInput {
  const source = asObject(payload);
  return {
    externalEmployeeId: optionalString(source.externalEmployeeId, 128),
    clerkUserId: optionalString(source.clerkUserId, 128),
    firstName: optionalString(source.firstName, 160) || '',
    lastName: optionalString(source.lastName, 160) || '',
    workEmail: optionalString(source.workEmail, 320),
    department: optionalString(source.department, 160),
    jobTitle: optionalString(source.jobTitle, 160),
    hireDate: optionalDate(source.hireDate),
    status: optionalString(source.status, 64) || 'active',
    isDriver: bool(source.isDriver),
    hazmatRequired: bool(source.hazmatRequired),
    hazmatEndorsement: optionalString(source.hazmatEndorsement, 64),
    cdlClass: optionalString(source.cdlClass, 16),
    cdlExpiration: optionalDate(source.cdlExpiration),
    medicalExpiration: optionalDate(source.medicalExpiration),
    metadata: asObject(source.metadata),
  };
}

export function readIdempotencyKey(request: Request): string | null {
  const direct = request.headers.get('Idempotency-Key');
  if (direct && direct.trim()) return direct.trim().slice(0, 255);
  const legacy = request.headers.get('X-Idempotency-Key');
  if (legacy && legacy.trim()) return legacy.trim().slice(0, 255);
  return null;
}

export function isPgUniqueViolation(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const code = (error as { code?: unknown }).code;
  return typeof code === 'string' && code === '23505';
}
