type DispatchPriority = 'emergency' | 'urgent' | 'standard' | 'scheduled';
type DispatchIssueType = 'no_heat' | 'no_ac' | 'leak' | 'electrical' | 'maintenance' | 'inspection';
type DispatchStatus =
  | 'pending'
  | 'dispatched'
  | 'en_route'
  | 'on_site'
  | 'completed'
  | 'cancelled';
type DriverStatus = 'available' | 'en_route' | 'on_site' | 'off_duty' | 'on_break';

interface DispatchCommandModule {
  InMemoryRepository: new () => any;
  DispatchService: new (repository: any) => any;
  DriverService: new (repository: any) => any;
  DispatchAPIHandlers: new (repository: any) => any;
  DispatchDashboard: new (repository: any) => any;
  SLAService: new (repository: any) => any;
  seedAll: (repository: any) => Promise<void>;
}

export interface DispatchRuntime {
  repository: any;
  dispatchService: any;
  driverService: any;
  apiHandlers: any;
  dashboard: any;
  slaService: any;
}

let dispatchModulePromise: Promise<DispatchCommandModule> | null = null;
const runtimeByOrg = new Map<string, DispatchRuntime>();

function normalizeDate(value: unknown): Date | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return null;
}

export function toIsoString(value: unknown): string | null {
  const date = normalizeDate(value);
  return date ? date.toISOString() : null;
}

export function normalizeDispatchPriority(value: unknown): DispatchPriority | null {
  const normalized = String(value ?? '').trim();
  if (
    normalized === 'emergency'
    || normalized === 'urgent'
    || normalized === 'standard'
    || normalized === 'scheduled'
  ) {
    return normalized;
  }
  return null;
}

export function normalizeDispatchIssueType(value: unknown): DispatchIssueType | null {
  const normalized = String(value ?? '').trim();
  if (
    normalized === 'no_heat'
    || normalized === 'no_ac'
    || normalized === 'leak'
    || normalized === 'electrical'
    || normalized === 'maintenance'
    || normalized === 'inspection'
  ) {
    return normalized;
  }
  return null;
}

export function normalizeDispatchStatus(value: unknown): DispatchStatus | null {
  const normalized = String(value ?? '').trim();
  if (
    normalized === 'pending'
    || normalized === 'dispatched'
    || normalized === 'en_route'
    || normalized === 'on_site'
    || normalized === 'completed'
    || normalized === 'cancelled'
  ) {
    return normalized;
  }
  return null;
}

export function normalizeDriverStatus(value: unknown): DriverStatus | null {
  const normalized = String(value ?? '').trim();
  if (
    normalized === 'available'
    || normalized === 'en_route'
    || normalized === 'on_site'
    || normalized === 'off_duty'
    || normalized === 'on_break'
  ) {
    return normalized;
  }
  return null;
}

export function serializeDispatchRequest(request: any): Record<string, unknown> {
  return {
    id: String(request?.id ?? ''),
    clientName: String(request?.client_name ?? ''),
    clientPhone: String(request?.client_phone ?? ''),
    address: String(request?.address ?? ''),
    city: String(request?.city ?? ''),
    state: String(request?.state ?? ''),
    zip: String(request?.zip ?? ''),
    zoneId: String(request?.zone_id ?? ''),
    priority: String(request?.priority ?? 'standard'),
    issueType: String(request?.issue_type ?? 'maintenance'),
    description: String(request?.description ?? ''),
    status: String(request?.status ?? 'pending'),
    assignedDriverId: request?.assigned_driver_id ? String(request.assigned_driver_id) : null,
    assignedTruckId: request?.assigned_truck_id ? String(request.assigned_truck_id) : null,
    estimatedArrival: toIsoString(request?.estimated_arrival),
    actualArrival: toIsoString(request?.actual_arrival),
    completedAt: toIsoString(request?.completed_at),
    slaDeadline: toIsoString(request?.sla_deadline),
    createdAt: toIsoString(request?.created_at),
    updatedAt: toIsoString(request?.updated_at),
  };
}

export function serializeDriver(driver: any): Record<string, unknown> {
  return {
    id: String(driver?.id ?? ''),
    name: String(driver?.name ?? ''),
    phone: String(driver?.phone ?? ''),
    email: String(driver?.email ?? ''),
    zoneId: String(driver?.zone_id ?? ''),
    status: String(driver?.status ?? 'off_duty'),
    certifications: Array.isArray(driver?.certifications) ? driver.certifications : [],
    currentLocation: {
      lat: Number(driver?.current_location?.lat ?? 0),
      lng: Number(driver?.current_location?.lng ?? 0),
    },
    shiftStart: toIsoString(driver?.shift_start),
    shiftEnd: toIsoString(driver?.shift_end),
    jobsToday: Number(driver?.jobs_today ?? 0),
    maxJobsPerDay: Number(driver?.max_jobs_per_day ?? 0),
    rating: Number(driver?.rating ?? 0),
    active: Boolean(driver?.active),
  };
}

export function serializeZone(zone: any): Record<string, unknown> {
  return {
    id: String(zone?.id ?? ''),
    name: String(zone?.name ?? ''),
    avgResponseTimeMinutes: Number(zone?.avg_response_time_minutes ?? 0),
    activeRequestsCount: Number(zone?.active_requests_count ?? 0),
    primaryDrivers: Array.isArray(zone?.primary_drivers) ? zone.primary_drivers : [],
    backupDrivers: Array.isArray(zone?.backup_drivers) ? zone.backup_drivers : [],
  };
}

async function loadDispatchCommandModule(): Promise<DispatchCommandModule> {
  if (!dispatchModulePromise) {
    dispatchModulePromise = import('../../tooling/dispatch-command/dist/index.js') as Promise<DispatchCommandModule>;
  }
  return dispatchModulePromise;
}

export async function getDispatchRuntime(orgId: string): Promise<DispatchRuntime> {
  const existing = runtimeByOrg.get(orgId);
  if (existing) return existing;

  const moduleRef = await loadDispatchCommandModule();
  const repository = new moduleRef.InMemoryRepository();
  await moduleRef.seedAll(repository);

  const runtime: DispatchRuntime = {
    repository,
    dispatchService: new moduleRef.DispatchService(repository),
    driverService: new moduleRef.DriverService(repository),
    apiHandlers: new moduleRef.DispatchAPIHandlers(repository),
    dashboard: new moduleRef.DispatchDashboard(repository),
    slaService: new moduleRef.SLAService(repository),
  };

  runtimeByOrg.set(orgId, runtime);
  return runtime;
}
