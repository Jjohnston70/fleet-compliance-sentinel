import { currentUser } from '@clerk/nextjs/server';
import { fleetComplianceAuthErrorResponse, requireFleetComplianceOrg } from '@/lib/fleet-compliance-auth';
import { auditLog } from '@/lib/audit-logger';
import {
  getOrganizationName,
  getOrganizationPrimaryContact,
  getSQL,
} from '@/lib/fleet-compliance-db';
import {
  gradeTrainingAssessment,
  loadTrainingAssessment,
  normalizeAnswerMap,
} from '@/lib/training-assessment';
import {
  checkTrainingSchema,
  TRAINING_COMPLIANCE_TABLES,
  trainingSchemaNotReadyResponse,
} from '@/lib/training-schema';
import { generateTrainingCertificate } from '@/lib/training-certificate';
import { getTrainingModuleMetadata } from '@/lib/training-module-metadata';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface SubmitBody {
  answers: Record<string, string>;
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

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const answers = normalizeAnswerMap((rawBody as Partial<SubmitBody>)?.answers);
  if (!answers) {
    return Response.json({ error: 'answers must be an object of question->answer values' }, { status: 422 });
  }

  const assessment = await loadTrainingAssessment(moduleCode);
  if (!assessment) {
    return Response.json({ error: 'Assessment not found' }, { status: 404 });
  }

  const sql = getSQL();
  const schemaCheck = await checkTrainingSchema(TRAINING_COMPLIANCE_TABLES, sql);
  if (!schemaCheck.ok) return trainingSchemaNotReadyResponse(schemaCheck);

  const assignmentRows = await sql`
    SELECT
      ta.id AS assignment_id,
      pr.id AS progress_id,
      pr.deck_completed_at,
      tp.passing_score_override
    FROM training_assignments ta
    JOIN training_plans tp ON tp.id = ta.plan_id
    LEFT JOIN training_progress pr
      ON pr.assignment_id = ta.id
      AND pr.module_code = ${moduleCode}
    WHERE ta.org_id = ${orgId}
      AND ta.employee_id = ${userId}
      AND tp.modules::jsonb ? ${moduleCode}
    ORDER BY ta.assigned_at DESC
    LIMIT 1
  `;

  if (assignmentRows.length === 0) {
    return Response.json(
      { error: 'Training module is not assigned to this user in the current organization' },
      { status: 403 },
    );
  }

  const assignment = assignmentRows[0];
  const assignmentId = String(assignment.assignment_id);
  if (!assignment.progress_id) {
    return Response.json(
      { error: 'Training progress row missing for assigned module' },
      { status: 409 },
    );
  }
  if (!assignment.deck_completed_at) {
    return Response.json(
      { error: 'Complete the training deck before submitting the assessment' },
      { status: 409 },
    );
  }

  const passingScoreOverride = (
    assignment.passing_score_override === null
    || assignment.passing_score_override === undefined
  )
    ? null
    : Number(assignment.passing_score_override);

  const graded = gradeTrainingAssessment(assessment, answers, passingScoreOverride);
  const moduleMeta = getTrainingModuleMetadata(moduleCode);
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

  let certificateId: string | null = null;
  try {
    const txResults = await sql.transaction((tx) => {
      const writes = [
        tx`
          UPDATE training_progress
          SET status = ${graded.passed ? 'assessment_passed' : 'assessment_failed'},
              assessment_score = ${graded.percentage},
              assessment_passed = ${graded.passed},
              assessment_completed_at = NOW(),
              attempts_count = COALESCE(attempts_count, 0) + 1,
              updated_at = NOW()
          WHERE assignment_id = ${assignmentId}
            AND module_code = ${moduleCode}
        `,
        tx`
          UPDATE training_assignments ta
          SET completion_percentage = stats.pct,
              status = CASE
                WHEN stats.total > 0 AND stats.passed = stats.total THEN 'complete'
                ELSE 'in_progress'
              END,
              completed_at = CASE
                WHEN stats.total > 0 AND stats.passed = stats.total THEN NOW()
                ELSE NULL
              END,
              updated_at = NOW()
          FROM (
            SELECT
              COUNT(*) FILTER (WHERE assessment_passed = true)::int AS passed,
              COUNT(*)::int AS total,
              CASE
                WHEN COUNT(*) > 0
                  THEN ROUND((COUNT(*) FILTER (WHERE assessment_passed = true)::numeric / COUNT(*)::numeric) * 100)
                ELSE 0
              END AS pct
            FROM training_progress
            WHERE assignment_id = ${assignmentId}
          ) stats
          WHERE ta.id = ${assignmentId}
        `,
      ];

      if (graded.passed) {
        writes.push(
          tx`
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
          `,
          tx`
            UPDATE training_progress
            SET certificate_url = ${certificateUrl},
                updated_at = NOW()
            WHERE assignment_id = ${assignmentId}
              AND module_code = ${moduleCode}
          `,
        );
      } else {
        writes.push(
          tx`
            UPDATE training_progress
            SET certificate_url = NULL,
                updated_at = NOW()
            WHERE assignment_id = ${assignmentId}
              AND module_code = ${moduleCode}
          `,
        );
      }

      return writes;
    });

    if (graded.passed) {
      const recordRows = txResults[2] as Array<{ id: string | number }>;
      certificateId = String(recordRows[0]?.id || `${orgId}-${userId}-${moduleCode}`);
    }
  } catch (error: unknown) {
    console.error('[training] failed to persist graded assessment', error);
    return Response.json(
      { error: 'Failed to persist assessment result' },
      { status: 500 },
    );
  }

  if (graded.passed && certificateId) {
    try {
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
        scorePercentage: graded.percentage,
        cfrReference: moduleMeta.cfrReference,
        phmsaEquivalent: moduleMeta.phmsaEquivalent,
        certificateUrl,
      });
    } catch (error: unknown) {
      console.error('[training] failed to generate training certificate', error);
      return Response.json(
        { error: 'Assessment saved, but certificate generation failed' },
        { status: 500 },
      );
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
        scorePercentage: graded.percentage,
        completionDate: completionDatePart,
        certificateUrl,
      });
    }
  }

  auditLog({
    action: 'data.write' as const,
    userId,
    orgId,
    resourceType: 'training.assessment',
    metadata: {
      moduleCode,
      score: graded.score,
      total: graded.total,
      percentage: graded.percentage,
      passed: graded.passed,
      passingScore: graded.passingScore,
    },
  });

  return Response.json({
    status: graded.passed ? 'passed' : 'failed',
    score: graded.score,
    total: graded.total,
    percentage: graded.percentage,
    passed: graded.passed,
    passing_score: graded.passingScore,
    moduleCode,
  }, { status: 201 });
}
