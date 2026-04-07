export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import {
  getFileById,
  getChecklist,
  getFiles,
  ensureOrgHydrated,
} from '@/lib/dq-store';
import {
  requireFleetComplianceOrg,
  fleetComplianceAuthErrorResponse,
} from '@/lib/fleet-compliance-auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let orgId: string;
  try {
    ({ orgId } = await requireFleetComplianceOrg(req));
  } catch (error: unknown) {
    const authResponse = fleetComplianceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  await ensureOrgHydrated(orgId);

  const { id } = await params;
  const numericId = Number(id);
  const file = getFileById(orgId, numericId);
  if (!file) {
    return NextResponse.json({ ok: false, error: 'DQ file not found' }, { status: 404 });
  }

  const allFiles = getFiles(orgId);
  const dqfFile = allFiles.find((item) => item.driver_id === file.driver_id && item.file_type === 'dqf');
  const dhfFile = allFiles.find((item) => item.driver_id === file.driver_id && item.file_type === 'dhf');

  const toTab = (fileId: number | undefined) => {
    if (!fileId) return { fileId: null, completion: 0, items: [] };
    const checklist = getChecklist(fileId);
    const completed = checklist.filter(
      (item) => item.status === 'uploaded' || item.status === 'generated' || item.status === 'verified',
    ).length;
    return {
      fileId,
      completion: checklist.length > 0 ? Math.round((completed / checklist.length) * 100) : 0,
      items: checklist.map((item) => ({
        docType: item.doc_type,
        label: item.doc_label,
        reference: item.cfr_reference,
        status:
          item.status === 'expired'
            ? 'expired'
            : item.status === 'uploaded' || item.status === 'generated' || item.status === 'verified'
              ? 'complete'
              : 'incomplete',
        cadence: item.cadence,
        expiryDate: item.expires_at ?? '',
        action: item.action,
      })),
    };
  };

  const dqf = toTab(dqfFile?.id);
  const dhf = toTab(dhfFile?.id);

  return NextResponse.json({
    ok: true,
    file,
    checklist: getChecklist(numericId),
    driver: {
      name: file.driver_name || 'Unknown Driver',
      cdlStatus: file.cdl_holder ? 'CDL' : 'Non-CDL',
      hireDate: file.hire_date || '',
      intakeStatus: file.intake_completed_at ? 'Complete' : 'Pending',
    },
    dqf,
    dhf,
  });
}
