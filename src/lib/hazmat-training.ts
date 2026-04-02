import type { TrainingModuleMetadata } from '@/lib/training-module-metadata';
import { getTrainingModuleMetadata } from '@/lib/training-module-metadata';

export const MAX_CERT_UPLOAD_BYTES = 10 * 1024 * 1024;
export const HAZMAT_MODULE_CODE_REGEX = /^(TNDS-HZ-\d{3}[a-d]?|NFPA-(AW|OP)-\d{2}|PHMSA-GRANT)$/;

export type HazmatRecordStatus = 'not_started' | 'in_progress' | 'complete' | 'delinquent';

export function normalizeModuleCode(value: string): string {
  return value.trim().toUpperCase();
}

export function isValidHazmatModuleCode(value: string): boolean {
  return HAZMAT_MODULE_CODE_REGEX.test(normalizeModuleCode(value));
}

export function normalizeIsoDateInput(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const raw = String(value).trim();
  if (!raw) return null;
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

export function toIsoDateOnly(value: unknown): string {
  if (!value) return '';
  const raw = String(value);
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toISOString().slice(0, 10);
}

export function computeNextDueDate(completionDateIso: string, recurrenceCycleYears: number): string {
  const completionDate = new Date(completionDateIso);
  const nextDue = new Date(completionDate);
  nextDue.setFullYear(nextDue.getFullYear() + recurrenceCycleYears);
  return nextDue.toISOString();
}

export function resolveModuleFallback(moduleCode: string): TrainingModuleMetadata {
  return getTrainingModuleMetadata(normalizeModuleCode(moduleCode));
}

export function dueWindowDays(nextDueDate: unknown): number | null {
  const iso = normalizeIsoDateInput(nextDueDate);
  if (!iso) return null;
  const now = Date.now();
  const due = new Date(iso).getTime();
  return Math.ceil((due - now) / (24 * 60 * 60 * 1000));
}
