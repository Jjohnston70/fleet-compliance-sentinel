import { randomUUID } from 'crypto';
import { ensureFleetComplianceTables, insertFleetComplianceRecords, clearFleetComplianceCollection } from '@/lib/fleet-compliance-db';
import { IMPORT_SCHEMAS, type CollectionKey } from '@/lib/fleet-compliance-import-schemas';
import { fleetComplianceAuthErrorResponse, requireFleetComplianceOrgWithRole } from '@/lib/fleet-compliance-auth';
import { auditLog } from '@/lib/audit-logger';
import {
  validateAsset,
  validateDriver,
  validateEmployee,
  validatePermit,
  type FleetComplianceValidationResult,
} from '@/lib/fleet-compliance-validators';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

interface SaveCollectionPayload {
  collection: string;
  rows: Record<string, string>[];
  replace?: boolean;
}

interface SaveRequest {
  collections: SaveCollectionPayload[];
}

export async function POST(request: Request) {
  let userId: string;
  let orgId: string;
  try {
    const authContext = await requireFleetComplianceOrgWithRole(request, 'admin');
    userId = authContext.userId;
    orgId = authContext.orgId;
  } catch (error: unknown) {
    const authResponse = fleetComplianceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: SaveRequest;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.collections || !Array.isArray(body.collections) || body.collections.length === 0) {
    return Response.json({ error: 'collections array is required' }, { status: 400 });
  }

  // Validate all collection keys before writing anything
  for (const item of body.collections) {
    if (!(item.collection in IMPORT_SCHEMAS)) {
      return Response.json(
        { error: `Unknown collection: ${item.collection}. Must be one of: ${Object.keys(IMPORT_SCHEMAS).join(', ')}` },
        { status: 400 }
      );
    }
    if (!Array.isArray(item.rows) || item.rows.length === 0) {
      return Response.json(
        { error: `Collection "${item.collection}" has no rows` },
        { status: 400 }
      );
    }
  }

  const fieldErrors: Array<{ collection: string; rowIndex: number; errors: string[] }> = [];

  for (const item of body.collections) {
    for (const [index, row] of item.rows.entries()) {
      const result = validateCollectionRow(item.collection as CollectionKey, row);
      if (!result.valid) {
        fieldErrors.push({
          collection: item.collection,
          rowIndex: index + 1,
          errors: result.errors,
        });
      }
    }
  }

  if (fieldErrors.length > 0) {
    return Response.json(
      {
        error: 'Validation failed',
        fieldErrors,
      },
      { status: 422 }
    );
  }

  try {
    await ensureFleetComplianceTables();
    const batchId = randomUUID();

    const results: { collection: string; inserted: number; replaced: boolean }[] = [];

    for (const item of body.collections) {
      if (item.replace) {
        const deleted = await clearFleetComplianceCollection(item.collection, orgId);
        auditLog({
          action: 'data.delete',
          userId,
          orgId,
          resourceType: 'fleet-compliance.import',
          metadata: {
            collection: item.collection,
            deletedCount: deleted,
            mode: 'soft-delete',
          },
        });
      }
      const inserted = await insertFleetComplianceRecords(item.collection, item.rows, {
        orgId,
        importedBy: userId,
        importBatchId: batchId,
      });
      results.push({
        collection: item.collection,
        inserted,
        replaced: !!item.replace,
      });
      auditLog({
        action: 'data.write',
        userId,
        orgId,
        resourceType: 'fleet-compliance.import',
        resourceId: batchId,
        metadata: {
          collection: item.collection,
          inserted,
          replaced: !!item.replace,
        },
      });
    }

    const totalInserted = results.reduce((sum, r) => sum + r.inserted, 0);
    auditLog({
      action: 'import.approve',
      userId,
      orgId,
      resourceType: 'fleet-compliance.import',
      resourceId: batchId,
      metadata: {
        collectionCount: results.length,
        rowCount: totalInserted,
      },
    });

    return Response.json({
      status: 'ok',
      orgId,
      totalInserted,
      batchId,
      batch_id: batchId,
      collections: results,
    });
  } catch (err: unknown) {
    console.error('[fleet-compliance-import-save] failed:', err);
    auditLog({
      action: 'import.approve',
      userId,
      orgId,
      resourceType: 'fleet-compliance.import',
      severity: 'error',
      metadata: {
        failed: true,
      },
    });
    return Response.json({ error: 'Save failed' }, { status: 500 });
  }
}

function validateCollectionRow(collection: CollectionKey, row: Record<string, string>): FleetComplianceValidationResult {
  switch (collection) {
    case 'drivers':
      return validateDriver(row);
    case 'assets_master':
    case 'vehicles_equipment':
      return validateAsset(row);
    case 'permits_licenses':
      return validatePermit(row);
    case 'employees':
      return validateEmployee(row);
    default:
      return validateBySchema(collection, row);
  }
}

function validateBySchema(collection: CollectionKey, row: Record<string, string>): FleetComplianceValidationResult {
  const schema = IMPORT_SCHEMAS[collection];
  const errors: string[] = [];

  for (const [field, rules] of Object.entries(schema.fields)) {
    const value = (row[field] ?? '').trim();
    if (rules.required && !value) {
      errors.push(`${field}: required`);
      continue;
    }
    if (!value) continue;

    if (rules.isDate && !isReasonableDate(value)) {
      errors.push(`${field}: must be YYYY-MM-DD`);
    }
    if (rules.isEmail && !EMAIL_RE.test(value)) {
      errors.push(`${field}: invalid email`);
    }
    if (rules.oneOf && !rules.oneOf.includes(value)) {
      errors.push(`${field}: must be one of ${rules.oneOf.join(', ')}`);
    }
  }

  return { valid: errors.length === 0, errors };
}

function isReasonableDate(value: string): boolean {
  if (!DATE_RE.test(value)) return false;
  const parsed = new Date(`${value}T12:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return false;
  if (parsed.toISOString().slice(0, 10) !== value) return false;
  const year = parsed.getUTCFullYear();
  return year >= 1900 && year <= 2100;
}
