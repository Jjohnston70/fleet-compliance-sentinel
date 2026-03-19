import { auth } from '@clerk/nextjs/server';
import { isClerkEnabled } from '@/lib/clerk';
import { previewChiefAlerts } from '@/lib/chief-alert-engine';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Returns a preview of what the alert sweep would send without actually sending anything.
// Protected by Clerk auth.
export async function GET() {
  if (isClerkEnabled()) {
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const preview = previewChiefAlerts();
  return Response.json({
    ...preview,
    dryRun: true,
    emailProviderConfigured: Boolean(process.env.RESEND_API_KEY),
  });
}
