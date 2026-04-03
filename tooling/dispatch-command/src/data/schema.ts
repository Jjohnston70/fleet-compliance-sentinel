import { z } from 'zod';

// Priority levels for dispatch requests
export const PrioritySchema = z.enum([
  'emergency',
  'urgent',
  'standard',
  'scheduled',
]);
export type Priority = z.infer<typeof PrioritySchema>;

// Issue types for HVAC dispatch
export const IssueTypeSchema = z.enum([
  'no_heat',
  'no_ac',
  'leak',
  'electrical',
  'maintenance',
  'inspection',
]);
export type IssueType = z.infer<typeof IssueTypeSchema>;

// Status of dispatch requests
export const DispatchStatusSchema = z.enum([
  'pending',
  'dispatched',
  'en_route',
  'on_site',
  'completed',
  'cancelled',
]);
export type DispatchStatus = z.infer<typeof DispatchStatusSchema>;

// Driver status
export const DriverStatusSchema = z.enum([
  'available',
  'en_route',
  'on_site',
  'off_duty',
  'on_break',
]);
export type DriverStatus = z.infer<typeof DriverStatusSchema>;

// Truck status
export const TruckStatusSchema = z.enum([
  'available',
  'in_use',
  'maintenance',
  'out_of_service',
]);
export type TruckStatus = z.infer<typeof TruckStatusSchema>;

// Location type for coordinates
export const LocationSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});
export type Location = z.infer<typeof LocationSchema>;

// Compartment in a truck
export const CompartmentSchema = z.object({
  name: z.string(),
  capacity: z.number(),
  current_load: z.number(),
});
export type Compartment = z.infer<typeof CompartmentSchema>;

// Dispatch Request
export const DispatchRequestSchema = z.object({
  id: z.string().uuid().optional().default(() => crypto.randomUUID()),
  client_name: z.string(),
  client_phone: z.string(),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  zip: z.string(),
  zone_id: z.string(),
  priority: PrioritySchema,
  issue_type: IssueTypeSchema,
  description: z.string(),
  status: DispatchStatusSchema.default('pending'),
  assigned_driver_id: z.string().optional(),
  assigned_truck_id: z.string().optional(),
  estimated_arrival: z.date().optional(),
  actual_arrival: z.date().optional(),
  completed_at: z.date().optional(),
  sla_deadline: z.date(),
  created_at: z.date().default(() => new Date()),
  updated_at: z.date().default(() => new Date()),
});
export type DispatchRequest = z.infer<typeof DispatchRequestSchema>;

// Driver
export const DriverSchema = z.object({
  id: z.string().uuid().optional().default(() => crypto.randomUUID()),
  name: z.string(),
  phone: z.string(),
  email: z.string().email(),
  zone_id: z.string(),
  status: DriverStatusSchema.default('available'),
  certifications: z.array(z.string()).default([]),
  current_location: LocationSchema,
  shift_start: z.date(),
  shift_end: z.date(),
  jobs_today: z.number().default(0),
  max_jobs_per_day: z.number().default(8),
  rating: z.number().min(0).max(5).default(5),
  active: z.boolean().default(true),
});
export type Driver = z.infer<typeof DriverSchema>;

// Truck
export const TruckSchema = z.object({
  id: z.string().uuid().optional().default(() => crypto.randomUUID()),
  name: z.string(),
  type: z.enum(['standard', 'heavy', 'specialized']),
  zone_id: z.string(),
  assigned_driver_id: z.string().optional(),
  status: TruckStatusSchema.default('available'),
  compartments: z.array(CompartmentSchema),
  mileage: z.number().default(0),
  last_maintenance: z.date().optional(),
  next_maintenance_due: z.date().optional(),
  active: z.boolean().default(true),
});
export type Truck = z.infer<typeof TruckSchema>;

// Zone
export const ZoneSchema = z.object({
  id: z.string().uuid().optional().default(() => crypto.randomUUID()),
  name: z.string(),
  boundaries: z.array(LocationSchema),
  primary_drivers: z.array(z.string()).default([]),
  backup_drivers: z.array(z.string()).default([]),
  avg_response_time_minutes: z.number().default(30),
  active_requests_count: z.number().default(0),
});
export type Zone = z.infer<typeof ZoneSchema>;

// Schedule
export const BreakSchema = z.object({
  start: z.date(),
  end: z.date(),
});

export const ScheduleSchema = z.object({
  id: z.string().uuid().optional().default(() => crypto.randomUUID()),
  driver_id: z.string(),
  date: z.date(),
  shift_start: z.date(),
  shift_end: z.date(),
  zone_id: z.string(),
  status: z.enum(['scheduled', 'active', 'completed', 'cancelled']).default('scheduled'),
  breaks: z.array(BreakSchema).default([]),
});
export type Schedule = z.infer<typeof ScheduleSchema>;

// Dispatch Log
export const DispatchLogSchema = z.object({
  id: z.string().uuid().optional().default(() => crypto.randomUUID()),
  request_id: z.string(),
  action: z.string(),
  actor: z.string(),
  details: z.record(z.unknown()).optional(),
  timestamp: z.date().default(() => new Date()),
});
export type DispatchLog = z.infer<typeof DispatchLogSchema>;

// SLA Breach Record
export const SLABreachSchema = z.object({
  request_id: z.string(),
  deadline: z.date(),
  breach_at: z.date().optional(),
  warning_triggered: z.boolean().default(false),
  critical_triggered: z.boolean().default(false),
  breached: z.boolean().default(false),
});
export type SLABreach = z.infer<typeof SLABreachSchema>;
