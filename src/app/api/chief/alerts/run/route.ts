import { runChiefAlertSweep } from '@/lib/chief-alert-engine';
import { loadChiefData } from '@/lib/chief-data';
import { ensureCronLogTable, insertCronLogEntry } from '@/lib/chief-db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Called by Vercel Cron or a manual POST.
// Secured by CHIEF_CRON_SECRET header (Authorization: Bearer <secret>).
// If RESEND_API_KEY is not set the sweep runs in dry-run mode and no emails are sent.
export async function POST(request: Request) {
  const jobName = 'chief-alert-sweep';
  const orgId = request.headers.get('x-org-id');

  const cronSecret = process.env.CHIEF_CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get('authorization') ?? '';
    const provided = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (provided !== cronSecret) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    await ensureCronLogTable();
    const data = await loadChiefData();
    const summary = await runChiefAlertSweep(data.suspense);
    await insertCronLogEntry({
      jobName,
      orgId,
      status: summary.emailsFailed > 0 ? 'partial' : 'success',
      message: `Evaluated ${summary.itemsEvaluated}, queued ${summary.itemsQueued}, sent ${summary.emailsSent}, failed ${summary.emailsFailed}.`,
      recordsProcessed: summary.itemsQueued,
    });
    return Response.json(summary, { status: 200 });
  } catch (err: unknown) {
    try {
      await ensureCronLogTable();
      await insertCronLogEntry({
        jobName,
        orgId,
        status: 'error',
        message: String(err).slice(0, 1000),
        recordsProcessed: 0,
      });
    } catch (logErr: unknown) {
      console.error('[chief-alert-sweep] failed to write cron_log entry:', logErr);
    }
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
