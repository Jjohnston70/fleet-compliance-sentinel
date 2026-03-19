import { auth } from '@clerk/nextjs/server';
import { isClerkEnabled } from '@/lib/clerk';
import { runChiefAlertSweep } from '@/lib/chief-alert-engine';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Manual trigger from the Chief UI. Protected by Clerk auth (no cron secret required).
// Accepts JSON body: { dryRun?: boolean }
export async function POST(request: Request) {
  if (isClerkEnabled()) {
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  let dryRun = true;
  try {
    const body = await request.json();
    if (typeof body.dryRun === 'boolean') dryRun = body.dryRun;
  } catch {
    // missing or invalid body — default to dry run
  }

  try {
    const summary = await runChiefAlertSweep({ dryRun });
    return Response.json(summary, { status: 200 });
  } catch (err: unknown) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
