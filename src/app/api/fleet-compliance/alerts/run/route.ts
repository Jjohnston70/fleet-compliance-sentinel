import { timingSafeEqual } from 'crypto';
import { runFleetComplianceAlertSweep } from '@/lib/fleet-compliance-alert-engine';
import { loadFleetComplianceData } from '@/lib/fleet-compliance-data';
import { ensureCronLogTable, insertCronLogEntry, listFleetComplianceOrgIds } from '@/lib/fleet-compliance-db';
import { fleetComplianceAuthErrorResponse, requireFleetComplianceOrgWithRole } from '@/lib/fleet-compliance-auth';
import { runOffboardingLifecycleSweep } from '@/lib/offboarding-lifecycle';
import { auditLog } from '@/lib/audit-logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isTimingSafeTokenMatch(provided: string, expected: string): boolean {
  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);
  if (providedBuffer.length !== expectedBuffer.length) return false;
  return timingSafeEqual(providedBuffer, expectedBuffer);
}

// Called by Vercel Cron or a manual POST.
// Secured by FLEET_COMPLIANCE_CRON_SECRET header (Authorization: Bearer <secret>).
// If RESEND_API_KEY is not set the sweep runs in dry-run mode and no emails are sent.
export async function POST(request: Request) {
  const jobName = 'fleet-compliance-alert-sweep';
  let userId = 'system';
  let orgId: string | null = null;

  const cronSecret = process.env.FLEET_COMPLIANCE_CRON_SECRET;
  const authHeader = request.headers.get('authorization') ?? '';
  const provided = authHeader.replace(/^Bearer\s+/i, '').trim();
  const isCronInvocation = Boolean(cronSecret)
    && provided.length > 0
    && isTimingSafeTokenMatch(provided, cronSecret!);

  try {
    await ensureCronLogTable();
  } catch (error: unknown) {
    console.error('[fleet-compliance-alert-sweep] failed to ensure cron log table:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }

  if (isCronInvocation) {
    try {
      const offboardingSummary = await runOffboardingLifecycleSweep();
      auditLog({
        action: 'cron.run',
        userId: 'system',
        orgId: 'system',
        resourceType: 'fleet-compliance.offboarding',
        metadata: {
          orgsEvaluated: offboardingSummary.orgsEvaluated,
          orgsScheduled: offboardingSummary.orgsScheduled,
          orgsSoftDeleted: offboardingSummary.orgsSoftDeleted,
          orgsHardDeleted: offboardingSummary.orgsHardDeleted,
          errors: offboardingSummary.errors.length,
        },
        severity: offboardingSummary.errors.length > 0 ? 'warn' : 'info',
      });

      const orgIds = await listFleetComplianceOrgIds();
      const aggregated = {
        runAt: new Date().toISOString(),
        offboarding: offboardingSummary,
        itemsEvaluated: 0,
        itemsQueued: 0,
        emailsSent: 0,
        emailsFailed: 0,
        dryRun: !process.env.RESEND_API_KEY,
        byWindow: {
          overdue: 0,
          'due-today': 0,
          '7d': 0,
          '14d': 0,
          '30d': 0,
        },
        errors: [] as string[],
      };

      for (const scopedOrgId of orgIds) {
        const data = await loadFleetComplianceData(scopedOrgId);
        const summary = await runFleetComplianceAlertSweep(data.suspense);
        aggregated.runAt = summary.runAt;
        aggregated.itemsEvaluated += summary.itemsEvaluated;
        aggregated.itemsQueued += summary.itemsQueued;
        aggregated.emailsSent += summary.emailsSent;
        aggregated.emailsFailed += summary.emailsFailed;
        aggregated.dryRun = summary.dryRun;
        aggregated.byWindow.overdue += summary.byWindow.overdue;
        aggregated.byWindow['due-today'] += summary.byWindow['due-today'];
        aggregated.byWindow['7d'] += summary.byWindow['7d'];
        aggregated.byWindow['14d'] += summary.byWindow['14d'];
        aggregated.byWindow['30d'] += summary.byWindow['30d'];
        aggregated.errors.push(...summary.errors.map((error) => `[org:${scopedOrgId}] ${error}`));

        await insertCronLogEntry({
          jobName,
          orgId: scopedOrgId,
          status: summary.emailsFailed > 0 ? 'partial' : 'success',
          message: `Evaluated ${summary.itemsEvaluated}, queued ${summary.itemsQueued}, sent ${summary.emailsSent}, failed ${summary.emailsFailed}.`,
          recordsProcessed: summary.itemsQueued,
        });
        auditLog({
          action: 'cron.run',
          userId: 'system',
          orgId: scopedOrgId,
          resourceType: 'fleet-compliance.alerts.run',
          metadata: {
            invocation: 'cron',
            itemsEvaluated: summary.itemsEvaluated,
            itemsQueued: summary.itemsQueued,
            emailsSent: summary.emailsSent,
            emailsFailed: summary.emailsFailed,
          },
          severity: summary.emailsFailed > 0 ? 'warn' : 'info',
        });
      }

      return Response.json({
        ...aggregated,
        orgsProcessed: orgIds.length,
      }, { status: 200 });
    } catch (error: unknown) {
      console.error('[fleet-compliance-alert-sweep] cron invocation failed:', error);
      auditLog({
        action: 'cron.failed',
        userId: 'system',
        orgId: 'system',
        resourceType: 'fleet-compliance.alerts.run',
        severity: 'error',
        metadata: {
          invocation: 'cron',
        },
      });
      try {
        await insertCronLogEntry({
          jobName,
          orgId: null,
          status: 'error',
          message: 'Cron invocation failed',
          recordsProcessed: 0,
        });
      } catch (logError: unknown) {
        console.error('[fleet-compliance-alert-sweep] failed to write cron error entry:', logError);
      }
      return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
  }

  try {
    const authContext = await requireFleetComplianceOrgWithRole(request, 'admin');
    userId = authContext.userId;
    orgId = authContext.orgId;
  } catch (error: unknown) {
    const authResponse = fleetComplianceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await loadFleetComplianceData(orgId);
    const summary = await runFleetComplianceAlertSweep(data.suspense);
    await insertCronLogEntry({
      jobName,
      orgId,
      status: summary.emailsFailed > 0 ? 'partial' : 'success',
      message: `Evaluated ${summary.itemsEvaluated}, queued ${summary.itemsQueued}, sent ${summary.emailsSent}, failed ${summary.emailsFailed}.`,
      recordsProcessed: summary.itemsQueued,
    });
    auditLog({
      action: 'cron.run',
      userId,
      orgId: orgId || 'unknown',
      resourceType: 'fleet-compliance.alerts.run',
      metadata: {
        invocation: 'manual',
        itemsEvaluated: summary.itemsEvaluated,
        itemsQueued: summary.itemsQueued,
        emailsSent: summary.emailsSent,
        emailsFailed: summary.emailsFailed,
      },
      severity: summary.emailsFailed > 0 ? 'warn' : 'info',
    });
    return Response.json(summary, { status: 200 });
  } catch (err: unknown) {
    try {
      await insertCronLogEntry({
        jobName,
        orgId,
        status: 'error',
        message: 'Manual alert sweep failed',
        recordsProcessed: 0,
      });
    } catch (logErr: unknown) {
      console.error('[fleet-compliance-alert-sweep] failed to write cron_log entry:', logErr);
    }
    console.error('[fleet-compliance-alert-sweep] manual invocation failed:', err);
    auditLog({
      action: 'cron.failed',
      userId,
      orgId: orgId || 'unknown',
      resourceType: 'fleet-compliance.alerts.run',
      severity: 'error',
      metadata: {
        invocation: 'manual',
      },
    });
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
