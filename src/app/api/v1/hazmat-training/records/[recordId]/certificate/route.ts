import {
  fleetComplianceAuthErrorResponse,
  requireFleetComplianceOrgWithRole,
} from '@/lib/fleet-compliance-auth';
import { auditLog } from '@/lib/audit-logger';
import { getSQL } from '@/lib/fleet-compliance-db';
import { MAX_CERT_UPLOAD_BYTES, toIsoDateOnly } from '@/lib/hazmat-training';
import { persistTrainingCertificateBuffer } from '@/lib/training-certificate';
import {
  checkTrainingSchema,
  TRAINING_COMPLIANCE_TABLES,
  trainingSchemaNotReadyResponse,
} from '@/lib/training-schema';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function sanitizeModuleCode(value: string): string {
  return value.replace(/[^A-Za-z0-9-]/g, '_');
}

function parseCertificateDate(value: unknown): string {
  const iso = toIsoDateOnly(value);
  if (iso) return iso;
  return new Date().toISOString().slice(0, 10);
}

function extractPdfUpload(file: FormDataEntryValue | null): File | null {
  if (!file || typeof file === 'string') return null;
  return file as File;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ recordId: string }> },
) {
  let userId: string;
  let orgId: string;
  try {
    ({ userId, orgId } = await requireFleetComplianceOrgWithRole(request, 'admin'));
  } catch (error: unknown) {
    const authResponse = fleetComplianceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { recordId } = await params;
  const normalizedRecordId = recordId.trim();
  if (!normalizedRecordId) {
    return Response.json({ error: 'record_id is required' }, { status: 400 });
  }

  const contentType = request.headers.get('content-type') ?? '';
  if (!contentType.includes('multipart/form-data')) {
    return Response.json({ error: 'Expected multipart/form-data' }, { status: 400 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: 'Could not parse form data' }, { status: 400 });
  }

  const upload = extractPdfUpload(formData.get('file'));
  if (!upload) {
    return Response.json({ error: 'file is required' }, { status: 422 });
  }
  if (upload.size > MAX_CERT_UPLOAD_BYTES) {
    return Response.json({ error: 'Certificate exceeds 10 MB limit' }, { status: 413 });
  }

  const lowerName = upload.name.toLowerCase();
  const lowerType = upload.type.toLowerCase();
  if (!lowerName.endsWith('.pdf') && lowerType !== 'application/pdf') {
    return Response.json({ error: 'Only PDF certificates are accepted' }, { status: 422 });
  }

  const sql = getSQL();
  const schemaCheck = await checkTrainingSchema(TRAINING_COMPLIANCE_TABLES, sql);
  if (!schemaCheck.ok) return trainingSchemaNotReadyResponse(schemaCheck);

  const recordRows = await sql`
    SELECT id, employee_id, module_code, completion_date
    FROM hazmat_training_records
    WHERE id = ${normalizedRecordId}
      AND org_id = ${orgId}
    LIMIT 1
  `;
  if (recordRows.length === 0) {
    return Response.json({ error: 'Record not found' }, { status: 404 });
  }

  const record = recordRows[0];
  const employeeId = String(record.employee_id || '');
  const moduleCode = String(record.module_code || '');
  const datePart = parseCertificateDate(record.completion_date);
  const certificateUrl = `/${orgId}/hazmat-certs/${employeeId}/${sanitizeModuleCode(moduleCode)}_${datePart}.pdf`;

  const fileBuffer = Buffer.from(await upload.arrayBuffer());
  const stored = await persistTrainingCertificateBuffer(certificateUrl, fileBuffer);

  await sql.transaction((tx) => [
    tx`
      UPDATE hazmat_training_records
      SET certificate_url = ${certificateUrl},
          certificate_uploaded_at = NOW(),
          updated_at = NOW()
      WHERE id = ${normalizedRecordId}
        AND org_id = ${orgId}
    `,
    tx`
      UPDATE training_progress tp
      SET certificate_url = ${certificateUrl},
          updated_at = NOW()
      FROM training_assignments ta
      WHERE tp.assignment_id = ta.id
        AND ta.org_id = ${orgId}
        AND ta.employee_id = ${employeeId}
        AND tp.module_code = ${moduleCode}
    `,
  ]);

  auditLog({
    action: 'data.write',
    userId,
    orgId,
    resourceType: 'hazmat-training.certificate_upload',
    metadata: {
      recordId: normalizedRecordId,
      employeeId,
      moduleCode,
      certificateUrl,
      sizeBytes: stored.sizeBytes,
    },
  });

  return Response.json({
    ok: true,
    record_id: normalizedRecordId,
    certificate_url: certificateUrl,
    size_bytes: stored.sizeBytes,
    uploaded_at: new Date().toISOString(),
  }, { status: 201 });
}
