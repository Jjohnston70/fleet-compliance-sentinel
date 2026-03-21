import { previewChiefAlerts } from '@/lib/chief-alert-engine';
import { loadChiefData } from '@/lib/chief-data';
import { chiefAuthErrorResponse, requireChiefOrg } from '@/lib/chief-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Returns a preview of what the alert sweep would send without actually sending anything.
// Protected by Clerk auth.
export async function GET(request: Request) {
  let orgId: string;
  try {
    ({ orgId } = await requireChiefOrg(request));
  } catch (error: unknown) {
    const authResponse = chiefAuthErrorResponse(error);
    if (authResponse) return authResponse;
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await loadChiefData(orgId);
  const preview = previewChiefAlerts(data.suspense);
  return Response.json({
    ...preview,
    dryRun: true,
    emailProviderConfigured: Boolean(process.env.RESEND_API_KEY),
  });
}
