import { runChiefAlertSweep } from '@/lib/chief-alert-engine';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Called by Vercel Cron or a manual POST.
// Secured by CHIEF_CRON_SECRET header (Authorization: Bearer <secret>).
// If RESEND_API_KEY is not set the sweep runs in dry-run mode and no emails are sent.
export async function POST(request: Request) {
  const cronSecret = process.env.CHIEF_CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get('authorization') ?? '';
    const provided = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (provided !== cronSecret) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    const summary = await runChiefAlertSweep();
    return Response.json(summary, { status: 200 });
  } catch (err: unknown) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
