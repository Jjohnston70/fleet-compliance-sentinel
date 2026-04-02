import { fleetComplianceAuthErrorResponse, requireFleetComplianceOrgContext } from '@/lib/fleet-compliance-auth';
import { getSQL } from '@/lib/fleet-compliance-db';
import {
  checkTrainingSchema,
  TRAINING_COMPLIANCE_TABLES,
  trainingSchemaNotReadyResponse,
} from '@/lib/training-schema';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    await requireFleetComplianceOrgContext(request);
  } catch (error: unknown) {
    const authResponse = fleetComplianceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sql = getSQL();
  const schemaCheck = await checkTrainingSchema(TRAINING_COMPLIANCE_TABLES, sql);
  if (!schemaCheck.ok) return trainingSchemaNotReadyResponse(schemaCheck);

  return Response.json({
    ok: true,
    message: 'Training schema is ready.',
    requiredTables: schemaCheck.requiredTables,
  });
}
