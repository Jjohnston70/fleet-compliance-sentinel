import { ensureChiefTables } from '@/lib/chief-db';
import { chiefAuthErrorResponse, requireChiefOrgWithRole } from '@/lib/chief-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    await requireChiefOrgWithRole(request, 'admin');
  } catch (error: unknown) {
    const authResponse = chiefAuthErrorResponse(error);
    if (authResponse) return authResponse;
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await ensureChiefTables();
    return Response.json({ status: 'ok', message: 'Chief tables created successfully' });
  } catch (err: unknown) {
    console.error('[chief-import-setup] failed:', err);
    return Response.json({ error: 'Setup failed' }, { status: 500 });
  }
}
