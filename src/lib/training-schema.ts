import type { NeonQueryFunction } from '@neondatabase/serverless';
import { getSQL } from '@/lib/fleet-compliance-db';

export const TRAINING_CORE_TABLES = [
  'training_plans',
  'training_assignments',
  'training_progress',
] as const;

export const TRAINING_COMPLIANCE_TABLES = [
  ...TRAINING_CORE_TABLES,
  'hazmat_training_records',
  'training_certificate_files',
] as const;

type TrainingTableName = (typeof TRAINING_COMPLIANCE_TABLES)[number];

interface TrainingSchemaCheck {
  ok: boolean;
  requiredTables: TrainingTableName[];
  missingTables: TrainingTableName[];
}

type SqlClient = NeonQueryFunction<false, false>;

function buildProjection(requiredTables: readonly TrainingTableName[]): string {
  return requiredTables
    .map((tableName) => `to_regclass('public.${tableName}') IS NOT NULL AS "${tableName}"`)
    .join(', ');
}

export async function checkTrainingSchema(
  requiredTables: readonly TrainingTableName[] = TRAINING_CORE_TABLES,
  sql: SqlClient = getSQL(),
): Promise<TrainingSchemaCheck> {
  const deduped = Array.from(new Set(requiredTables));
  const projection = buildProjection(deduped);
  const rows = await sql.query(`SELECT ${projection}`);
  const row = (rows[0] || {}) as Record<string, unknown>;
  const missingTables = deduped.filter((tableName) => row[tableName] !== true);

  return {
    ok: missingTables.length === 0,
    requiredTables: deduped,
    missingTables,
  };
}

export function trainingSchemaNotReadyResponse(check: TrainingSchemaCheck): Response {
  return Response.json(
    {
      error: 'TRAINING_SCHEMA_NOT_READY',
      message: 'Training schema is not fully deployed. Run database migrations before using training APIs.',
      requiredTables: check.requiredTables,
      missingTables: check.missingTables,
    },
    { status: 503 },
  );
}
