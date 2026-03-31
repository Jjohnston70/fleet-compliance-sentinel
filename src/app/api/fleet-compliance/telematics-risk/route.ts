import { fleetComplianceAuthErrorResponse, requireFleetComplianceOrg } from '@/lib/fleet-compliance-auth';
import { getSQL } from '@/lib/fleet-compliance-db';
import {
  getGPSEventCounts,
  getLastGPSEventByVehicle,
  getTelematicsDrivers,
  getTelematicsVehicles,
} from '@/lib/telematics-db';
import { auditLog } from '@/lib/audit-logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW';

type VehicleRiskRow = {
  vehicleNumber: string;
  make: string | null;
  model: string | null;
  year: number | null;
  riskScore: number;
  riskLevel: RiskLevel;
  lastSeenAt: string | null;
  gpsEventsLast7Days: number;
  flags: string[];
};

type DriverRiskRow = {
  driverName: string;
  riskScore: number;
  riskLevel: RiskLevel;
  hosStatus: string;
  flags: string[];
};

type DriverGPSCountRow = {
  provider_driver_id: string | null;
  event_count: number;
};

type TelematicsOrgCountsRow = {
  vehicles: number;
  drivers: number;
  gps_events: number;
};

const DAY_MS = 24 * 60 * 60 * 1000;

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, value));
}

function resolveRiskLevel(score: number): RiskLevel {
  if (score >= 60) return 'HIGH';
  if (score >= 30) return 'MEDIUM';
  return 'LOW';
}

function parseDate(value: string | null): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function hasOldestEventBeyondDays(eventAt: Date | null, days: number): boolean {
  if (!eventAt) return true;
  return (Date.now() - eventAt.getTime()) > (days * DAY_MS);
}

