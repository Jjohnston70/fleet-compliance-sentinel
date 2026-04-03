import { z } from 'zod';
export declare enum OnboardingStatus {
    Pending = "pending",
    Provisioning = "provisioning",
    Complete = "complete",
    Partial = "partial",
    Failed = "failed",
    RolledBack = "rolled_back"
}
export declare enum OnboardingMode {
    Test = "test",
    Production = "production"
}
export declare enum QueueActionType {
    CreateUser = "create_user",
    AssignLicense = "assign_license",
    CreateDrive = "create_drive",
    CreateFolders = "create_folders",
    CreateLabels = "create_labels",
    GenerateDocs = "generate_docs"
}
export declare enum QueueItemStatus {
    Queued = "queued",
    Processing = "processing",
    Complete = "complete",
    Failed = "failed",
    Skipped = "skipped"
}
export declare enum DocumentType {
    Proposal = "proposal",
    MSA = "msa",
    SOW = "sow",
    Checklist = "checklist"
}
export declare enum AuditStatus {
    Success = "success",
    Failure = "failure",
    Rollback = "rollback"
}
export declare const EmployeeSchema: z.ZodObject<{
    id: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    name: z.ZodString;
    email: z.ZodString;
    department: z.ZodString;
    role: z.ZodString;
    license_type: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    email: string;
    department: string;
    role: string;
    license_type: string;
}, {
    name: string;
    email: string;
    department: string;
    role: string;
    license_type: string;
    id?: string | undefined;
}>;
export declare const ErrorLogEntrySchema: z.ZodObject<{
    message: z.ZodString;
    step: z.ZodString;
    timestamp: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    message: string;
    step: string;
    timestamp: Date;
}, {
    message: string;
    step: string;
    timestamp: Date;
}>;
export declare const OnboardingRequestSchema: z.ZodObject<{
    id: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    client_name: z.ZodString;
    contact_email: z.ZodString;
    employees: z.ZodArray<z.ZodObject<{
        id: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        name: z.ZodString;
        email: z.ZodString;
        department: z.ZodString;
        role: z.ZodString;
        license_type: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        email: string;
        department: string;
        role: string;
        license_type: string;
    }, {
        name: string;
        email: string;
        department: string;
        role: string;
        license_type: string;
        id?: string | undefined;
    }>, "many">;
    status: z.ZodDefault<z.ZodNativeEnum<typeof OnboardingStatus>>;
    mode: z.ZodDefault<z.ZodNativeEnum<typeof OnboardingMode>>;
    created_at: z.ZodDefault<z.ZodDate>;
    completed_at: z.ZodOptional<z.ZodDate>;
    error_log: z.ZodDefault<z.ZodArray<z.ZodObject<{
        message: z.ZodString;
        step: z.ZodString;
        timestamp: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        message: string;
        step: string;
        timestamp: Date;
    }, {
        message: string;
        step: string;
        timestamp: Date;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    id: string;
    status: OnboardingStatus;
    client_name: string;
    contact_email: string;
    employees: {
        id: string;
        name: string;
        email: string;
        department: string;
        role: string;
        license_type: string;
    }[];
    mode: OnboardingMode;
    created_at: Date;
    error_log: {
        message: string;
        step: string;
        timestamp: Date;
    }[];
    completed_at?: Date | undefined;
}, {
    client_name: string;
    contact_email: string;
    employees: {
        name: string;
        email: string;
        department: string;
        role: string;
        license_type: string;
        id?: string | undefined;
    }[];
    id?: string | undefined;
    status?: OnboardingStatus | undefined;
    mode?: OnboardingMode | undefined;
    created_at?: Date | undefined;
    completed_at?: Date | undefined;
    error_log?: {
        message: string;
        step: string;
        timestamp: Date;
    }[] | undefined;
}>;
export declare const ProvisioningQueueItemSchema: z.ZodObject<{
    id: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    request_id: z.ZodString;
    employee_email: z.ZodString;
    employee_id: z.ZodString;
    action: z.ZodNativeEnum<typeof QueueActionType>;
    status: z.ZodDefault<z.ZodNativeEnum<typeof QueueItemStatus>>;
    retry_count: z.ZodDefault<z.ZodNumber>;
    result: z.ZodDefault<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodAny>>>;
    created_at: z.ZodDefault<z.ZodDate>;
    processed_at: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    id: string;
    status: QueueItemStatus;
    created_at: Date;
    request_id: string;
    employee_email: string;
    employee_id: string;
    action: QueueActionType;
    retry_count: number;
    result: Record<string, any> | null;
    processed_at?: Date | undefined;
}, {
    request_id: string;
    employee_email: string;
    employee_id: string;
    action: QueueActionType;
    id?: string | undefined;
    status?: QueueItemStatus | undefined;
    created_at?: Date | undefined;
    retry_count?: number | undefined;
    result?: Record<string, any> | null | undefined;
    processed_at?: Date | undefined;
}>;
export declare const OnboardingConfigSchema: z.ZodObject<{
    id: z.ZodString;
    folder_template: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    label_template: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    license_type: z.ZodDefault<z.ZodString>;
    document_templates: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    auto_provision: z.ZodDefault<z.ZodBoolean>;
    notification_emails: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    id: string;
    license_type: string;
    folder_template: string[];
    label_template: string[];
    document_templates: string[];
    auto_provision: boolean;
    notification_emails: string[];
}, {
    id: string;
    license_type?: string | undefined;
    folder_template?: string[] | undefined;
    label_template?: string[] | undefined;
    document_templates?: string[] | undefined;
    auto_provision?: boolean | undefined;
    notification_emails?: string[] | undefined;
}>;
export declare const GeneratedDocumentSchema: z.ZodObject<{
    id: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    request_id: z.ZodString;
    document_type: z.ZodNativeEnum<typeof DocumentType>;
    title: z.ZodString;
    content_url: z.ZodString;
    generated_by: z.ZodDefault<z.ZodEnum<["vertex_ai", "template"]>>;
    created_at: z.ZodDefault<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    id: string;
    created_at: Date;
    request_id: string;
    document_type: DocumentType;
    title: string;
    content_url: string;
    generated_by: "vertex_ai" | "template";
}, {
    request_id: string;
    document_type: DocumentType;
    title: string;
    content_url: string;
    id?: string | undefined;
    created_at?: Date | undefined;
    generated_by?: "vertex_ai" | "template" | undefined;
}>;
export declare const AuditLogEntrySchema: z.ZodObject<{
    id: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    request_id: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    action: z.ZodString;
    actor: z.ZodString;
    target: z.ZodString;
    status: z.ZodNativeEnum<typeof AuditStatus>;
    details: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
    timestamp: z.ZodDefault<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    id: string;
    status: AuditStatus;
    timestamp: Date;
    action: string;
    actor: string;
    target: string;
    details: Record<string, any>;
    request_id?: string | null | undefined;
}, {
    status: AuditStatus;
    action: string;
    actor: string;
    target: string;
    id?: string | undefined;
    timestamp?: Date | undefined;
    request_id?: string | null | undefined;
    details?: Record<string, any> | undefined;
}>;
export type Employee = z.infer<typeof EmployeeSchema>;
export type ErrorLogEntry = z.infer<typeof ErrorLogEntrySchema>;
export type OnboardingRequest = z.infer<typeof OnboardingRequestSchema>;
export type ProvisioningQueueItem = z.infer<typeof ProvisioningQueueItemSchema>;
export type OnboardingConfig = z.infer<typeof OnboardingConfigSchema>;
export type GeneratedDocument = z.infer<typeof GeneratedDocumentSchema>;
export type AuditLogEntry = z.infer<typeof AuditLogEntrySchema>;
//# sourceMappingURL=schema.d.ts.map