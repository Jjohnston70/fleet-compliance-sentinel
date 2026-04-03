import { z } from 'zod';
export declare const PrioritySchema: z.ZodEnum<["emergency", "urgent", "standard", "scheduled"]>;
export type Priority = z.infer<typeof PrioritySchema>;
export declare const IssueTypeSchema: z.ZodEnum<["no_heat", "no_ac", "leak", "electrical", "maintenance", "inspection"]>;
export type IssueType = z.infer<typeof IssueTypeSchema>;
export declare const DispatchStatusSchema: z.ZodEnum<["pending", "dispatched", "en_route", "on_site", "completed", "cancelled"]>;
export type DispatchStatus = z.infer<typeof DispatchStatusSchema>;
export declare const DriverStatusSchema: z.ZodEnum<["available", "en_route", "on_site", "off_duty", "on_break"]>;
export type DriverStatus = z.infer<typeof DriverStatusSchema>;
export declare const TruckStatusSchema: z.ZodEnum<["available", "in_use", "maintenance", "out_of_service"]>;
export type TruckStatus = z.infer<typeof TruckStatusSchema>;
export declare const LocationSchema: z.ZodObject<{
    lat: z.ZodNumber;
    lng: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    lat: number;
    lng: number;
}, {
    lat: number;
    lng: number;
}>;
export type Location = z.infer<typeof LocationSchema>;
export declare const CompartmentSchema: z.ZodObject<{
    name: z.ZodString;
    capacity: z.ZodNumber;
    current_load: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    name: string;
    capacity: number;
    current_load: number;
}, {
    name: string;
    capacity: number;
    current_load: number;
}>;
export type Compartment = z.infer<typeof CompartmentSchema>;
export declare const DispatchRequestSchema: z.ZodObject<{
    id: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    client_name: z.ZodString;
    client_phone: z.ZodString;
    address: z.ZodString;
    city: z.ZodString;
    state: z.ZodString;
    zip: z.ZodString;
    zone_id: z.ZodString;
    priority: z.ZodEnum<["emergency", "urgent", "standard", "scheduled"]>;
    issue_type: z.ZodEnum<["no_heat", "no_ac", "leak", "electrical", "maintenance", "inspection"]>;
    description: z.ZodString;
    status: z.ZodDefault<z.ZodEnum<["pending", "dispatched", "en_route", "on_site", "completed", "cancelled"]>>;
    assigned_driver_id: z.ZodOptional<z.ZodString>;
    assigned_truck_id: z.ZodOptional<z.ZodString>;
    estimated_arrival: z.ZodOptional<z.ZodDate>;
    actual_arrival: z.ZodOptional<z.ZodDate>;
    completed_at: z.ZodOptional<z.ZodDate>;
    sla_deadline: z.ZodDate;
    created_at: z.ZodDefault<z.ZodDate>;
    updated_at: z.ZodDefault<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    status: "pending" | "dispatched" | "en_route" | "on_site" | "completed" | "cancelled";
    id: string;
    client_name: string;
    client_phone: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    zone_id: string;
    priority: "emergency" | "urgent" | "standard" | "scheduled";
    issue_type: "no_heat" | "no_ac" | "leak" | "electrical" | "maintenance" | "inspection";
    description: string;
    sla_deadline: Date;
    created_at: Date;
    updated_at: Date;
    assigned_driver_id?: string | undefined;
    assigned_truck_id?: string | undefined;
    estimated_arrival?: Date | undefined;
    actual_arrival?: Date | undefined;
    completed_at?: Date | undefined;
}, {
    client_name: string;
    client_phone: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    zone_id: string;
    priority: "emergency" | "urgent" | "standard" | "scheduled";
    issue_type: "no_heat" | "no_ac" | "leak" | "electrical" | "maintenance" | "inspection";
    description: string;
    sla_deadline: Date;
    status?: "pending" | "dispatched" | "en_route" | "on_site" | "completed" | "cancelled" | undefined;
    id?: string | undefined;
    assigned_driver_id?: string | undefined;
    assigned_truck_id?: string | undefined;
    estimated_arrival?: Date | undefined;
    actual_arrival?: Date | undefined;
    completed_at?: Date | undefined;
    created_at?: Date | undefined;
    updated_at?: Date | undefined;
}>;
export type DispatchRequest = z.infer<typeof DispatchRequestSchema>;
export declare const DriverSchema: z.ZodObject<{
    id: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    name: z.ZodString;
    phone: z.ZodString;
    email: z.ZodString;
    zone_id: z.ZodString;
    status: z.ZodDefault<z.ZodEnum<["available", "en_route", "on_site", "off_duty", "on_break"]>>;
    certifications: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    current_location: z.ZodObject<{
        lat: z.ZodNumber;
        lng: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        lat: number;
        lng: number;
    }, {
        lat: number;
        lng: number;
    }>;
    shift_start: z.ZodDate;
    shift_end: z.ZodDate;
    jobs_today: z.ZodDefault<z.ZodNumber>;
    max_jobs_per_day: z.ZodDefault<z.ZodNumber>;
    rating: z.ZodDefault<z.ZodNumber>;
    active: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    status: "en_route" | "on_site" | "available" | "off_duty" | "on_break";
    name: string;
    id: string;
    zone_id: string;
    phone: string;
    email: string;
    certifications: string[];
    current_location: {
        lat: number;
        lng: number;
    };
    shift_start: Date;
    shift_end: Date;
    jobs_today: number;
    max_jobs_per_day: number;
    rating: number;
    active: boolean;
}, {
    name: string;
    zone_id: string;
    phone: string;
    email: string;
    current_location: {
        lat: number;
        lng: number;
    };
    shift_start: Date;
    shift_end: Date;
    status?: "en_route" | "on_site" | "available" | "off_duty" | "on_break" | undefined;
    id?: string | undefined;
    certifications?: string[] | undefined;
    jobs_today?: number | undefined;
    max_jobs_per_day?: number | undefined;
    rating?: number | undefined;
    active?: boolean | undefined;
}>;
export type Driver = z.infer<typeof DriverSchema>;
export declare const TruckSchema: z.ZodObject<{
    id: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    name: z.ZodString;
    type: z.ZodEnum<["standard", "heavy", "specialized"]>;
    zone_id: z.ZodString;
    assigned_driver_id: z.ZodOptional<z.ZodString>;
    status: z.ZodDefault<z.ZodEnum<["available", "in_use", "maintenance", "out_of_service"]>>;
    compartments: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        capacity: z.ZodNumber;
        current_load: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        name: string;
        capacity: number;
        current_load: number;
    }, {
        name: string;
        capacity: number;
        current_load: number;
    }>, "many">;
    mileage: z.ZodDefault<z.ZodNumber>;
    last_maintenance: z.ZodOptional<z.ZodDate>;
    next_maintenance_due: z.ZodOptional<z.ZodDate>;
    active: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    type: "standard" | "heavy" | "specialized";
    status: "maintenance" | "available" | "in_use" | "out_of_service";
    name: string;
    id: string;
    zone_id: string;
    active: boolean;
    compartments: {
        name: string;
        capacity: number;
        current_load: number;
    }[];
    mileage: number;
    assigned_driver_id?: string | undefined;
    last_maintenance?: Date | undefined;
    next_maintenance_due?: Date | undefined;
}, {
    type: "standard" | "heavy" | "specialized";
    name: string;
    zone_id: string;
    compartments: {
        name: string;
        capacity: number;
        current_load: number;
    }[];
    status?: "maintenance" | "available" | "in_use" | "out_of_service" | undefined;
    id?: string | undefined;
    assigned_driver_id?: string | undefined;
    active?: boolean | undefined;
    mileage?: number | undefined;
    last_maintenance?: Date | undefined;
    next_maintenance_due?: Date | undefined;
}>;
export type Truck = z.infer<typeof TruckSchema>;
export declare const ZoneSchema: z.ZodObject<{
    id: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    name: z.ZodString;
    boundaries: z.ZodArray<z.ZodObject<{
        lat: z.ZodNumber;
        lng: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        lat: number;
        lng: number;
    }, {
        lat: number;
        lng: number;
    }>, "many">;
    primary_drivers: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    backup_drivers: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    avg_response_time_minutes: z.ZodDefault<z.ZodNumber>;
    active_requests_count: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    name: string;
    id: string;
    boundaries: {
        lat: number;
        lng: number;
    }[];
    primary_drivers: string[];
    backup_drivers: string[];
    avg_response_time_minutes: number;
    active_requests_count: number;
}, {
    name: string;
    boundaries: {
        lat: number;
        lng: number;
    }[];
    id?: string | undefined;
    primary_drivers?: string[] | undefined;
    backup_drivers?: string[] | undefined;
    avg_response_time_minutes?: number | undefined;
    active_requests_count?: number | undefined;
}>;
export type Zone = z.infer<typeof ZoneSchema>;
export declare const BreakSchema: z.ZodObject<{
    start: z.ZodDate;
    end: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    start: Date;
    end: Date;
}, {
    start: Date;
    end: Date;
}>;
export declare const ScheduleSchema: z.ZodObject<{
    id: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    driver_id: z.ZodString;
    date: z.ZodDate;
    shift_start: z.ZodDate;
    shift_end: z.ZodDate;
    zone_id: z.ZodString;
    status: z.ZodDefault<z.ZodEnum<["scheduled", "active", "completed", "cancelled"]>>;
    breaks: z.ZodDefault<z.ZodArray<z.ZodObject<{
        start: z.ZodDate;
        end: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        start: Date;
        end: Date;
    }, {
        start: Date;
        end: Date;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    status: "scheduled" | "completed" | "cancelled" | "active";
    id: string;
    zone_id: string;
    shift_start: Date;
    shift_end: Date;
    date: Date;
    driver_id: string;
    breaks: {
        start: Date;
        end: Date;
    }[];
}, {
    zone_id: string;
    shift_start: Date;
    shift_end: Date;
    date: Date;
    driver_id: string;
    status?: "scheduled" | "completed" | "cancelled" | "active" | undefined;
    id?: string | undefined;
    breaks?: {
        start: Date;
        end: Date;
    }[] | undefined;
}>;
export type Schedule = z.infer<typeof ScheduleSchema>;
export declare const DispatchLogSchema: z.ZodObject<{
    id: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    request_id: z.ZodString;
    action: z.ZodString;
    actor: z.ZodString;
    details: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    timestamp: z.ZodDefault<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    id: string;
    request_id: string;
    action: string;
    actor: string;
    timestamp: Date;
    details?: Record<string, unknown> | undefined;
}, {
    request_id: string;
    action: string;
    actor: string;
    id?: string | undefined;
    details?: Record<string, unknown> | undefined;
    timestamp?: Date | undefined;
}>;
export type DispatchLog = z.infer<typeof DispatchLogSchema>;
export declare const SLABreachSchema: z.ZodObject<{
    request_id: z.ZodString;
    deadline: z.ZodDate;
    breach_at: z.ZodOptional<z.ZodDate>;
    warning_triggered: z.ZodDefault<z.ZodBoolean>;
    critical_triggered: z.ZodDefault<z.ZodBoolean>;
    breached: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    request_id: string;
    deadline: Date;
    warning_triggered: boolean;
    critical_triggered: boolean;
    breached: boolean;
    breach_at?: Date | undefined;
}, {
    request_id: string;
    deadline: Date;
    breach_at?: Date | undefined;
    warning_triggered?: boolean | undefined;
    critical_triggered?: boolean | undefined;
    breached?: boolean | undefined;
}>;
export type SLABreach = z.infer<typeof SLABreachSchema>;
//# sourceMappingURL=schema.d.ts.map