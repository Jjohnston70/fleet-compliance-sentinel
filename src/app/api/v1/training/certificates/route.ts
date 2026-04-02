import { fleetComplianceAuthErrorResponse, requireFleetComplianceOrgContext } from '@/lib/fleet-compliance-auth';
import { auditLog } from '@/lib/audit-logger';
import { getOrganizationName, getSQL } from '@/lib/fleet-compliance-db';
import { certificateFileExists, generateTrainingCertificate, readTrainingCertificateBuffer } from '@/lib/training-certificate';
import { getTrainingModuleMetadata } from '@/lib/training-module-metadata';
import {
  checkTrainingSchema,
  TRAINING_COMPLIANCE_TABLES,
  trainingSchemaNotReadyResponse,
} from '@/lib/training-schema';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  let userId: string;
  let orgId: string;
  let role: 'admin' | 'member';
  try {
    ({ userId, orgId, role } = await requireFleetComplianceOrgContext(request));
  } catch (error: unknown) {
    const authResponse = fleetComplianceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const moduleCode = (searchParams.get('module_code') || '').trim();
  const requestedEmployeeId = (searchParams.get('employee_id') || '').trim();
  const employeeId = requestedEmployeeId || userId;

  if (!moduleCode || !/^TNDS-HZ-\d{3}[a-d]?$/.test(moduleCode)) {
    return Response.json({ error: 'module_code is required' }, { status: 400 });
  }
  if (role !== 'admin' && employeeId !== userId) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const sql = getSQL();
  const schemaCheck = await checkTrainingSchema(TRAINING_COMPLIANCE_TABLES, sql);
  if (!schemaCheck.ok) return trainingSchemaNotReadyResponse(schemaCheck);
  const recordRows = await sql`
    SELECT id, employee_name, certificate_url, completion_date
    FROM hazmat_training_records
    WHERE org_id = ${orgId}
      AND employee_id = ${employeeId}
      AND module_code = ${moduleCode}
    LIMIT 1
  `;
  if (recordRows.length === 0) {
    return Response.json({ error: 'Certificate record not found' }, { status: 404 });
  }

  const record = recordRows[0];
  const completionDate = String(record.completion_date || new Date().toISOString()).slice(0, 10);
  const certificateUrl = String(record.certificate_url || `/${orgId}/training-certs/${employeeId}/${moduleCode}_${completionDate}.pdf`);
  if (!record.certificate_url) {
    await sql`
      UPDATE hazmat_training_records
      SET certificate_url = ${certificateUrl},
          certificate_uploaded_at = NOW(),
          updated_at = NOW()
      WHERE id = ${record.id}
    `;
  }

  const moduleMeta = getTrainingModuleMetadata(moduleCode);
  const scoreRows = await sql`
    SELECT tp.assessment_score
    FROM training_progress tp
    JOIN training_assignments ta ON ta.id = tp.assignment_id
    WHERE ta.org_id = ${orgId}
      AND ta.employee_id = ${employeeId}
      AND tp.module_code = ${moduleCode}
      AND tp.assessment_score IS NOT NULL
    ORDER BY tp.updated_at DESC
    LIMIT 1
  `;
  const scorePercentage = scoreRows.length > 0 ? Number(scoreRows[0].assessment_score) : null;
  const orgName = await getOrganizationName(orgId) || process.env.FLEET_COMPLIANCE_ORG_NAME || orgId;
  const employeeName = String(record.employee_name || employeeId);
  const certificateId = String(record.id);

  const exists = await certificateFileExists(certificateUrl);
  if (!exists) {
    await generateTrainingCertificate({
      certificateId,
      orgName,
      orgId,
      employeeId,
      employeeName,
      moduleCode,
      moduleTitle: moduleMeta.title,
      completionDate,
      scorePercentage,
      cfrReference: moduleMeta.cfrReference,
      phmsaEquivalent: moduleMeta.phmsaEquivalent,
      certificateUrl,
    });
  }

  const pdf = await readTrainingCertificateBuffer(certificateUrl);
  if (!pdf) {
    return Response.json({ error: 'Certificate file unavailable' }, { status: 500 });
  }

  auditLog({
    action: 'data.read',
    userId,
    orgId,
    resourceType: 'training.certificate',
    metadata: {
      moduleCode,
      employeeId,
      role,
    },
  });

  const safeModule = moduleCode.replace(/[^A-Za-z0-9.-]/g, '_');
  const safeDate = completionDate.replace(/[^0-9-]/g, '');
  const fileName = `${safeModule}_${safeDate}.pdf`;
  return new Response(new Uint8Array(pdf), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${fileName}"`,
      'Cache-Control': 'private, max-age=0, must-revalidate',
    },
  });
}
