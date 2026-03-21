import { loadChiefData } from '@/lib/chief-data';
import { chiefAuthErrorResponse, requireChiefOrg } from '@/lib/chief-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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
  return Response.json({ assets: data.assets });
}
