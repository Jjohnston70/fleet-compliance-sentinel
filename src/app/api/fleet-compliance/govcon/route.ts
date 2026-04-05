export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import {
  fleetComplianceAuthErrorResponse,
  requireFleetComplianceOrg,
  requireFleetComplianceOrgWithRole,
} from '@/lib/fleet-compliance-auth';
import {
  getGovConModuleSetupError,
  getGovConRuntime,
  normalizeSetAsideType,
  serializeComplianceItem,
  serializeOpportunity,
  toIsoString,
} from '@/lib/govcon-compliance-command-runtime';

function parseDateOrNull(value: unknown): Date | null {
  if (!value) return null;
  const parsed = new Date(String(value));
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function parseOptionalNumber(value: unknown): number | undefined {
  if (value == null || value === '') return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return undefined;
  return parsed;
}

function mapDashboardMetrics(dashboard: any) {
  return {
    activeOpportunities: Number(dashboard?.activeOpportunities ?? 0),
    pipelineValue: Number(dashboard?.pipelineValue ?? 0),
    upcomingDeadlines: Array.isArray(dashboard?.upcomingDeadlines)
      ? dashboard.upcomingDeadlines.map((opportunity: any) => serializeOpportunity(opportunity))
      : [],
    statusDistribution: dashboard?.statusDistribution && typeof dashboard.statusDistribution === 'object'
      ? dashboard.statusDistribution
      : {},
    setAsideDistribution: dashboard?.setAsideDistribution && typeof dashboard.setAsideDistribution === 'object'
      ? dashboard.setAsideDistribution
      : {},
    estimatedWinRate: Number(dashboard?.estimatedWinRate ?? 0),
    averageBidValue: Number(dashboard?.averageBidValue ?? 0),
  };
}

export async function GET(req: NextRequest) {
  let orgId: string;
  try {
    ({ orgId } = await requireFleetComplianceOrg(req));
  } catch (error: unknown) {
    const authResponse = fleetComplianceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const runtimeRef = await getGovConRuntime(orgId);

    const [dashboardMetrics, opportunities, deadlineAlerts, complianceAlerts, complianceItems, winLoss] = await Promise.all([
      runtimeRef.dashboard.getDashboard(),
      runtimeRef.opportunityService.listOpportunities(),
      runtimeRef.deadlineMonitor.checkDeadlines(),
      runtimeRef.complianceMonitor.checkCompliance(),
      runtimeRef.complianceService.listComplianceItems(),
      runtimeRef.winLossReport.generateReport(180),
    ]);

    const sortedOpportunities = [...opportunities].sort((a: any, b: any) => {
      const aDeadline = new Date(a?.response_deadline ?? 0).getTime();
      const bDeadline = new Date(b?.response_deadline ?? 0).getTime();
      return aDeadline - bDeadline;
    });

    return NextResponse.json({
      ok: true,
      dashboard: mapDashboardMetrics(dashboardMetrics),
      opportunities: sortedOpportunities.map((opportunity: any) => serializeOpportunity(opportunity)),
      deadlineAlerts: deadlineAlerts.map((alert: any) => ({
        opportunityId: String(alert?.opportunityId ?? ''),
        title: String(alert?.title ?? ''),
        deadline: toIsoString(alert?.deadline),
        daysRemaining: Number(alert?.daysRemaining ?? 0),
        severity: String(alert?.severity ?? ''),
      })),
      complianceAlerts: complianceAlerts.map((alert: any) => ({
        itemId: String(alert?.itemId ?? ''),
        name: String(alert?.name ?? ''),
        expirationDate: toIsoString(alert?.expirationDate),
        daysRemaining: Number(alert?.daysRemaining ?? 0),
        severity: String(alert?.severity ?? ''),
      })),
      complianceItems: complianceItems.map((item: any) => serializeComplianceItem(item)),
      winLoss: {
        totalBidsSubmitted: Number(winLoss?.totalBidsSubmitted ?? 0),
        totalWins: Number(winLoss?.totalWins ?? 0),
        totalLosses: Number(winLoss?.totalLosses ?? 0),
        totalNoBids: Number(winLoss?.totalNoBids ?? 0),
        winRate: Number(winLoss?.winRate ?? 0),
      },
    });
  } catch (error) {
    const setupError = getGovConModuleSetupError(error);
    if (setupError) {
      return NextResponse.json({ ok: false, error: setupError }, { status: 503 });
    }

    console.error('[govcon-dashboard-get] failed:', error);
    return NextResponse.json({ ok: false, error: 'Failed to load GovCon dashboard' }, { status: 500 });
  }
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

  const title = String(body.title ?? '').trim();
  const solicitationNumber = String(body.solicitation_number ?? '').trim();
  const agency = String(body.agency ?? '').trim();
  const responseDeadline = parseDateOrNull(body.response_deadline);
  const setAsideType = normalizeSetAsideType(body.set_aside_type);
  const naicsCode = String(body.naics_code ?? '').trim();
  const naicsDescription = String(body.naics_description ?? '').trim();
  const description = String(body.description ?? '').trim();

  if (!title || !solicitationNumber || !agency || !responseDeadline || !setAsideType || !naicsCode || !naicsDescription || !description) {
    return NextResponse.json(
      {
        ok: false,
        error: 'title, solicitation_number, agency, response_deadline, set_aside_type, naics_code, naics_description, and description are required',
      },
      { status: 422 },
    );
  }

  const estimatedValue = parseOptionalNumber(body.estimated_value);
  if (body.estimated_value != null && body.estimated_value !== '' && estimatedValue == null) {
    return NextResponse.json(
      { ok: false, error: 'estimated_value must be a number when provided' },
      { status: 422 },
    );
  }

  try {
    const runtimeRef = await getGovConRuntime(orgId);
    const opportunity = await runtimeRef.opportunityService.createOpportunity(
      title,
      solicitationNumber,
      agency,
      responseDeadline,
      setAsideType,
      naicsCode,
      naicsDescription,
      description,
      {
        sub_agency: body.sub_agency ? String(body.sub_agency).trim() : undefined,
        estimated_value: estimatedValue,
        place_of_performance: body.place_of_performance ? String(body.place_of_performance).trim() : undefined,
        source: body.source ? String(body.source).trim() : undefined,
        url: body.url ? String(body.url).trim() : undefined,
      },
    );

    return NextResponse.json(
      {
        ok: true,
        opportunity: serializeOpportunity(opportunity),
      },
      { status: 201 },
    );
  } catch (error) {
    const setupError = getGovConModuleSetupError(error);
    if (setupError) {
      return NextResponse.json({ ok: false, error: setupError }, { status: 503 });
    }

    console.error('[govcon-opportunity-post] failed:', error);
    return NextResponse.json({ ok: false, error: 'Failed to create opportunity' }, { status: 500 });
  }
}
