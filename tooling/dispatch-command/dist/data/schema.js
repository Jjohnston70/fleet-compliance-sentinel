"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SLABreachSchema = exports.DispatchLogSchema = exports.ScheduleSchema = exports.BreakSchema = exports.ZoneSchema = exports.TruckSchema = exports.DriverSchema = exports.DispatchRequestSchema = exports.CompartmentSchema = exports.LocationSchema = exports.TruckStatusSchema = exports.DriverStatusSchema = exports.DispatchStatusSchema = exports.IssueTypeSchema = exports.PrioritySchema = void 0;
const zod_1 = require("zod");
// Priority levels for dispatch requests
exports.PrioritySchema = zod_1.z.enum([
    'emergency',
    'urgent',
    'standard',
    'scheduled',
]);
// Issue types for HVAC dispatch
exports.IssueTypeSchema = zod_1.z.enum([
    'no_heat',
    'no_ac',
    'leak',
    'electrical',
    'maintenance',
    'inspection',
]);
// Status of dispatch requests
exports.DispatchStatusSchema = zod_1.z.enum([
    'pending',
    'dispatched',
    'en_route',
    'on_site',
    'completed',
    'cancelled',
]);
// Driver status
exports.DriverStatusSchema = zod_1.z.enum([
    'available',
    'en_route',
    'on_site',
    'off_duty',
    'on_break',
]);
// Truck status
exports.TruckStatusSchema = zod_1.z.enum([
    'available',
    'in_use',
    'maintenance',
    'out_of_service',
]);
// Location type for coordinates
exports.LocationSchema = zod_1.z.object({
    lat: zod_1.z.number(),
    lng: zod_1.z.number(),
});
// Compartment in a truck
exports.CompartmentSchema = zod_1.z.object({
    name: zod_1.z.string(),
    capacity: zod_1.z.number(),
    current_load: zod_1.z.number(),
});
// Dispatch Request
exports.DispatchRequestSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().optional().default(() => crypto.randomUUID()),
    client_name: zod_1.z.string(),
    client_phone: zod_1.z.string(),
    address: zod_1.z.string(),
    city: zod_1.z.string(),
    state: zod_1.z.string(),
    zip: zod_1.z.string(),
    zone_id: zod_1.z.string(),
    priority: exports.PrioritySchema,
    issue_type: exports.IssueTypeSchema,
    description: zod_1.z.string(),
    status: exports.DispatchStatusSchema.default('pending'),
    assigned_driver_id: zod_1.z.string().optional(),
    assigned_truck_id: zod_1.z.string().optional(),
    estimated_arrival: zod_1.z.date().optional(),
    actual_arrival: zod_1.z.date().optional(),
    completed_at: zod_1.z.date().optional(),
    sla_deadline: zod_1.z.date(),
    created_at: zod_1.z.date().default(() => new Date()),
    updated_at: zod_1.z.date().default(() => new Date()),
});
// Driver
exports.DriverSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().optional().default(() => crypto.randomUUID()),
    name: zod_1.z.string(),
    phone: zod_1.z.string(),
    email: zod_1.z.string().email(),
    zone_id: zod_1.z.string(),
    status: exports.DriverStatusSchema.default('available'),
    certifications: zod_1.z.array(zod_1.z.string()).default([]),
    current_location: exports.LocationSchema,
    shift_start: zod_1.z.date(),
    shift_end: zod_1.z.date(),
    jobs_today: zod_1.z.number().default(0),
    max_jobs_per_day: zod_1.z.number().default(8),
    rating: zod_1.z.number().min(0).max(5).default(5),
    active: zod_1.z.boolean().default(true),
});
// Truck
exports.TruckSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().optional().default(() => crypto.randomUUID()),
    name: zod_1.z.string(),
    type: zod_1.z.enum(['standard', 'heavy', 'specialized']),
    zone_id: zod_1.z.string(),
    assigned_driver_id: zod_1.z.string().optional(),
    status: exports.TruckStatusSchema.default('available'),
    compartments: zod_1.z.array(exports.CompartmentSchema),
    mileage: zod_1.z.number().default(0),
    last_maintenance: zod_1.z.date().optional(),
    next_maintenance_due: zod_1.z.date().optional(),
    active: zod_1.z.boolean().default(true),
});
// Zone
exports.ZoneSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().optional().default(() => crypto.randomUUID()),
    name: zod_1.z.string(),
    boundaries: zod_1.z.array(exports.LocationSchema),
    primary_drivers: zod_1.z.array(zod_1.z.string()).default([]),
    backup_drivers: zod_1.z.array(zod_1.z.string()).default([]),
    avg_response_time_minutes: zod_1.z.number().default(30),
    active_requests_count: zod_1.z.number().default(0),
});
// Schedule
exports.BreakSchema = zod_1.z.object({
    start: zod_1.z.date(),
    end: zod_1.z.date(),
});
exports.ScheduleSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().optional().default(() => crypto.randomUUID()),
    driver_id: zod_1.z.string(),
    date: zod_1.z.date(),
    shift_start: zod_1.z.date(),
    shift_end: zod_1.z.date(),
    zone_id: zod_1.z.string(),
    status: zod_1.z.enum(['scheduled', 'active', 'completed', 'cancelled']).default('scheduled'),
    breaks: zod_1.z.array(exports.BreakSchema).default([]),
});
// Dispatch Log
exports.DispatchLogSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().optional().default(() => crypto.randomUUID()),
    request_id: zod_1.z.string(),
    action: zod_1.z.string(),
    actor: zod_1.z.string(),
    details: zod_1.z.record(zod_1.z.unknown()).optional(),
    timestamp: zod_1.z.date().default(() => new Date()),
});
// SLA Breach Record
exports.SLABreachSchema = zod_1.z.object({
    request_id: zod_1.z.string(),
    deadline: zod_1.z.date(),
    breach_at: zod_1.z.date().optional(),
    warning_triggered: zod_1.z.boolean().default(false),
    critical_triggered: zod_1.z.boolean().default(false),
    breached: zod_1.z.boolean().default(false),
});
//# sourceMappingURL=schema.js.map