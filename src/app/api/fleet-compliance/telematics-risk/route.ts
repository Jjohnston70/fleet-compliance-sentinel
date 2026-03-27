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

  try {
    const [vehicles, drivers, gpsEventCountsLast7Days, lastEventByVehicle] = await Promise.all([
      getTelematicsVehicles(orgId),
      getTelematicsDrivers(orgId),
      getGPSEventCounts(orgId, 7),
      getLastGPSEventByVehicle(orgId),
    ]);

    const sql = getSQL();
    const driverCountsRows = await sql`
      SELECT provider_driver_id, COUNT(*)::int AS event_count
      FROM telematics_gps_events
      WHERE org_id = ${orgId}
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
