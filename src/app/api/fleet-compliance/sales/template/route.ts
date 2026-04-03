import { fleetComplianceAuthErrorResponse, requireFleetComplianceOrg } from '@/lib/fleet-compliance-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SALES_TEMPLATE_HEADERS = [
  'Date',
  'Product',
  'Region',
  'SalesRep',
  'Channel',
  'Revenue',
  'UnitsSold',
  'COGS',
];

const SALES_TEMPLATE_SAMPLE = [
  '2026-04-01',
  'Diesel Fuel',
  'Front Range',
  'A. Johnson',
  'direct',
  '12500.00',
  '2500',
  '9100.00',
];

export async function GET(request: Request) {
  try {
    await requireFleetComplianceOrg(request);
  } catch (error: unknown) {
    const authResponse = fleetComplianceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const csv = `${SALES_TEMPLATE_HEADERS.join(',')}\n${SALES_TEMPLATE_SAMPLE.join(',')}\n`;
  return new Response(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="fleet-compliance-sales-template.csv"',
      'Cache-Control': 'no-store',
    },
  });
}
