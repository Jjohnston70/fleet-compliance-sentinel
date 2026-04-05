export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import {
  fleetComplianceAuthErrorResponse,
  requireFleetComplianceOrgWithRole,
} from '@/lib/fleet-compliance-auth';
import {
  getGovConModuleSetupError,
  getGovConRuntime,
  serializeGeneratedDocuments,
  toIsoString,
} from '@/lib/govcon-compliance-command-runtime';

function parseFormats(value: unknown): Array<'docx' | 'pdf' | 'markdown'> | undefined {
  if (!Array.isArray(value)) return undefined;

  const parsed = value
    .map((entry) => String(entry ?? '').trim())
    .filter((entry): entry is 'docx' | 'pdf' | 'markdown' => (
      entry === 'docx' || entry === 'pdf' || entry === 'markdown'
    ));

  return parsed.length > 0 ? parsed : undefined;
}

function parsePackageNumber(value: unknown): number | undefined {
  if (value == null || value === '') return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return undefined;
  const rounded = Math.floor(parsed);
  if (rounded < 1 || rounded > 7) return undefined;
  return rounded;
}

export async function POST(req: NextRequest) {
  let orgId: string;
  try {
    ({ orgId } = await requireFleetComplianceOrgWithRole(req, 'admin'));
  } catch (error: unknown) {
    const authResponse = fleetComplianceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const companyId = String(body.company_id ?? '').trim();
  if (!companyId) {
    return NextResponse.json({ ok: false, error: 'company_id is required' }, { status: 422 });
  }

  const packageNumber = parsePackageNumber(body.package_number);
  if (body.package_number != null && !packageNumber) {
    return NextResponse.json({ ok: false, error: 'package_number must be an integer between 1 and 7' }, { status: 422 });
  }

  const formats = parseFormats(body.formats);

  try {
    const runtimeRef = await getGovConRuntime(orgId);

    if (packageNumber) {
      const result = await runtimeRef.packageService.generatePackage(companyId, packageNumber, formats);
      return NextResponse.json({
        ok: true,
        package: {
          id: String(result?.package?.id ?? ''),
          company_id: String(result?.package?.company_id ?? ''),
          package_number: Number(result?.package?.package_number ?? 0),
          package_name: String(result?.package?.package_name ?? ''),
          status: String(result?.package?.status ?? ''),
          generated_at: toIsoString(result?.package?.generated_at),
          unresolved_placeholders: Array.isArray(result?.unresolvedPlaceholders) ? result.unresolvedPlaceholders : [],
          documents: serializeGeneratedDocuments(result?.documents),
        },
      });
    }

    const result = await runtimeRef.packageService.generateAll(companyId, formats);
    return NextResponse.json({
      ok: true,
      packages: Array.isArray(result?.results)
        ? result.results.map((entry: any) => ({
          packageNumber: Number(entry?.packageNumber ?? 0),
          packageName: String(entry?.packageName ?? ''),
          status: String(entry?.status ?? ''),
          error: entry?.error ? String(entry.error) : null,
          unresolvedPlaceholders: Array.isArray(entry?.unresolvedPlaceholders) ? entry.unresolvedPlaceholders : [],
          documents: serializeGeneratedDocuments(entry?.documents),
        }))
        : [],
      summary: {
        total: Number(result?.summary?.total ?? 0),
        completed: Number(result?.summary?.completed ?? 0),
        failed: Number(result?.summary?.failed ?? 0),
      },
    });
  } catch (error: any) {
    const setupError = getGovConModuleSetupError(error);
    if (setupError) {
      return NextResponse.json({ ok: false, error: setupError }, { status: 503 });
    }

    if (String(error?.message ?? '').includes('not found')) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 404 },
      );
    }

    console.error('[govcon-packages-post] failed:', error);
    return NextResponse.json(
      { ok: false, error: error?.message || 'Failed to generate compliance package(s)' },
      { status: 500 },
    );
  }
}
