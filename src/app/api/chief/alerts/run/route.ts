import { timingSafeEqual } from 'crypto';
import { runChiefAlertSweep } from '@/lib/chief-alert-engine';
import { loadChiefData } from '@/lib/chief-data';
import { ensureCronLogTable, insertCronLogEntry, listChiefOrgIds } from '@/lib/chief-db';
import { chiefAuthErrorResponse, requireChiefOrgWithRole } from '@/lib/chief-auth';
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
// Secured by CHIEF_CRON_SECRET header (Authorization: Bearer <secret>).
// If RESEND_API_KEY is not set the sweep runs in dry-run mode and no emails are sent.
export async function POST(request: Request) {
  const jobName = 'chief-alert-sweep';
  let userId = 'system';
  let orgId: string | null = null;

  const cronSecret = process.env.CHIEF_CRON_SECRET;
  const authHeader = request.headers.get('authorization') ?? '';
  const provided = authHeader.replace(/^Bearer\s+/i, '').trim();
  const isCronInvocation = Boolean(cronSecret)
    && provided.length > 0
    && isTimingSafeTokenMatch(provided, cronSecret!);

  try {
    await ensureCronLogTable();
  } catch (error: unknown) {
    console.error('[chief-alert-sweep] failed to ensure cron log table:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }

  if (isCronInvocation) {
    try {
      const orgIds = await listChiefOrgIds();
      const aggregated = {
        runAt: new Date().toISOString(),
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
        const data = await loadChiefData(scopedOrgId);
        const summary = await runChiefAlertSweep(data.suspense);
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
          resourceType: 'chief.alerts.run',
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
      console.error('[chief-alert-sweep] cron invocation failed:', error);
      auditLog({
        action: 'cron.failed',
        userId: 'system',
        orgId: 'system',
        resourceType: 'chief.alerts.run',
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
        console.error('[chief-alert-sweep] failed to write cron error entry:', logError);
      }
      return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
  }

  try {
    const authContext = await requireChiefOrgWithRole(request, 'admin');
    userId = authContext.userId;
    orgId = authContext.orgId;
  } catch (error: unknown) {
    const authResponse = chiefAuthErrorResponse(error);
    if (authResponse) return authResponse;
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await loadChiefData(orgId);
    const summary = await runChiefAlertSweep(data.suspense);
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
      resourceType: 'chief.alerts.run',
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
      console.error('[chief-alert-sweep] failed to write cron_log entry:', logErr);
    }
    console.error('[chief-alert-sweep] manual invocation failed:', err);
    auditLog({
      action: 'cron.failed',
      userId,
      orgId: orgId || 'unknown',
      resourceType: 'chief.alerts.run',
      severity: 'error',
      metadata: {
        invocation: 'manual',
      },
    });
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
