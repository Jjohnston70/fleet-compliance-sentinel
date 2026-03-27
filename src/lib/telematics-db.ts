import { getSQL } from '@/lib/fleet-compliance-db';

export interface TelematicsVehicle {
  id: string;
  orgId: string;
  provider: string;
  providerVehicleId: string;
  vehicleNumber: string;
  vin: string | null;
  make: string | null;
  model: string | null;
  year: number | null;
  licensePlate: string | null;
  lastSeenAt: string | null;
  isActive: boolean;
  syncedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface TelematicsDriver {
  id: string;
  orgId: string;
  provider: string;
  providerDriverId: string;
  driverName: string;
  currentHosStatus: string | null;
  isActive: boolean;
  syncedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface TelematicsSyncLogEntry {
  id: string;
  orgId: string;
  provider: string;
  syncType: string;
  startedAt: string;
  completedAt: string | null;
  recordsFetched: number | null;
  recordsWritten: number | null;
  status: string;
  errorMessage: string | null;
  durationMs: number | null;
}

export type GPSEventCountMap = Record<string, number>;
export type LastGPSEventByVehicleMap = Record<string, string>;

function toStringValue(value: unknown): string {
  return typeof value === 'string' ? value : String(value ?? '');
}

function toNullableString(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const text = String(value);
  return text.length > 0 ? text : null;
}

function toNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toBoolean(value: unknown): boolean {
  return Boolean(value);
}

function toIsoString(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  return String(value ?? '');
}

function toNullableIsoString(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

export async function getTelematicsVehicles(orgId: string): Promise<TelematicsVehicle[]> {
  const sql = getSQL();
  const rows = await sql`
    SELECT *
    FROM telematics_vehicles
    WHERE org_id = ${orgId}
      AND is_active = true
  `;

  return rows.map((row) => ({
    id: toStringValue(row.id),
    orgId: toStringValue(row.org_id),
    provider: toStringValue(row.provider),
    providerVehicleId: toStringValue(row.provider_vehicle_id),
    vehicleNumber: toStringValue(row.vehicle_number),
    vin: toNullableString(row.vin),
    make: toNullableString(row.make),
    model: toNullableString(row.model),
    year: toNullableNumber(row.year),
    licensePlate: toNullableString(row.license_plate),
    lastSeenAt: toNullableIsoString(row.last_seen_at),
    isActive: toBoolean(row.is_active),
    syncedAt: toIsoString(row.synced_at),
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
  }));
}

export async function getTelematicsDrivers(orgId: string): Promise<TelematicsDriver[]> {
  const sql = getSQL();
  const rows = await sql`
    SELECT *
    FROM telematics_drivers
    WHERE org_id = ${orgId}
      AND is_active = true
  `;

  return rows.map((row) => ({
    id: toStringValue(row.id),
    orgId: toStringValue(row.org_id),
    provider: toStringValue(row.provider),
    providerDriverId: toStringValue(row.provider_driver_id),
    driverName: toStringValue(row.driver_name),
    currentHosStatus: toNullableString(row.current_hos_status),
    isActive: toBoolean(row.is_active),
    syncedAt: toIsoString(row.synced_at),
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
  }));
}

export async function getGPSEventCounts(orgId: string, days: number): Promise<GPSEventCountMap> {
  const sql = getSQL();
  const rows = await sql`
    SELECT provider_vehicle_id, COUNT(*)::int AS event_count
    FROM telematics_gps_events
    WHERE org_id = ${orgId}
      AND occurred_at >= NOW() - (${days}::int * INTERVAL '1 day')
    GROUP BY provider_vehicle_id
  `;

  const counts: GPSEventCountMap = {};
  for (const row of rows) {
    const providerVehicleId = toStringValue(row.provider_vehicle_id);
    if (!providerVehicleId) continue;
    counts[providerVehicleId] = Number(row.event_count ?? 0);
  }

  return counts;
}

export async function getLastGPSEventByVehicle(orgId: string): Promise<LastGPSEventByVehicleMap> {
  const sql = getSQL();
  const rows = await sql`
    SELECT provider_vehicle_id, MAX(occurred_at) AS occurred_at
    FROM telematics_gps_events
    WHERE org_id = ${orgId}
    GROUP BY provider_vehicle_id
  `;

  const latest: LastGPSEventByVehicleMap = {};
  for (const row of rows) {
    const providerVehicleId = toStringValue(row.provider_vehicle_id);
    if (!providerVehicleId || !row.occurred_at) continue;
    latest[providerVehicleId] = toIsoString(row.occurred_at);
  }

  return latest;
}

export async function getTelematicsSyncLog(orgId: string): Promise<TelematicsSyncLogEntry[]> {
  const sql = getSQL();
  const rows = await sql`
    SELECT
      id,
      org_id,
      provider,
      sync_type,
      started_at,
      completed_at,
      records_fetched,
      records_written,
      status,
      error_message,
      duration_ms
    FROM telematics_sync_log
    WHERE org_id = ${orgId}
    ORDER BY started_at DESC
    LIMIT 5
  `;

  return rows.map((row) => ({
    id: toStringValue(row.id),
    orgId: toStringValue(row.org_id),
    provider: toStringValue(row.provider),
    syncType: toStringValue(row.sync_type),
    startedAt: toIsoString(row.started_at),
    completedAt: toNullableIsoString(row.completed_at),
    recordsFetched: toNullableNumber(row.records_fetched),
    recordsWritten: toNullableNumber(row.records_written),
    status: toStringValue(row.status),
    errorMessage: toNullableString(row.error_message),
    durationMs: toNullableNumber(row.duration_ms),
  }));
}
