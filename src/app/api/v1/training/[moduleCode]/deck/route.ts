import { fleetComplianceAuthErrorResponse, requireFleetComplianceOrg } from '@/lib/fleet-compliance-auth';
import { readFile } from 'fs/promises';
import { join } from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ moduleCode: string }> },
) {
  try {
    await requireFleetComplianceOrg(request);
  } catch (error: unknown) {
    const authResponse = fleetComplianceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { moduleCode } = await params;

  // Validate module code format
  if (!/^TNDS-HZ-\d{3}[a-d]?$/.test(moduleCode)) {
    return Response.json({ error: 'Invalid module code' }, { status: 400 });
  }

  const deckPath = join(
    process.cwd(),
    'knowledge',
    'training-content',
    'decks',
    `${moduleCode}-deck.json`,
  );

  try {
    const deckJson = await readFile(deckPath, 'utf-8');
    const deck = JSON.parse(deckJson);
    return Response.json(deck);
  } catch {
    return Response.json({ error: 'Module deck not found' }, { status: 404 });
  }
}