function summarizeTopFlags(flags: string[]): string[] {
  const counts = new Map<string, number>();
  for (const flag of flags) {
    counts.set(flag, (counts.get(flag) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      return a[0].localeCompare(b[0]);
    })
    .slice(0, 5)
    .map(([flag]) => flag);
}

async function getTelematicsCountsForOrg(orgId: string): Promise<TelematicsOrgCountsRow> {
  const sql = getSQL();
  const rows = await sql`
    SELECT
      (SELECT COUNT(*)::int FROM telematics_vehicles WHERE org_id = ${orgId}) AS vehicles,
      (SELECT COUNT(*)::int FROM telematics_drivers WHERE org_id = ${orgId}) AS drivers,
      (SELECT COUNT(*)::int FROM telematics_gps_events WHERE org_id = ${orgId}) AS gps_events
  `;
  const row = rows[0] as TelematicsOrgCountsRow | undefined;
  return {
    vehicles: Number(row?.vehicles ?? 0),
    drivers: Number(row?.drivers ?? 0),
    gps_events: Number(row?.gps_events ?? 0),
  };
}

async function resolveTelematicsDataOrgId(requestOrgId: string): Promise<string> {
  const primaryCounts = await getTelematicsCountsForOrg(requestOrgId);
  const hasPrimaryData = primaryCounts.vehicles > 0 || primaryCounts.drivers > 0 || primaryCounts.gps_events > 0;
  if (hasPrimaryData) return requestOrgId;

  const fallbackOrgId = (process.env.REVEAL_ORG_ID ?? '').trim();
  if (!fallbackOrgId || fallbackOrgId === requestOrgId) return requestOrgId;

  const fallbackCounts = await getTelematicsCountsForOrg(fallbackOrgId);
  const hasFallbackData = fallbackCounts.vehicles > 0 || fallbackCounts.drivers > 0 || fallbackCounts.gps_events > 0;
  return hasFallbackData ? fallbackOrgId : requestOrgId;
}

// ===== DEMO MODE =====
// Set TELEMATICS_DEMO_MODE=true in .env to show demo data instead of live Verizon data.
// Set TELEMATICS_DEMO_MODE=false (or remove it) to restore live Verizon Reveal connection.
// Demo data uses fake personnel names, truck identifiers, and GPS events.

function isDemoMode(): boolean {
  return (process.env.TELEMATICS_DEMO_MODE ?? '').toLowerCase() === 'true';
}

function generateDemoData(orgId: string) {
  const now = new Date();
  const daysAgo = (days: number) => new Date(now.getTime() - days * DAY_MS).toISOString();

  const demoVehicles: VehicleRiskRow[] = [
    { vehicleNumber: 'GT-1001', make: 'Freightliner', model: 'Cascadia', year: 2022, riskScore: 15, riskLevel: 'LOW', lastSeenAt: daysAgo(0), gpsEventsLast7Days: 42, flags: [] },
    { vehicleNumber: 'GT-1002', make: 'Peterbilt', model: '579', year: 2021, riskScore: 25, riskLevel: 'LOW', lastSeenAt: daysAgo(1), gpsEventsLast7Days: 38, flags: ['vehicle.last_seen_gt_1d'] },
    { vehicleNumber: 'GT-1003', make: 'Kenworth', model: 'T680', year: 2020, riskScore: 45, riskLevel: 'MEDIUM', lastSeenAt: daysAgo(4), gpsEventsLast7Days: 12, flags: ['vehicle.last_seen_gt_3d'] },
    { vehicleNumber: 'GT-1004', make: 'Volvo', model: 'VNL 860', year: 2023, riskScore: 10, riskLevel: 'LOW', lastSeenAt: daysAgo(0), gpsEventsLast7Days: 55, flags: [] },
    { vehicleNumber: 'GT-1005', make: 'International', model: 'LT', year: 2019, riskScore: 35, riskLevel: 'MEDIUM', lastSeenAt: daysAgo(2), gpsEventsLast7Days: 8, flags: ['vehicle.gps_events_7d_low'] },
    { vehicleNumber: 'GT-1006', make: 'Mack', model: 'Anthem', year: 2018, riskScore: 60, riskLevel: 'HIGH', lastSeenAt: daysAgo(8), gpsEventsLast7Days: 0, flags: ['vehicle.last_seen_gt_7d', 'vehicle.gps_events_7d_none'] },
    { vehicleNumber: 'GT-1007', make: 'Freightliner', model: 'M2 106', year: 2021, riskScore: 20, riskLevel: 'LOW', lastSeenAt: daysAgo(0), gpsEventsLast7Days: 31, flags: [] },
    { vehicleNumber: 'GT-1008', make: 'Peterbilt', model: '389', year: 2017, riskScore: 50, riskLevel: 'MEDIUM', lastSeenAt: daysAgo(5), gpsEventsLast7Days: 3, flags: ['vehicle.last_seen_gt_3d', 'vehicle.gps_events_7d_low'] },
    { vehicleNumber: 'GT-2001', make: 'Ford', model: 'F-350', year: 2024, riskScore: 5, riskLevel: 'LOW', lastSeenAt: daysAgo(0), gpsEventsLast7Days: 67, flags: [] },
    { vehicleNumber: 'GT-2002', make: 'RAM', model: '3500', year: 2022, riskScore: 30, riskLevel: 'MEDIUM', lastSeenAt: daysAgo(3), gpsEventsLast7Days: 15, flags: ['vehicle.last_seen_gt_3d'] },
  ];

  const demoDrivers: DriverRiskRow[] = [
    { driverName: 'Marcus Rivera', riskScore: 10, riskLevel: 'LOW', hosStatus: 'ELD: On Duty', flags: [] },
    { driverName: 'Sarah Chen', riskScore: 5, riskLevel: 'LOW', hosStatus: 'ELD: Driving', flags: [] },
    { driverName: 'James Patterson', riskScore: 35, riskLevel: 'MEDIUM', hosStatus: 'ELD: Off Duty', flags: ['driver.gps_events_7d_none'] },
    { driverName: 'Lisa Morales', riskScore: 15, riskLevel: 'LOW', hosStatus: 'ELD: Sleeper', flags: [] },
    { driverName: 'David Kim', riskScore: 65, riskLevel: 'HIGH', hosStatus: 'ELD: On Duty', flags: ['driver.eld_org_gps_stale', 'driver.gps_events_7d_none'] },
    { driverName: 'Rachel Thompson', riskScore: 20, riskLevel: 'LOW', hosStatus: 'ELD: Driving', flags: [] },
    { driverName: 'Carlos Mendez', riskScore: 40, riskLevel: 'MEDIUM', hosStatus: 'UNKNOWN', flags: ['driver.gps_events_7d_none'] },
    { driverName: 'Nicole Wright', riskScore: 10, riskLevel: 'LOW', hosStatus: 'ELD: On Duty', flags: [] },
  ];

  const levels = [...demoVehicles, ...demoDrivers].map((r) => r.riskLevel);

  return {
    orgId,
    dataOrgId: orgId,
    generatedAt: now.toISOString(),
    vehicles: demoVehicles,
    drivers: demoDrivers,
    summary: {
      totalVehicles: demoVehicles.length,
      totalDrivers: demoDrivers.length,
      highRisk: levels.filter((l) => l === 'HIGH').length,
      mediumRisk: levels.filter((l) => l === 'MEDIUM').length,
      lowRisk: levels.filter((l) => l === 'LOW').length,
      topFlags: summarizeTopFlags([
        ...demoVehicles.flatMap((v) => v.flags),
        ...demoDrivers.flatMap((d) => d.flags),
      ]),
    },
  };
}

export async function GET(request: Request) {
  let userId: string;
  let orgId: string;
  try {
    ({ userId, orgId } = await requireFleetComplianceOrg(request));
  } catch (error: unknown) {
    const authResponse = fleetComplianceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Demo mode: return fake data without hitting Verizon/DB
  if (isDemoMode()) {
    const demoResponse = generateDemoData(orgId);
    auditLog({
      action: 'data.read',
      userId,
      orgId,
      resourceType: 'fleet-compliance.telematics-risk',
      metadata: { collection: 'telematics_risk', demoMode: true },
      severity: 'info',
    });
    return Response.json(demoResponse, { status: 200 });
  }

  try {
    const dataOrgId = await resolveTelematicsDataOrgId(orgId);
    const usingFallbackOrg = dataOrgId !== orgId;

    const [vehicles, drivers, gpsEventCountsLast7Days, lastEventByVehicle] = await Promise.all([
      getTelematicsVehicles(dataOrgId),
      getTelematicsDrivers(dataOrgId),
      getGPSEventCounts(dataOrgId, 7),
      getLastGPSEventByVehicle(dataOrgId),
    ]);

    const sql = getSQL();
    const driverCountsRows = await sql`
      SELECT provider_driver_id, COUNT(*)::int AS event_count
      FROM telematics_gps_events
      WHERE org_id = ${dataOrgId}
        AND provider_driver_id IS NOT NULL
        AND occurred_at >= NOW() - INTERVAL '7 days'
      GROUP BY provider_driver_id
    `;

    const driverEventCounts = new Map<string, number>();
    for (const row of driverCountsRows as DriverGPSCountRow[]) {
      if (!row.provider_driver_id) continue;
      driverEventCounts.set(row.provider_driver_id, Number(row.event_count ?? 0));
    }

    let latestOrgEventAt: Date | null = null;
    for (const occurredAt of Object.values(lastEventByVehicle)) {
      const parsed = parseDate(occurredAt);
      if (!parsed) continue;
      if (!latestOrgEventAt || parsed.getTime() > latestOrgEventAt.getTime()) {
        latestOrgEventAt = parsed;
      }
    }

    const vehicleRiskRows: VehicleRiskRow[] = vehicles.map((vehicle) => {
      let score = 0;
      const flags: string[] = [];

      const lastSeen = parseDate(vehicle.lastSeenAt);
      if (!lastSeen) {
        score += 40;
        flags.push('vehicle.never_seen');
      } else {
        const ageMs = Date.now() - lastSeen.getTime();
        if (ageMs > 7 * DAY_MS) {
          score += 30;
          flags.push('vehicle.last_seen_gt_7d');
        } else if (ageMs > 3 * DAY_MS) {
          score += 15;
          flags.push('vehicle.last_seen_gt_3d');
        }
      }

      if (typeof vehicle.year === 'number') {
        if (vehicle.year < 2010) {
          score += 20;
          flags.push('vehicle.age_pre_2010');
        } else if (vehicle.year < 2015) {
          score += 10;
          flags.push('vehicle.age_pre_2015');
        }
      }

      const gpsEventsLast7Days = Number(gpsEventCountsLast7Days[vehicle.providerVehicleId] ?? 0);
      if (gpsEventsLast7Days === 0) {
        score += 25;
        flags.push('vehicle.gps_events_7d_none');
      } else if (gpsEventsLast7Days >= 1 && gpsEventsLast7Days <= 3) {
        score += 10;
        flags.push('vehicle.gps_events_7d_low');
      }

      const riskScore = clampScore(score);
      return {
        vehicleNumber: vehicle.vehicleNumber,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        riskScore,
        riskLevel: resolveRiskLevel(riskScore),
        lastSeenAt: vehicle.lastSeenAt,
        gpsEventsLast7Days,
        flags,
      };
    });

    const orgGpsOlderThan7Days = hasOldestEventBeyondDays(latestOrgEventAt, 7);

    const driverRiskRows: DriverRiskRow[] = drivers.map((driver) => {
      let score = 0;
      const flags: string[] = [];
      const hosStatus = driver.currentHosStatus ?? 'UNKNOWN';
      const driverGpsEventsLast7Days = driverEventCounts.get(driver.providerDriverId) ?? 0;

      if (hosStatus.startsWith('ELD:') && orgGpsOlderThan7Days) {
        score += 50;
        flags.push('driver.eld_org_gps_stale');
      }

      if (driverGpsEventsLast7Days === 0) {
        score += 30;
        flags.push('driver.gps_events_7d_none');
      }

      if (/back\s*up|test/i.test(driver.driverName)) {
        score += 20;
        flags.push('driver.placeholder_record');
      }

      const riskScore = clampScore(score);
      return {
        driverName: driver.driverName,
        riskScore,
        riskLevel: resolveRiskLevel(riskScore),
        hosStatus,
        flags,
      };
    });

    const levels = [...vehicleRiskRows, ...driverRiskRows].map((row) => row.riskLevel);
    const highRisk = levels.filter((level) => level === 'HIGH').length;
    const mediumRisk = levels.filter((level) => level === 'MEDIUM').length;
    const lowRisk = levels.filter((level) => level === 'LOW').length;

    const topFlags = summarizeTopFlags([
      ...vehicleRiskRows.flatMap((row) => row.flags),
      ...driverRiskRows.flatMap((row) => row.flags),
    ]);

    const responseBody = {
      orgId,
      dataOrgId,
      generatedAt: new Date().toISOString(),
      vehicles: vehicleRiskRows,
      drivers: driverRiskRows,
      summary: {
        totalVehicles: vehicleRiskRows.length,
        totalDrivers: driverRiskRows.length,
        highRisk,
        mediumRisk,
        lowRisk,
        topFlags,
      },
    };

    auditLog({
      action: 'data.read',
      userId,
      orgId,
      resourceType: 'fleet-compliance.telematics-risk',
      metadata: {
        collection: 'telematics_risk',
        totalVehicles: responseBody.summary.totalVehicles,
        totalDrivers: responseBody.summary.totalDrivers,
        highRisk,
        mediumRisk,
        lowRisk,
        dataOrgId,
        usingFallbackOrg,
      },
      severity: highRisk > 0 ? 'warn' : 'info',
    });

    return Response.json(responseBody, { status: 200 });
  } catch (error: unknown) {
    console.error('[fleet-compliance-telematics-risk] failed:', error);
    auditLog({
      action: 'data.read',
      userId,
      orgId,
      resourceType: 'fleet-compliance.telematics-risk',
      severity: 'error',
      metadata: {
        collection: 'telematics_risk',
        failed: true,
      },
    });
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
