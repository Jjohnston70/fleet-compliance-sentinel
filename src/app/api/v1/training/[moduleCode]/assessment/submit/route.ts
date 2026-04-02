import { currentUser } from '@clerk/nextjs/server';
import { fleetComplianceAuthErrorResponse, requireFleetComplianceOrg } from '@/lib/fleet-compliance-auth';
import { auditLog } from '@/lib/audit-logger';
import {
  getOrganizationName,
  getOrganizationPrimaryContact,
  getSQL,
} from '@/lib/fleet-compliance-db';
import { generateTrainingCertificate } from '@/lib/training-certificate';
import { getTrainingModuleMetadata } from '@/lib/training-module-metadata';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface SubmitBody {
  answers: Record<string, string>;
  score: number;
  total: number;
  percentage: number;
  passed: boolean;
}

function isValidEmail(value: string | null | undefined): value is string {
  if (!value) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function sendTrainingCompletionEmail(input: {
  adminEmail: string;
  employeeName: string;
  employeeId: string;
  moduleCode: string;
  moduleTitle: string;
  cfrReference: string;
  scorePercentage: number;
  completionDate: string;
  certificateUrl: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const fromAddress = process.env.FLEET_COMPLIANCE_ALERT_FROM_EMAIL || 'compliance@fleetcompliance.com';
  const orgName = process.env.FLEET_COMPLIANCE_ORG_NAME || 'Fleet Compliance';
  const subject = `[Fleet-Compliance] Training completed: ${input.moduleCode} (${input.employeeName})`;
  const html = `<!DOCTYPE html>
<html lang="en">
<body style="font-family:system-ui,sans-serif;background:#f8fafc;margin:0;padding:20px;">
  <div style="max-width:680px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:20px;">
    <h2 style="margin:0 0 12px;color:#0f2b46;">${escapeHtml(orgName)} Training Completion</h2>
    <p style="margin:0 0 10px;color:#334155;"><strong>Employee:</strong> ${escapeHtml(input.employeeName)} (${escapeHtml(input.employeeId)})</p>
    <p style="margin:0 0 10px;color:#334155;"><strong>Module:</strong> ${escapeHtml(input.moduleTitle)} (${escapeHtml(input.moduleCode)})</p>
    <p style="margin:0 0 10px;color:#334155;"><strong>Completion Date:</strong> ${escapeHtml(input.completionDate)}</p>
    <p style="margin:0 0 10px;color:#334155;"><strong>Assessment Score:</strong> ${escapeHtml(String(input.scorePercentage))}%</p>
    <p style="margin:0 0 10px;color:#334155;"><strong>CFR Reference:</strong> ${escapeHtml(input.cfrReference)}</p>
    <p style="margin:0 0 10px;color:#334155;"><strong>Certificate Path:</strong> <code>${escapeHtml(input.certificateUrl)}</code></p>
  </div>
</body>
</html>`;

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [input.adminEmail],
        subject,
        html,
      }),
    });
  } catch (error: unknown) {
    console.error('[training] failed to send completion notification', error);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ moduleCode: string }> },
) {
  let userId: string;
  let orgId: string;
  try {
    ({ userId, orgId } = await requireFleetComplianceOrg(request));
  } catch (error: unknown) {
    const authResponse = fleetComplianceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { moduleCode } = await params;

  if (!/^TNDS-HZ-\d{3}[a-d]?$/.test(moduleCode)) {
    return Response.json({ error: 'Invalid module code' }, { status: 400 });
  }

  let body: SubmitBody;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (
    typeof body.score !== 'number' ||
    typeof body.total !== 'number' ||
    typeof body.percentage !== 'number' ||
    typeof body.passed !== 'boolean'
  ) {
    return Response.json({ error: 'Missing required fields' }, { status: 422 });
  }

  // Persist assessment result to training_progress
  try {
    const sql = getSQL();
    const moduleMeta = getTrainingModuleMetadata(moduleCode);
    let assignmentId: string | null = null;

    // Find or create assignment + progress row
    // First check if an assignment exists for this user/module
    const assignments = await sql`
      SELECT ta.id as assignment_id
      FROM training_assignments ta
      JOIN training_plans tp ON tp.id = ta.plan_id
      WHERE ta.org_id = ${orgId}
        AND ta.employee_id = ${userId}
        AND tp.modules::jsonb ? ${moduleCode}
      LIMIT 1
    `;

    if (assignments.length > 0) {
      assignmentId = assignments[0].assignment_id;

      // Upsert progress
      await sql`
        INSERT INTO training_progress (
          assignment_id, module_code, status, assessment_score,
          assessment_passed, assessment_completed_at, attempts_count
        ) VALUES (
          ${assignmentId}, ${moduleCode},
          ${body.passed ? 'assessment_passed' : 'assessment_failed'},
          ${body.percentage}, ${body.passed}, NOW(), 1
        )
        ON CONFLICT (assignment_id, module_code)
        DO UPDATE SET
          status = ${body.passed ? 'assessment_passed' : 'assessment_failed'},
          assessment_score = ${body.percentage},
          assessment_passed = ${body.passed},
          assessment_completed_at = NOW(),
          attempts_count = training_progress.attempts_count + 1,
          updated_at = NOW()
      `;

      // Update assignment completion percentage
      const progressRows = await sql`
        SELECT COUNT(*) FILTER (WHERE assessment_passed = true) as passed,
               COUNT(*) as total
        FROM training_progress
        WHERE assignment_id = ${assignmentId}
      `;

      if (progressRows.length > 0) {
        const pct = progressRows[0].total > 0
          ? Math.round((progressRows[0].passed / progressRows[0].total) * 100)
          : 0;

        const allPassed = progressRows[0].passed === progressRows[0].total;

        await sql`
          UPDATE training_assignments
          SET completion_percentage = ${pct},
              status = ${allPassed ? 'complete' : 'in_progress'},
              completed_at = ${allPassed ? new Date().toISOString() : null},
              updated_at = NOW()
          WHERE id = ${assignmentId}
        `;
      }
    }

    if (body.passed) {
      const completionDate = new Date();
      const completionDateIso = completionDate.toISOString();
      const completionDatePart = completionDateIso.slice(0, 10);
      const nextDueDate = new Date(completionDate);
      nextDueDate.setFullYear(nextDueDate.getFullYear() + moduleMeta.recurrenceCycleYears);
      const certificateUrl = `/${orgId}/training-certs/${userId}/${moduleCode}_${completionDatePart}.pdf`;
      const clerkUser = await currentUser();
      const employeeName = [clerkUser?.firstName, clerkUser?.lastName]
        .filter((value): value is string => Boolean(value && value.trim().length > 0))
        .join(' ')
        || userId;
      const employeeEmail = clerkUser?.primaryEmailAddress?.emailAddress || null;

      await sql`
        INSERT INTO hazmat_training_records (
          org_id,
          employee_id,
          employee_name,
          employee_email,
          module_code,
          module_title,
          module_category,
          status,
          credit_pathway,
          completion_date,
          recurrence_cycle_years,
          next_due_date,
          certificate_url,
          certificate_uploaded_at,
          notes,
          created_by,
          updated_at
        ) VALUES (
          ${orgId},
          ${userId},
          ${employeeName},
          ${employeeEmail},
          ${moduleCode},
          ${moduleMeta.title},
          ${moduleMeta.moduleCategory},
          'complete',
          'fcs_training',
          ${completionDateIso},
          ${moduleMeta.recurrenceCycleYears},
          ${nextDueDate.toISOString()},
          ${certificateUrl},
          NOW(),
          ${`Auto-updated from training assessment pass (${moduleCode}).`},
          ${userId},
          NOW()
        )
        ON CONFLICT (org_id, employee_id, module_code)
        DO UPDATE SET
          employee_name = EXCLUDED.employee_name,
          employee_email = EXCLUDED.employee_email,
          module_title = EXCLUDED.module_title,
          module_category = EXCLUDED.module_category,
          status = 'complete',
          credit_pathway = 'fcs_training',
          completion_date = EXCLUDED.completion_date,
          recurrence_cycle_years = EXCLUDED.recurrence_cycle_years,
          next_due_date = EXCLUDED.next_due_date,
          certificate_url = EXCLUDED.certificate_url,
          certificate_uploaded_at = NOW(),
          notes = EXCLUDED.notes,
          updated_at = NOW()
        RETURNING id
      `;
      const recordRows = await sql`
        SELECT id
        FROM hazmat_training_records
        WHERE org_id = ${orgId}
          AND employee_id = ${userId}
          AND module_code = ${moduleCode}
        LIMIT 1
      `;
      const certificateId = String(recordRows[0]?.id || `${orgId}-${userId}-${moduleCode}`);
      const orgName = await getOrganizationName(orgId) || process.env.FLEET_COMPLIANCE_ORG_NAME || orgId;
      await generateTrainingCertificate({
        certificateId,
        orgName,
        orgId,
        employeeId: userId,
        employeeName,
        moduleCode,
        moduleTitle: moduleMeta.title,
        completionDate: completionDatePart,
        scorePercentage: body.percentage,
        cfrReference: moduleMeta.cfrReference,
        phmsaEquivalent: moduleMeta.phmsaEquivalent,
        certificateUrl,
      });

      if (assignmentId) {
        await sql`
          UPDATE training_progress
          SET certificate_url = ${certificateUrl},
              updated_at = NOW()
          WHERE assignment_id = ${assignmentId}
            AND module_code = ${moduleCode}
        `;
      }

      const orgAdminEmail =
        await getOrganizationPrimaryContact(orgId)
        || process.env.FLEET_COMPLIANCE_ALERT_EMAIL
        || null;

        if (isValidEmail(orgAdminEmail)) {
          await sendTrainingCompletionEmail({
            adminEmail: orgAdminEmail,
            employeeName,
            employeeId: userId,
          moduleCode,
          moduleTitle: moduleMeta.title,
          cfrReference: moduleMeta.cfrReference,
          scorePercentage: body.percentage,
          completionDate: completionDatePart,
          certificateUrl,
        });
      }
    }
  } catch (err) {
    // Log but don't fail the response — assessment result is still valid
    console.error('Failed to persist assessment result:', err);
  }

  auditLog({
    action: 'data.write' as const,
    userId,
    orgId,
    resourceType: 'training.assessment',
    metadata: {
      moduleCode,
      score: body.score,
      total: body.total,
      percentage: body.percentage,
      passed: body.passed,
    },
  });

  return Response.json({
    status: body.passed ? 'passed' : 'failed',
    score: body.score,
    total: body.total,
    percentage: body.percentage,
    moduleCode,
  }, { status: 201 });
}
