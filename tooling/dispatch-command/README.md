# dispatch-command

A TNDS service module providing LLM-droppable TypeScript layer for HVAC emergency dispatch operations.

## Overview

`dispatch-command` is a standalone, reusable service module built on the TNDS 6-layer architecture. It encapsulates core dispatch business logic for HVAC emergency operations, including request creation, driver assignment, SLA monitoring, and routing optimization.

## Architecture

The module follows the TNDS 6-layer pattern:

```
src/
  data/           # Firestore schema types, in-memory repository, seed data
  services/       # Pure business logic (dispatch, routing, drivers, scheduling)
  api/            # REST endpoint handlers
  hooks/          # Automation (SLA alerts, driver rotation, shift scheduling)
  config/         # Zone definitions, SLA thresholds, truck capacities
  reporting/      # Dispatch metrics, response times, driver performance
tests/            # Vitest unit tests
src/tools.ts      # LLM tool definitions
```

## Installation

```bash
npm install @tnds/dispatch-command
```

## Quick Start

### Initialize Service

```typescript
import {
  InMemoryRepository,
  DispatchService,
  seedAll,
} from '@tnds/dispatch-command';

const repository = new InMemoryRepository();
const dispatchService = new DispatchService(repository);

// Seed default zones, drivers, trucks
await seedAll(repository);
```

### Create Dispatch Request

```typescript
const request = await dispatchService.createDispatchRequest({
  client_name: 'John Doe',
  client_phone: '(555) 123-4567',
  address: '123 Main St',
  city: 'Colorado Springs',
  state: 'CO',
  zip: '80901',
  zone_id: 'zone-cos-north',
  priority: 'emergency',
  issue_type: 'no_heat',
  description: 'No heat in home',
  status: 'pending',
  sla_deadline: new Date(),
  created_at: new Date(),
  updated_at: new Date(),
});
```

### Assign Driver

```typescript
const assignment = await dispatchService.assignDriver(
  request.id,
  'driver-3',
  'truck-3'
);

console.log(`Assigned to ${assignment.driverId}, ETA ${assignment.travelTimeMinutes} minutes`);
```

### Monitor SLA

```typescript
import { SLAMonitor } from '@tnds/dispatch-command';

const slaMonitor = new SLAMonitor(repository);
const alerts = await slaMonitor.checkSLAViolations();

// Process critical alerts
const critical = alerts.filter((a) => a.type === 'critical' || a.type === 'breached');
for (const alert of critical) {
  console.warn(alert.message);
}
```

### Auto-Dispatch Pending Requests

```typescript
import { AutoDispatcher } from '@tnds/dispatch-command';

const dispatcher = new AutoDispatcher(repository);
const results = await dispatcher.processPendingRequests();

for (const result of results) {
  if (result.dispatched) {
    console.log(`✓ Dispatched request ${result.requestId} to ${result.driverId}`);
  } else {
    console.log(`✗ Failed: ${result.message}`);
  }
}
```

### Get Dispatch Metrics

```typescript
import { DispatchDashboard } from '@tnds/dispatch-command';

const dashboard = new DispatchDashboard(repository);
const metrics = await dashboard.getDashboardMetrics();

console.log(`Active requests: ${metrics.activeRequests.pending} pending, ${metrics.activeRequests.dispatched} dispatched`);
console.log(`Driver utilization: ${metrics.driverUtilization.available} available`);
```

## Core Services

### DispatchService
Core dispatch engine for request creation, assignment, and status management.

**Key Methods:**
- `createDispatchRequest(request)` - Create new dispatch request with auto-calculated SLA deadline
- `assignDriver(requestId, driverId, truckId?)` - Assign driver and truck
- `reassignDriver(requestId, newDriverId)` - Reassign to different driver
- `completeDispatch(requestId)` - Mark request as completed
- `cancelDispatch(requestId, reason)` - Cancel request with reason
- `findNearestDriver(zone, requestLocation)` - Find nearest available driver in zone

### DriverService
Driver lifecycle and availability management.

