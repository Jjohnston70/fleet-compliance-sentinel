import { ensureChiefTables, insertChiefRecords } from '@/lib/chief-db';
import { loadChiefData } from '@/lib/chief-data';
import { chiefAuthErrorResponse, requireChiefOrg } from '@/lib/chief-auth';
import { validateAsset } from '@/lib/chief-validators';

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

interface CreateAssetRequest {
  assetId?: string;
  name?: string;
  category?: string;
  status?: string;
  location?: string;
  assignedTo?: string;
  nextServiceDue?: string;
  purchaseDate?: string;
  purchasePrice?: string;
  vin?: string;
  licensePlate?: string;
  year?: string;
  make?: string;
  model?: string;
  note?: string;
}

function normalize(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeStatus(status: string): string {
  const lowered = status.toLowerCase().replace(/-/g, ' ');
  if (lowered === 'maintenance hold') return 'Maintenance Hold';
  if (lowered === 'retired') return 'Retired';
  if (lowered === 'inactive') return 'Inactive';
  return 'Active';
}

function generatedAssetId(): string {
  return `AST-${Date.now().toString(36).toUpperCase()}`;
}

export async function POST(request: Request) {
  let userId: string;
  let orgId: string;
  try {
    const authContext = await requireChiefOrg(request);
    userId = authContext.userId;
    orgId = authContext.orgId;
  } catch (error: unknown) {
    const authResponse = chiefAuthErrorResponse(error);
    if (authResponse) return authResponse;
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: CreateAssetRequest;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const assetId = normalize(body.assetId) || generatedAssetId();
  const row: Record<string, string> = {
    'Asset ID': assetId,
    'Asset Name': normalize(body.name),
    'Asset Type': normalize(body.category) || 'vehicle',
    Status: normalizeStatus(normalize(body.status) || 'active'),
    'Current Location': normalize(body.location),
    'Assigned To': normalize(body.assignedTo),
    'Next Service Due': normalize(body.nextServiceDue),
    'Acquisition Date': normalize(body.purchaseDate),
    'Acquisition Cost': normalize(body.purchasePrice),
    VIN: normalize(body.vin),
    'License Plate': normalize(body.licensePlate),
    Year: normalize(body.year),
    Make: normalize(body.make),
    Model: normalize(body.model),
    Notes: normalize(body.note),
  };

  const validation = validateAsset(row);
  if (!validation.valid) {
    return Response.json(
      {
        error: 'Validation failed',
        fieldErrors: validation.errors,
      },
      { status: 422 }
    );
  }

  try {
    await ensureChiefTables();
    await insertChiefRecords('assets_master', [row], {
      orgId,
      importedBy: userId,
    });
    return Response.json({ status: 'ok', assetId }, { status: 201 });
  } catch (error: unknown) {
    console.error('[chief-assets-post] failed:', error);
    return Response.json({ error: 'Failed to create asset' }, { status: 500 });
  }
}