**Key Methods:**
- `createDriver(driver)` - Register new driver
- `getAvailableDrivers()` - Get drivers ready for dispatch
- `getAvailableDriversInZone(zoneId)` - Get available drivers in specific zone
- `canAcceptJob(driverId)` - Check if driver can accept new job
- `updateDriverStatus(driverId, status)` - Update availability status
- `incrementJobCount(driverId)` - Track daily job assignments
- `resetDailyJobCounts()` - Reset counts (call once daily)

### TruckService
Truck management, maintenance scheduling, and compartment tracking.

**Key Methods:**
- `createTruck(truck)` - Register new truck
- `getAvailableTrucks()` - Get trucks ready for dispatch
- `assignTruck(truckId, driverId)` - Assign truck to driver
- `updateCompartmentLoad(truckId, compartmentName, newLoad)` - Track compartment usage
- `scheduleMaintenance(truckId, nextDueDate)` - Schedule maintenance
- `needsMaintenance(truck)` - Check if maintenance is due

### RoutingService
Distance calculation and travel time estimation using Haversine formula.

**Key Methods:**
- `calculateDistance(from, to)` - Haversine distance (miles)
- `estimateTravelTime(distance)` - Time estimation at configured speed (default 30 mph)
- `findNearest(origin, candidates)` - Find nearest location
- `optimizeRoute(origin, stops)` - Greedy nearest-neighbor route optimization

### SLAService
SLA deadline tracking and breach detection.

**Key Methods:**
- `getSLAStatus(request, now?)` - Get current SLA status (healthy/warning/critical/breached)
- `checkAllSLAStatus(now?)` - Check all active requests against SLA deadlines
- `getWarningRequests(now?)` - Get requests in warning/critical status
- `getBreachedRequests(now?)` - Get breached requests

### SchedulingService
Driver shift and schedule management.

**Key Methods:**
- `createSchedule(schedule)` - Create shift schedule
- `hasScheduleConflict(driverId, start, end)` - Detect overlapping shifts
- `isOnBreak(schedule, time)` - Check if driver is on break
- `addBreak(scheduleId, breakStart, breakEnd)` - Add break to shift

## Hooks (Automation)

### SLAMonitor
Continuous SLA monitoring with configurable alert thresholds.

```typescript
const monitor = new SLAMonitor(repository);
const alerts = await monitor.checkSLAViolations();
// Returns alerts of type: 'warning' (75% SLA consumed), 'critical' (90%), 'breached' (passed deadline)
```

Run periodically (e.g., every 5 minutes):
```typescript
setInterval(async () => {
  const critical = await monitor.getCriticalAlerts();
  // Handle critical SLA violations
}, 5 * 60 * 1000);
```

### AutoDispatcher
Automatic driver assignment for pending requests.

```typescript
const dispatcher = new AutoDispatcher(repository);
const results = await dispatcher.processPendingRequests();
// Finds nearest available driver in zone and assigns request
```

## Configuration

### Environment Variables

```
# SLA Thresholds (minutes)
SLA_EMERGENCY_MINUTES=30        # Default: 30 min
SLA_URGENT_MINUTES=120          # Default: 2 hours
SLA_STANDARD_MINUTES=240        # Default: 4 hours
SLA_SCHEDULED_MINUTES=1440      # Default: 24 hours

# Dispatch Config
MAX_JOBS_PER_DRIVER=8           # Default: 8
DEFAULT_TRAVEL_SPEED_MPH=30     # Default: 30 mph
```

### SLA Thresholds

Default thresholds with configurable warning/critical points:

| Priority   | Deadline | Warning | Critical | Breached |
|-----------|----------|---------|----------|----------|
| Emergency | 30 min   | 22 min  | 27 min   | 0 min    |
| Urgent    | 2 hrs    | 90 min  | 108 min  | 0 min    |
| Standard  | 4 hrs    | 3 hrs   | 216 min  | 0 min    |
| Scheduled | 24 hrs   | 18 hrs  | 21.6 hrs | 0 min    |

## Reporting

### DispatchDashboard
Real-time dispatch metrics.

```typescript
const dashboard = new DispatchDashboard(repository);
const metrics = await dashboard.getDashboardMetrics();

// Returns:
// - activeRequests: {pending, dispatched, en_route, on_site}
// - driverUtilization: {available, en_route, on_site, off_duty}
// - zoneHeatmap: [{zoneId, zoneName, activeRequestCount, avgResponseTime}]
// - completedToday, cancelledToday
```

### ResponseTimeReport
Response time analytics and SLA compliance.

```typescript
const report = new ResponseTimeReport(repository);

const stats = await report.getResponseTimeStats();
// [{zone, priority, avgResponseTime, min, max, median, requestCount}]

const compliance = await report.getSLAComplianceReport();
// {totalRequests, completedRequests, breachedRequests, complianceRate, breachRate}

const byZone = await report.getResponseTimeByZone();
// Map<zoneId, avgResponseTimeMinutes>
```

## LLM Integration

Export dispatch tools for LLM consumption:

```typescript
import {
  DISPATCH_COMMAND_TOOLS,
  createDispatchToolHandlers,
} from '@tnds/dispatch-command';

const tools = DISPATCH_COMMAND_TOOLS;
const handlers = createDispatchToolHandlers(repository);
// Tool names:
// - create_dispatch_request
// - assign_driver
// - reassign_driver
// - get_dispatch_status
// - list_active_dispatches
// - get_driver_availability
// - update_driver_status
// - get_dispatch_metrics
// - check_sla_status
// - find_nearest_driver
// - get_zone_status
```

## Data Schema

### DispatchRequest
- `id`: UUID
- `client_name`, `client_phone`: Contact info
- `address`, `city`, `state`, `zip`: Service location
- `zone_id`: Assigned zone
- `priority`: "emergency" | "urgent" | "standard" | "scheduled"
- `issue_type`: "no_heat" | "no_ac" | "leak" | "electrical" | "maintenance" | "inspection"
- `status`: "pending" | "dispatched" | "en_route" | "on_site" | "completed" | "cancelled"
- `assigned_driver_id`, `assigned_truck_id`: Assignment
- `estimated_arrival`, `actual_arrival`, `completed_at`: Timestamps
- `sla_deadline`: Auto-calculated based on priority

### Driver
- `id`: UUID
- `name`, `phone`, `email`: Contact info
- `zone_id`: Primary zone
- `status`: "available" | "en_route" | "on_site" | "off_duty" | "on_break"
- `certifications`: Array of EPA certifications
- `current_location`: {lat, lng}
- `shift_start`, `shift_end`: Shift times
- `jobs_today`: Daily job counter
- `max_jobs_per_day`: Configurable limit
- `rating`: 0-5 star rating
- `active`: Boolean flag

### Truck
- `id`: UUID
- `name`, `type`: Identity and category
- `zone_id`: Assigned zone
- `assigned_driver_id`: Current driver
- `status`: "available" | "in_use" | "maintenance" | "out_of_service"
- `compartments`: [{name, capacity, current_load}]
- `mileage`, `last_maintenance`, `next_maintenance_due`: Maintenance tracking

### Zone
- `id`: UUID
- `name`: Zone name
- `boundaries`: [{lat, lng}] - GeoJSON-like boundary
- `primary_drivers`, `backup_drivers`: Driver assignments
- `avg_response_time_minutes`: Zone metric
- `active_requests_count`: Workload metric

## Testing

Run tests with:
```bash
npm test
```

Run with watch mode:
```bash
npm run test:watch
```

Check types:
```bash
npm run type-check
```

Tests include:
- Dispatch service: request creation, assignment, SLA calculation, status transitions
- Routing service: Haversine distance, nearest driver finding, route optimization
- SLA service: status tracking, warning/critical/breach detection
- Driver service: availability, workload limits, job counting, status transitions
- Scheduling service: shift conflicts, break scheduling

## Firebase Integration (Future)

Currently uses InMemoryRepository for testing. To integrate Firestore:

1. Create FirestoreRepository extending base Repository interface
2. Implement collection references for each entity type
3. Replace InMemoryRepository in initialization:

```typescript
const repository = new FirestoreRepository(firestore);
```

## License

Part of True North Data Strategies (TNDS) module ecosystem.
